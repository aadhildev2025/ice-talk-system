const Order = require('../models/Order');
const Table = require('../models/Table');
const Sale = require('../models/Sale');
const { emitSaleCompleted, emitTableUpdated } = require('../socket');
const { generateDemoSalesIfNeeded } = require('../utils/demoSalesService');

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
      status: { $nin: ['CANCELLED', 'REJECTED'] },
      isSettled: false,
      isDemo: req.user?.isDemo ? true : { $ne: true },
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
      isDemo: req.user?.isDemo ? true : { $ne: true },
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
      discountPercentage = 0,
      tax = 0,
      specialNotesExtra = 0,
      specialNoteCharges = [],
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
        status: { $nin: ['CANCELLED', 'REJECTED'] },
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
    const remainingCharges = Array.isArray(specialNoteCharges) ? [...specialNoteCharges] : [];

    orders.forEach((ord) => {
      subtotal += ord.subtotal || ord.total;
      orderIds.push(ord._id);
      orderNumbers.push(ord.orderNumber);

      ord.items.forEach((item) => {
        let itemNoteAmount = 0;
        if (item.specialInstructions && remainingCharges.length > 0) {
          const cIdx = remainingCharges.findIndex(
            (c) =>
              c.type === 'ITEM' &&
              c.name === item.name &&
              c.note === item.specialInstructions
          );
          if (cIdx >= 0) {
            itemNoteAmount = Number(remainingCharges[cIdx].amount) || 0;
            remainingCharges.splice(cIdx, 1);
          }
        }

        itemsSnapshot.push({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity + itemNoteAmount,
          department: item.department || 'KITCHEN',
          specialInstructions: item.specialInstructions || '',
          noteAmount: itemNoteAmount,
        });
      });
    });

    // Add remaining special note charges (e.g. order-level special notes or custom note charges)
    const extraNotesAmount = Number(specialNotesExtra) || 0;
    remainingCharges.forEach((c) => {
      const amt = Number(c.amount) || 0;
      if (amt > 0) {
        itemsSnapshot.push({
          name: `Special Note (${c.note || c.name || 'Custom'})`,
          quantity: 1,
          price: amt,
          total: amt,
          department: 'OTHER',
          specialInstructions: c.note || '',
          noteAmount: amt,
        });
      }
    });

    // Add special notes extra to overall subtotal
    subtotal += extraNotesAmount;

    let finalDiscount = Number(discount) || 0;
    let finalDiscountPercentage = Number(discountPercentage) || 0;

    if (finalDiscountPercentage > 0 && (!finalDiscount || finalDiscount === 0)) {
      finalDiscount = Math.round(((subtotal * finalDiscountPercentage) / 100) * 100) / 100;
    } else if (finalDiscount > 0 && finalDiscountPercentage === 0 && subtotal > 0) {
      finalDiscountPercentage = Math.round(((finalDiscount / subtotal) * 100) * 10) / 10;
    }

    const finalTotal = Math.max(0, subtotal - finalDiscount + Number(tax));
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
      discount: finalDiscount,
      discountPercentage: finalDiscountPercentage,
      specialNotesTotal: extraNotesAmount,
      tax: Number(tax) || 0,
      total: finalTotal,
      paymentMethod,
      paymentStatus: 'PAID',
      amountTendered: tendered,
      changeAmount: change,
      cashierId: req.user ? req.user._id : null,
      cashierNameSnapshot: req.user ? req.user.name : 'Admin',
      isDemo: Boolean(req.user?.isDemo),
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
        status: { $nin: ['CANCELLED', 'REJECTED'] },
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
// @desc    Get Sales History with date & search filters
// @route   GET /api/pos/sales
// @access  Private (Admin, SuperAdmin)
const getSalesHistory = async (req, res) => {
  try {
    const { timeframe, startDate, endDate, paymentMethod, search, limit = 50, page = 1 } = req.query;

    const filter = {
      isDemo: req.user?.isDemo ? true : { $ne: true },
    };

    // Date range filter
    const now = new Date();
    if (timeframe === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    } else if (timeframe === 'yesterday') {
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
      filter.createdAt = { $gte: startOfYesterday, $lte: endOfYesterday };
    } else if (timeframe === 'week' || timeframe === 'thisWeek') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0);
      filter.createdAt = { $gte: startOfWeek };
    } else if (timeframe === 'month' || timeframe === 'thisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filter.createdAt = { $gte: startOfMonth };
    } else if (timeframe === 'lastMonth') {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      filter.createdAt = { $gte: startOfLastMonth, $lte: endOfLastMonth };
    } else if (timeframe === 'year' || timeframe === 'thisYear') {
      const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      filter.createdAt = { $gte: startOfYear };
    } else if (timeframe === 'lastYear') {
      const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0);
      const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      filter.createdAt = { $gte: startOfLastYear, $lte: endOfLastYear };
    } else if (timeframe === 'all') {
      // No date filter - view all transactions from beginning
    } else if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = e;
      }
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
// @access  Private (Admin, SuperAdmin)
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

// @desc    Delete Sale Transaction (Super Admin Only)
// @route   DELETE /api/pos/sales/:id
// @access  Private (SuperAdmin ONLY)
const deleteSaleTransaction = async (req, res) => {
  try {
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. Only Super Admin can delete transactions.',
      });
    }

    const { id } = req.params;
    const sale = await Sale.findById(id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    // Clean up associated orders if any
    if (sale.orderIds && sale.orderIds.length > 0) {
      await Order.deleteMany({ _id: { $in: sale.orderIds } });
    }
    await Order.deleteMany({ saleId: sale._id });

    // Delete the sale record itself
    await Sale.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Sale transaction ${sale.saleNumber} was permanently deleted.`,
      deletedSaleId: id,
      saleNumber: sale.saleNumber,
    });
  } catch (error) {
    console.error('Delete sale transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction',
      error: error.message,
    });
  }
};

module.exports = {
  getTableActiveOrders,
  getChannelActiveOrders,
  settleTable,
  getSalesHistory,
  getSaleById,
  deleteSaleTransaction,
};
