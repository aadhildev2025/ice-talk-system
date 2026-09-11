const Order = require('../models/Order');
const Table = require('../models/Table');
const Sale = require('../models/Sale');
const { emitSaleCompleted, emitTableUpdated } = require('../socket');

// Helper to generate sequential sale invoice number
const getNextSaleNumber = async () => {
  const count = await Sale.countDocuments();
  const nextNum = count + 101; // Starts at INV-000101
  return `INV-${String(nextNum).padStart(6, '0')}`;
};

// @desc    Get active unpaid orders for a specific table
// @route   GET /api/pos/table/:tableId/orders
// @access  Private (Admin / Staff)
const getTableActiveOrders = async (req, res) => {
  try {
    const { tableId } = req.params;
    const table = await Table.findById(tableId);

    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    const orders = await Order.find({
      tableId: table._id,
      status: { $in: ['PENDING', 'APPROVED', 'PREPARING', 'READY'] },
      isSettled: false,
    }).sort({ createdAt: 1 });

    const totalAmount = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
    const subtotal = orders.reduce((sum, ord) => sum + (ord.subtotal || 0), 0);

    // Flatten all items across multiple orders for easy billing
    const aggregatedItems = [];
    orders.forEach((order) => {
      order.items.forEach((item) => {
        aggregatedItems.push({
          orderNumber: order.orderNumber,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          department: item.department,
          specialInstructions: item.specialInstructions,
        });
      });
    });

    res.json({
      success: true,
      table,
      ordersCount: orders.length,
      orders,
      aggregatedItems,
      subtotal,
      total: totalAmount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active unsettled orders for channels (Takeaway, UberEats, PickMe)
// @route   GET /api/pos/channel-orders
// @access  Private (Admin / Staff)
const getChannelActiveOrders = async (req, res) => {
  try {
    const { orderType } = req.query;
    const filter = {
      isSettled: false,
      status: { $in: ['PENDING', 'APPROVED', 'PREPARING', 'READY'] },
    };

    if (orderType && orderType !== 'ALL') {
      filter.orderType = orderType;
    } else {
      filter.orderType = { $in: ['TAKEAWAY', 'UBEREATS', 'PICKME'] };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Settle table or channel order(s) / Complete Sale in POS
// @route   POST /api/pos/settle-table (and /api/pos/settle-orders)
// @access  Private (Admin)
const settleTable = async (req, res) => {
  try {
    const {
      tableId,
      orderId,
      orderIds: reqOrderIds,
      paymentMethod,
      amountTendered,
      discount = 0,
      tax = 0,
    } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment Method (CASH, CARD, ONLINE) is required.',
      });
    }

    let orders = [];
    let table = null;
    let tableNameSnapshot = 'Takeaway';
    let orderType = 'DINE_IN';

    if (tableId) {
      table = await Table.findById(tableId);
      if (!table) {
        return res.status(404).json({ success: false, message: 'Table not found' });
      }
      tableNameSnapshot = table.name;
      orders = await Order.find({
        tableId: table._id,
        status: { $in: ['PENDING', 'APPROVED', 'PREPARING', 'READY'] },
        isSettled: false,
      });
    } else if (orderId || (reqOrderIds && reqOrderIds.length > 0)) {
      const targetIds = reqOrderIds && reqOrderIds.length > 0 ? reqOrderIds : [orderId];
      orders = await Order.find({
        _id: { $in: targetIds },
        isSettled: false,
      });
      if (orders.length > 0) {
        tableNameSnapshot = orders[0].tableNameSnapshot || 'Takeaway';
        orderType = orders[0].orderType || 'TAKEAWAY';
        if (orders[0].tableId) {
          table = await Table.findById(orders[0].tableId);
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either tableId or orderId(s) must be provided.',
      });
    }

    if (!orders || orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active unsettled orders found for this settlement.',
      });
    }

    // Calculate totals and collect items snapshot
    let subtotal = 0;
    const itemsSnapshot = [];
    const orderIds = [];
    const orderNumbers = [];

    orders.forEach((ord) => {
      subtotal += ord.subtotal || ord.total;
      orderIds.push(ord._id);
      orderNumbers.push(ord.orderNumber);

      ord.items.forEach((item) => {
        itemsSnapshot.push({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          department: item.department || 'KITCHEN',
        });
      });
    });

    const finalTotal = Math.max(0, subtotal - Number(discount) + Number(tax));
    const tendered = Number(amountTendered) || finalTotal;
    const change = paymentMethod === 'CASH' ? Math.max(0, tendered - finalTotal) : 0;

    const saleNumber = await getNextSaleNumber();

    // Create Sale record with permanent snapshot
    const sale = await Sale.create({
      saleNumber,
      orderType: orderType || (table ? 'DINE_IN' : 'TAKEAWAY'),
      tableId: table ? table._id : undefined,
      tableNameSnapshot,
      orderIds,
      orderNumbers,
      items: itemsSnapshot,
      subtotal,
      discount: Number(discount),
      tax: Number(tax),
      total: finalTotal,
      paymentMethod,
      paymentStatus: 'PAID',
      amountTendered: tendered,
      changeAmount: change,
      cashierId: req.user ? req.user._id : null,
      cashierNameSnapshot: req.user ? req.user.name : 'Admin',
    });

    // Mark all orders as COMPLETED and settled
    await Order.updateMany(
      { _id: { $in: orderIds } },
      {
        $set: {
          status: 'COMPLETED',
          isSettled: true,
          completedAt: new Date(),
          saleId: sale._id,
        },
      }
    );

    // Free up table back to AVAILABLE if applicable and no remaining active orders
    if (table) {
      const remainingOrders = await Order.countDocuments({
        tableId: table._id,
        isSettled: false,
        status: { $in: ['PENDING', 'APPROVED', 'PREPARING', 'READY'] },
      });
      if (remainingOrders === 0) {
        table.status = 'AVAILABLE';
        await table.save();
        emitTableUpdated(table);
      }
    }

    // Broadcast sale completion
    emitSaleCompleted(sale, table ? [table] : []);

    res.status(201).json({
      success: true,
      message: `Sale ${saleNumber} completed successfully.`,
      sale,
    });
  } catch (error) {
    console.error('Settle sale error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Sales History with date & search filters
// @route   GET /api/pos/sales
// @access  Private (Admin)
const getSalesHistory = async (req, res) => {
  try {
    const { timeframe, startDate, endDate, paymentMethod, search, limit = 50, page = 1 } = req.query;
    const filter = {};

    // Date range filter
    const now = new Date();
    if (timeframe === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filter.createdAt = { $gte: startOfDay };
    } else if (timeframe === 'yesterday') {
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filter.createdAt = { $gte: startOfYesterday, $lt: endOfYesterday };
    } else if (timeframe === 'week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - 7));
      filter.createdAt = { $gte: startOfWeek };
    } else if (timeframe === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filter.createdAt = { $gte: startOfMonth };
    } else if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    if (paymentMethod && paymentMethod !== 'ALL') {
      filter.paymentMethod = paymentMethod;
    }

    if (search) {
      filter.$or = [
        { saleNumber: { $regex: search, $options: 'i' } },
        { tableNameSnapshot: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const sales = await Sale.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalCount = await Sale.countDocuments(filter);
    const totalRevenue = (await Sale.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]))[0]?.total || 0;

    res.json({
      success: true,
      count: sales.length,
      totalCount,
      totalRevenue,
      page: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)),
      sales,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single sale receipt by ID
// @route   GET /api/pos/sales/:id
// @access  Private (Admin)
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale receipt not found' });
    }
    res.json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTableActiveOrders,
  getChannelActiveOrders,
  settleTable,
  getSalesHistory,
  getSaleById,
};
