const Table = require('../models/Table');
const { emitSaleCompleted, emitTableUpdated } = require('../socket');
const localDataService = require('../services/localDataService');

// @desc    Get active unpaid orders for a specific table
// @route   GET /api/pos/table/:tableId/orders
// @access  Private (Admin / Staff)
const getTableActiveOrders = async (req, res) => {
  try {
    const { tableId } = req.params;
    let table = null;

    try {
      table = await Table.findById(tableId);
    } catch {
      // MongoDB offline fallback
    }

    if (!table) {
      table = { _id: tableId, name: `Table ${tableId}` };
    }

    const allOrders = localDataService.getOrders({ tableId });
    const activeOrders = allOrders.filter(
      (o) => !o.isSettled && !['CANCELLED', 'REJECTED'].includes(o.status)
    );

    activeOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const totalAmount = activeOrders.reduce((sum, ord) => sum + (ord.total || 0), 0);
    const subtotal = activeOrders.reduce((sum, ord) => sum + (ord.subtotal || ord.total || 0), 0);

    // Flatten all items across multiple orders for billing
    const aggregatedItems = [];
    activeOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        aggregatedItems.push({
          orderNumber: order.orderNumber,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total || item.price * item.quantity,
          department: item.department || 'KITCHEN',
          specialInstructions: item.specialInstructions || '',
        });
      });
    });

    res.json({
      success: true,
      table,
      ordersCount: activeOrders.length,
      orders: activeOrders,
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
    const allOrders = localDataService.getOrders();

    let active = allOrders.filter(
      (o) => !o.isSettled && ['PENDING', 'APPROVED', 'PREPARING', 'READY'].includes(o.status)
    );

    if (orderType && orderType !== 'ALL') {
      active = active.filter((o) => o.orderType === orderType);
    } else {
      active = active.filter((o) => ['TAKEAWAY', 'UBEREATS', 'PICKME'].includes(o.orderType));
    }

    active.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: active.length,
      orders: active,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Settle table or channel order(s) / Complete Sale in POS (saves to local computer storage)
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
      try {
        table = await Table.findById(tableId);
      } catch {}
      tableNameSnapshot = table ? table.name : `Table ${tableId}`;
      const allOrders = localDataService.getOrders({ tableId });
      orders = allOrders.filter(
        (o) => !o.isSettled && !['CANCELLED', 'REJECTED'].includes(o.status)
      );
    } else if (orderId || (reqOrderIds && reqOrderIds.length > 0)) {
      const targetIds = new Set(
        (reqOrderIds && reqOrderIds.length > 0 ? reqOrderIds : [orderId]).map(String)
      );
      const allOrders = localDataService.getOrders();
      orders = allOrders.filter((o) => targetIds.has(String(o._id)) && !o.isSettled);

      if (orders.length > 0) {
        tableNameSnapshot = orders[0].tableNameSnapshot || orders[0].tableName || 'Takeaway';
        orderType = orders[0].orderType || 'TAKEAWAY';
        if (orders[0].tableId) {
          try {
            table = await Table.findById(orders[0].tableId);
          } catch {}
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
      subtotal += ord.subtotal || ord.total || 0;
      orderIds.push(ord._id);
      if (ord.orderNumber) orderNumbers.push(ord.orderNumber);

      (ord.items || []).forEach((item) => {
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
          total: (item.price * item.quantity) + itemNoteAmount,
          department: item.department || 'KITCHEN',
          specialInstructions: item.specialInstructions || '',
          noteAmount: itemNoteAmount,
        });
      });
    });

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

    const saleNumber = localDataService.getNextSaleNumber();

    // Create Sale record in local computer storage
    const sale = localDataService.saveSale({
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
      cashierNameSnapshot: req.user ? req.user.name : 'Staff',
      isDemo: Boolean(req.user?.isDemo),
    });

    // Mark orders as COMPLETED and settled in local storage
    orderIds.forEach((id) => {
      localDataService.updateOrder(id, {
        status: 'COMPLETED',
        isSettled: true,
        completedAt: new Date().toISOString(),
        saleId: sale._id,
      });
    });

    // Update MongoDB Table status back to AVAILABLE if applicable
    if (table) {
      try {
        const remainingOrders = localDataService.getOrders({ tableId: table._id }).filter(
          (o) => !o.isSettled && !['CANCELLED', 'REJECTED'].includes(o.status)
        );
        if (remainingOrders.length === 0) {
          table.status = 'AVAILABLE';
          await table.save();
          emitTableUpdated(table);
        }
      } catch {}
    }

    // Broadcast sale completion via Socket
    emitSaleCompleted(sale, table ? [table] : []);

    res.status(201).json({
      success: true,
      message: `Sale ${saleNumber} completed successfully (Stored Locally).`,
      sale,
    });
  } catch (error) {
    console.error('Settle sale error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Sales History with date & search filters (from local computer storage)
// @route   GET /api/pos/sales
// @access  Private (Admin, SuperAdmin)
const getSalesHistory = async (req, res) => {
  try {
    const { timeframe, startDate, endDate, paymentMethod, search, limit = 50, page = 1 } = req.query;

    let sales = localDataService.getSales({
      timeframe,
      startDate,
      endDate,
      paymentMethod,
      search,
    });

    sales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalCount = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);

    const lim = Number(limit);
    const pg = Number(page);
    const skip = (pg - 1) * lim;
    const paginated = sales.slice(skip, skip + lim);

    res.json({
      success: true,
      count: paginated.length,
      totalCount,
      totalRevenue,
      page: pg,
      totalPages: Math.ceil(totalCount / lim) || 1,
      sales: paginated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single sale receipt by ID (from local computer storage)
// @route   GET /api/pos/sales/:id
// @access  Private (Admin, SuperAdmin)
const getSaleById = async (req, res) => {
  try {
    const sale = localDataService.getSaleById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale receipt not found' });
    }
    res.json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Sale Transaction (from local computer storage)
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
    const deleted = localDataService.deleteSale(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    res.json({
      success: true,
      message: `Sale transaction ${deleted.saleNumber || id} was permanently deleted from local storage.`,
      deletedSaleId: id,
      saleNumber: deleted.saleNumber,
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
