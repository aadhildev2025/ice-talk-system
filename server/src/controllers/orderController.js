const mongoose = require('mongoose');
const Order = require('../models/Order');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const localDataService = require('../services/localDataService');
const cloudSyncService = require('../services/cloudSyncService');
const {
  emitOrderCreated,
  emitOrderApproved,
  emitOrderRejected,
  emitOrderCancelled,
  emitPrepTaskUpdated,
  emitOrderReady,
  emitTableUpdated,
} = require('../socket');

// Helper: Verify if request is authorized by Super Admin
const verifySuperAdminAccess = async (req) => {
  if (req.user?.role === 'superadmin' || req.user?.username === 'superadmin' || req.user?.username === 'dsuper') {
    return true;
  }
  const password = req.body?.superAdminPassword || req.headers['x-superadmin-password'];
  if (!password) return false;
  const cleanPass = String(password).trim();
  if (cleanPass === 'superadmin123' || cleanPass === 'dsuper123') return true;

  try {
    const mongoose = require('mongoose');
    if (mongoose.connection && mongoose.connection.readyState >= 1) {
      const superUsers = await User.find({ role: 'superadmin', status: 'ACTIVE' });
      for (const u of superUsers) {
        if (await u.matchPassword(cleanPass)) return true;
      }
    }
  } catch (_) {}
  return false;
};

// Helper: Detect KOT preparation section directly from menu item category or explicit department
const detectKOTSection = (categoryName, explicitDept = null) => {
  const dept = (explicitDept || '').trim().toUpperCase();

  if (['JUICE', 'BUN', 'KITCHEN', 'OTHER', 'NONE'].includes(dept)) {
    return dept;
  }
  if (
    dept === 'GROCERY' ||
    dept === 'RETAIL' ||
    dept === 'NON' ||
    dept === 'NO_PRINT' ||
    dept === 'RECEIPT_ONLY'
  ) {
    return 'NONE';
  }

  const cat = (categoryName || '').trim().toLowerCase();

  // Pre-packaged grocery & retail products do not need KOT kitchen preparation slips
  if (
    cat.includes('grocery') ||
    cat.includes('retail') ||
    cat.includes('packaged') ||
    cat.includes('supermarket') ||
    cat.includes('biscuit')
  ) {
    return 'NONE';
  }

  if (
    cat.includes('juice') ||
    cat.includes('shake') ||
    cat.includes('milkshake') ||
    cat.includes('smoothie') ||
    cat.includes('mojito') ||
    cat.includes('falooda') ||
    cat.includes('ice cream') ||
    cat.includes('icecream') ||
    cat.includes('dessert') ||
    cat.includes('sweet') ||
    cat.includes('drink') ||
    cat.includes('beverage') ||
    cat.includes('tea') ||
    cat.includes('coffee') ||
    cat.includes('brownie') ||
    cat.includes('cake') ||
    cat.includes('sundae') ||
    cat.includes('frappe')
  ) {
    return 'JUICE';
  }

  if (
    cat.includes('bun') ||
    cat.includes('short eat') ||
    cat.includes('shorteat') ||
    cat.includes('bakery') ||
    cat.includes('roll') ||
    cat.includes('pastry') ||
    cat.includes('patties') ||
    cat.includes('patty') ||
    cat.includes('samosa') ||
    cat.includes('sandwich') ||
    cat.includes('snack')
  ) {
    return 'BUN';
  }

  if (
    cat.includes('rice') ||
    cat.includes('kottu') ||
    cat.includes('kotthu') ||
    cat.includes('burger') ||
    cat.includes('noodle') ||
    cat.includes('pasta') ||
    cat.includes('curry') ||
    cat.includes('gravy') ||
    cat.includes('hot') ||
    cat.includes('meal') ||
    cat.includes('main') ||
    cat.includes('kitchen') ||
    cat.includes('soup') ||
    cat.includes('appetizer') ||
    cat.includes('fried') ||
    cat.includes('bbq') ||
    cat.includes('grill') ||
    cat.includes('chicken') ||
    cat.includes('beef') ||
    cat.includes('seafood')
  ) {
    return 'KITCHEN';
  }

  return 'KITCHEN';
};

// @desc    Create new order (Waiter, Cashier, or Admin POS) -> Saves to local computer storage
// @route   POST /api/orders
// @access  Private (Staff)
const createOrder = async (req, res) => {
  try {
    const {
      items,
      tableId,
      orderType = 'DINE_IN',
      customerName = '',
      customerPhone = '',
      channelOrderRef = '',
      autoApprove = false,
      priority = 'NORMAL',
      specialInstructions = '',
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required to create an order.',
      });
    }

    let table = null;
    let tableNameSnapshot = req.body.tableNameSnapshot || req.body.tableName;

    if (orderType === 'DINE_IN') {
      if (!tableId && !tableNameSnapshot) {
        return res.status(400).json({
          success: false,
          message: 'Table is required for Dine-in orders.',
        });
      }
      if (tableId) {
        try {
          table = await Table.findById(tableId);
        } catch {}
      }
      if (!tableNameSnapshot) {
        tableNameSnapshot = table ? table.name : (tableId ? `Table ${tableId}` : 'Table');
      }
    } else if (orderType === 'UBEREATS') {
      tableNameSnapshot = tableNameSnapshot || (channelOrderRef ? `UberEats (${channelOrderRef})` : 'UberEats');
    } else if (orderType === 'PICKME') {
      tableNameSnapshot = tableNameSnapshot || (channelOrderRef ? `PickMe (${channelOrderRef})` : 'PickMe');
    } else {
      tableNameSnapshot = tableNameSnapshot || (customerName ? `Takeaway (${customerName})` : 'Takeaway');
    }

    const resolvedWaiterName =
      req.body.waiterNameSnapshot ||
      req.body.waiterName ||
      (req.user ? (req.user.name || req.user.username) : '') ||
      'Staff';

    // Process items & enforce pricing
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      let menuItem = null;
      try {
        menuItem = await MenuItem.findById(item.menuItemId || item._id);
      } catch {}

      const name = item.name || (menuItem ? menuItem.name : 'Item');
      const portion = item.portion || (item.portionName || 'Portion');
      const price = item.price !== undefined ? Number(item.price) : (menuItem ? menuItem.price : 0);
      const category = (menuItem && menuItem.category) ? menuItem.category : (item.category || '');
      const dept = (menuItem && menuItem.department) ? menuItem.department : (item.department || '');
      const isGrocery = Boolean(item.isGrocery) || Boolean(item.groceryItemId) || String(category).toLowerCase().includes('grocery') || dept === 'GROCERY' || dept === 'RETAIL';
      const detectedDept = isGrocery ? 'NONE' : detectKOTSection(category, dept);
      const qty = Math.max(1, Number(item.quantity) || 1);
      const itemTotal = price * qty;
      subtotal += itemTotal;

      processedItems.push({
        menuItemId: item.menuItemId || item._id,
        groceryItemId: item.groceryItemId || (isGrocery ? (item.menuItemId || item._id) : undefined),
        isGrocery,
        barcode: item.barcode || '',
        name,
        portion,
        quantity: qty,
        price,
        total: itemTotal,
        department: detectedDept,
        category,
        specialInstructions: item.specialInstructions || '',
        preparationStatus: 'PENDING',
      });
    }

    // Align next order number with cloud database to guarantee zero sequence collisions
    let orderNumber = null;
    try {
      if (mongoose.connection && mongoose.connection.readyState >= 1) {
        const lastDbOrder = await Order.findOne({}).sort({ orderNumber: -1 }).select('orderNumber').lean();
        if (lastDbOrder && typeof lastDbOrder.orderNumber === 'number') {
          orderNumber = lastDbOrder.orderNumber + 1;
        }
      }
    } catch (_) {}
    if (!orderNumber) {
      orderNumber = localDataService.getNextOrderNumber();
    }

    const shouldAutoApprove = Boolean(autoApprove === true || autoApprove === 'true');

    let round = 1;
    if (table) {
      const activeTableOrders = localDataService.getOrders({ tableId: table._id }).filter(
        (o) => !o.isSettled && ['APPROVED', 'PREPARING', 'READY', 'COMPLETED'].includes(o.status)
      );
      round = activeTableOrders.length + 1;
    }

    // Generate a valid 24-character ObjectId string for compatibility with both MongoDB and local storage
    const newOrderId = new mongoose.Types.ObjectId().toString();

    // Save order to local computer storage
    const order = localDataService.saveOrder({
      _id: newOrderId,
      orderNumber,
      orderType,
      tableId: table ? table._id : (tableId || undefined),
      tableName: tableNameSnapshot,
      tableNameSnapshot,
      customerName,
      customerPhone,
      channelOrderRef,
      waiterId: req.user ? req.user._id : null,
      waiterName: resolvedWaiterName,
      waiterNameSnapshot: resolvedWaiterName,
      items: processedItems,
      subtotal,
      total: subtotal,
      round,
      status: shouldAutoApprove ? 'APPROVED' : 'PENDING',
      approvedAt: shouldAutoApprove ? new Date().toISOString() : undefined,
      priority: priority || 'NORMAL',
      specialInstructions: specialInstructions || '',
      isDemo: Boolean(req.user?.isDemo),
    });

    // Push order to MongoDB Atlas cloud database
    try {
      await cloudSyncService.pushOrderToCloud(order);
    } catch (pushErr) {
      console.warn('[CloudSync Order Push]:', pushErr.message);
    }

    // Update MongoDB Table status to OCCUPIED if table exists
    if (table) {
      try {
        table.status = 'OCCUPIED';
        await table.save();
        emitTableUpdated(table);
      } catch {}
    }

    // If auto-approved, create preparation tasks immediately (Grocery items do not need kitchen preparation tasks)
    let createdTasks = [];
    if (shouldAutoApprove) {
      const departmentGroups = {};
      order.items.forEach((item) => {
        const dept = detectKOTSection(item.category, item.department);
        if (item.isGrocery || item.groceryItemId || dept === 'NONE') return;
        if (!departmentGroups[dept]) {
          departmentGroups[dept] = [];
        }
        departmentGroups[dept].push({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          category: item.category || '',
          specialInstructions: item.specialInstructions,
          isReady: false,
        });
      });

      for (const dept of Object.keys(departmentGroups)) {
        const task = localDataService.savePrepTask({
          orderId: order._id,
          orderNumber: order.orderNumber,
          orderType: order.orderType || 'DINE_IN',
          tableId: order.tableId,
          tableNameSnapshot: order.tableNameSnapshot,
          department: dept,
          items: departmentGroups[dept],
          status: 'PENDING',
          specialInstructions: order.specialInstructions,
        });
        createdTasks.push(task);
      }

      emitOrderApproved(order, createdTasks);
    } else {
      emitOrderCreated(order);
    }

    res.status(201).json({
      success: true,
      message: `Order #${orderNumber} placed successfully.`,
      order,
      preparationTasks: createdTasks,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve order (Admin) -> Generates preparation tasks & prep slip
// @route   POST /api/orders/:id/approve
// @access  Private (Admin)
const approveOrder = async (req, res) => {
  try {
    const order = localDataService.getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve order with status '${order.status}'`,
      });
    }

    const updated = localDataService.updateOrder(order._id, {
      status: 'APPROVED',
      approvedAt: new Date().toISOString(),
      tableName: order.tableNameSnapshot || order.tableName,
      tableNameSnapshot: order.tableNameSnapshot || order.tableName,
      waiterName: order.waiterNameSnapshot || order.waiterName,
      waiterNameSnapshot: order.waiterNameSnapshot || order.waiterName,
    });

    // Update status in MongoDB Atlas
    try {
      await cloudSyncService.updateOrderStatusInCloud(updated._id, {
        status: 'APPROVED',
        approvedAt: new Date(),
      });
    } catch (e) {
      console.warn('[CloudSync Approve Warning]:', e.message);
    }

    // Group items by department to create Preparation Tasks
    const departmentGroups = {};
    updated.items.forEach((item) => {
      const dept = detectKOTSection(item.category, item.department);
      if (dept === 'NONE') return;
      if (!departmentGroups[dept]) {
        departmentGroups[dept] = [];
      }
      departmentGroups[dept].push({
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        category: item.category || '',
        specialInstructions: item.specialInstructions,
        isReady: false,
      });
    });

    const createdTasks = [];
    for (const dept of Object.keys(departmentGroups)) {
      const task = localDataService.savePrepTask({
        orderId: updated._id,
        orderNumber: updated.orderNumber,
        orderType: updated.orderType || 'DINE_IN',
        tableId: updated.tableId,
        tableNameSnapshot: updated.tableNameSnapshot,
        department: dept,
        items: departmentGroups[dept],
        status: 'PENDING',
        specialInstructions: updated.specialInstructions,
      });
      createdTasks.push(task);
    }

    // Notify real-time
    emitOrderApproved(updated, createdTasks);

    res.json({
      success: true,
      message: `Order #${updated.orderNumber} approved. Short preparation slip generated.`,
      order: updated,
      preparationTasks: createdTasks,
    });
  } catch (error) {
    console.error('Approve order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject order (Admin)
// @route   POST /api/orders/:id/reject
// @access  Private (Admin)
const rejectOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = localDataService.getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updated = localDataService.updateOrder(order._id, {
      status: 'REJECTED',
      rejectionReason: reason || 'Rejected by Admin',
    });

    // Update status in MongoDB Atlas
    try {
      await cloudSyncService.updateOrderStatusInCloud(updated._id, {
        status: 'REJECTED',
        rejectionReason: reason || 'Rejected by Admin',
      });
    } catch (e) {
      console.warn('[CloudSync Reject Warning]:', e.message);
    }

    emitOrderRejected(updated);

    res.json({
      success: true,
      message: `Order #${updated.orderNumber} has been rejected.`,
      order: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order (Admin/Waiter)
// @route   POST /api/orders/:id/cancel
// @access  Private (Staff)
const cancelOrder = async (req, res) => {
  try {
    const { reason, cancelCode } = req.body;
    let order = localDataService.getOrderById(req.params.id);
    if (!order) {
      try {
        order = await Order.findById(req.params.id);
      } catch (_) {}
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isTakeaway = (order.orderType || '').toUpperCase() === 'TAKEAWAY';

    if (isTakeaway) {
      // For Takeaway orders: requires secret takeaway cancellation code known only to Super Admin
      const currentCancelCode = localDataService.getTakeawayCancelCode();
      const providedCode = String(
        cancelCode ||
        req.headers['x-cancel-code'] ||
        req.body?.superAdminPassword ||
        req.headers['x-superadmin-password'] ||
        ''
      ).trim();
      const isSuper = await verifySuperAdminAccess(req);

      if (providedCode !== currentCancelCode && !isSuper) {
        return res.status(403).json({
          success: false,
          message: 'Invalid takeaway cancellation code. Only Super Admin has access to this code.',
        });
      }
    } else {
      // For dine-in / non-takeaway orders: standard Super Admin authorization check
      const isSuperAdminAuthorized = await verifySuperAdminAccess(req);
      if (!isSuperAdminAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Super Admin authorization is required to cancel an order.',
        });
      }
    }

    if (order.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Completed and settled orders cannot be cancelled directly.',
      });
    }

    if (order.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled.',
      });
    }

    const updated = localDataService.updateOrder(order._id, {
      status: 'CANCELLED',
      cancellationReason: reason || `Cancelled by ${req.user?.role === 'admin' ? 'Admin' : 'Waiter'}`,
      cancelledAt: new Date().toISOString(),
    });

    // Update status in MongoDB Atlas
    try {
      await cloudSyncService.updateOrderStatusInCloud(updated._id, {
        status: 'CANCELLED',
        cancellationReason: reason || `Cancelled by ${req.user?.role === 'admin' ? 'Admin' : 'Waiter'}`,
        cancelledAt: new Date(),
      });
    } catch (e) {
      console.warn('[CloudSync Cancel Warning]:', e.message);
    }

    // Check table occupancy
    if (order.tableId) {
      try {
        const remainingActive = localDataService.getOrders({ tableId: order.tableId }).filter(
          (o) => String(o._id) !== String(order._id) && String(o.orderNumber) !== String(order.orderNumber) && ['PENDING', 'APPROVED', 'PREPARING', 'READY'].includes(o.status)
        );

        if (remainingActive.length === 0) {
          const table = await Table.findById(order.tableId);
          if (table && table.status === 'OCCUPIED') {
            table.status = 'AVAILABLE';
            await table.save();
            emitTableUpdated(table);
          }
        }
      } catch {}
    }

    // Cancel all prep tasks associated with this order
    try {
      const prepTasks = localDataService.getPrepTasks({ orderId: order._id });
      prepTasks.forEach((t) => {
        localDataService.updatePrepTask(t._id, { status: 'CANCELLED' });
        emitPrepTaskUpdated({ ...t, status: 'CANCELLED' });
      });
    } catch (e) {
      console.warn('Failed cancelling prep tasks:', e.message);
    }

    emitOrderCancelled(updated);

    res.json({
      success: true,
      message: `Order #${updated.orderNumber} has been cancelled successfully.`,
      order: updated,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update / modify items in an existing order (Customer changed mind after KOT)
// @route   PUT /api/orders/:id/items
// @access  Private (Staff / Admin)
const updateOrderItems = async (req, res) => {
  try {
    const { items, reason } = req.body;
    const order = localDataService.getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: `Cannot modify an order that is ${order.status.toLowerCase()}.`,
      });
    }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid items array provided.',
      });
    }

    // Removing item entries requires Super Admin authorization or valid Cancellation Code
    if (order.items && items.length < order.items.length) {
      const isSuperAdminAuthorized = await verifySuperAdminAccess(req);
      const currentCancelCode = localDataService.getTakeawayCancelCode();
      const providedCode = String(
        req.body?.cancelCode ||
        req.headers['x-cancel-code'] ||
        req.body?.superAdminPassword ||
        req.headers['x-superadmin-password'] ||
        ''
      ).trim();

      const isCancelCodeValid = Boolean(providedCode && providedCode === currentCancelCode);

      if (!isSuperAdminAuthorized && !isCancelCodeValid) {
        return res.status(403).json({
          success: false,
          message: 'Valid cancellation code or Super Admin authorization is required to remove item entries from an active order.',
        });
      }
    }

    // If all items were removed, cancel the order completely
    if (items.length === 0) {
      const updated = localDataService.updateOrder(order._id, {
        status: 'CANCELLED',
        cancellationReason: reason || 'All items removed from order',
        cancelledAt: new Date().toISOString(),
      });

      if (order.tableId) {
        try {
          const remainingActive = localDataService.getOrders({ tableId: order.tableId }).filter(
            (o) => String(o._id) !== String(order._id) && ['PENDING', 'APPROVED', 'PREPARING', 'READY'].includes(o.status)
          );
          if (remainingActive.length === 0) {
            const table = await Table.findById(order.tableId);
            if (table && table.status === 'OCCUPIED') {
              table.status = 'AVAILABLE';
              await table.save();
              emitTableUpdated(table);
            }
          }
        } catch {}
      }

      try {
        const prepTasks = localDataService.getPrepTasks({ orderId: order._id });
        prepTasks.forEach((t) => {
          localDataService.updatePrepTask(t._id, { status: 'CANCELLED' });
          emitPrepTaskUpdated({ ...t, status: 'CANCELLED' });
        });
      } catch (e) {}

      emitOrderCancelled(updated);

      return res.json({
        success: true,
        message: `All items were removed. Order #${order.orderNumber} was cancelled.`,
        order: updated,
        cancelled: true,
      });
    }

    // Process updated items
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      let menuItem = null;
      try {
        menuItem = await MenuItem.findById(item.menuItemId || item._id);
      } catch {}

      const name = item.name || (menuItem ? menuItem.name : 'Item');
      const portion = item.portion || (item.portionName || 'Portion');
      const price = item.price !== undefined ? Number(item.price) : (menuItem ? menuItem.price : 0);
      const category = (menuItem && menuItem.category) ? menuItem.category : (item.category || '');
      const dept = (menuItem && menuItem.department) ? menuItem.department : (item.department || '');
      const detectedDept = detectKOTSection(category, dept);
      const qty = Math.max(1, Number(item.quantity) || 1);
      const itemTotal = price * qty;
      subtotal += itemTotal;

      processedItems.push({
        menuItemId: item.menuItemId || item._id,
        name,
        portion,
        quantity: qty,
        price,
        total: itemTotal,
        department: detectedDept,
        category,
        specialInstructions: item.specialInstructions || '',
        preparationStatus: item.preparationStatus || 'PENDING',
      });
    }

    const total = subtotal;

    const isAppend = Boolean(req.body.isAppend || (req.body.newItems && req.body.newItems.length > 0));
    const newRound = isAppend ? ((order.round || 1) + 1) : (order.round || 1);

    const updated = localDataService.updateOrder(order._id, {
      items: processedItems,
      subtotal,
      total,
      round: newRound,
      specialInstructions: req.body.specialInstructions !== undefined ? req.body.specialInstructions : order.specialInstructions,
      notes: reason ? `${order.notes || ''} [${isAppend ? 'Round ' + newRound : 'Modified'}: ${reason}]`.trim() : order.notes,
      updatedAt: new Date().toISOString(),
    });

    try {
      await cloudSyncService.pushOrderToCloud(updated);
    } catch (_) {}

    // Update prep tasks: if appending, generate tasks only for newly added items and leave existing tasks active
    try {
      let itemsToPrep = updated.items;
      if (isAppend) {
        if (req.body.newItems && Array.isArray(req.body.newItems) && req.body.newItems.length > 0) {
          itemsToPrep = req.body.newItems;
        }
      } else {
        const existingTasks = localDataService.getPrepTasks({ orderId: order._id });
        existingTasks.forEach((t) => {
          localDataService.updatePrepTask(t._id, { status: 'CANCELLED' });
          emitPrepTaskUpdated({ ...t, status: 'CANCELLED' });
        });
      }

      const departmentGroups = {};
      itemsToPrep.forEach((item) => {
        const dept = detectKOTSection(item.category, item.department);
        if (item.isGrocery || item.groceryItemId || dept === 'NONE') return;
        if (!departmentGroups[dept]) {
          departmentGroups[dept] = [];
        }
        departmentGroups[dept].push({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          category: item.category || '',
          specialInstructions: item.specialInstructions,
          isReady: false,
        });
      });

      const createdTasks = [];
      for (const dept of Object.keys(departmentGroups)) {
        const task = localDataService.savePrepTask({
          orderId: updated._id,
          orderNumber: updated.orderNumber,
          orderType: updated.orderType || 'DINE_IN',
          tableId: updated.tableId,
          tableNameSnapshot: updated.tableNameSnapshot,
          department: dept,
          items: departmentGroups[dept],
          status: 'PENDING',
          round: newRound,
          specialInstructions: updated.specialInstructions,
        });
        createdTasks.push(task);
      }

      emitOrderApproved(updated, createdTasks);
    } catch (e) {
      console.warn('Syncing prep tasks for updated order failed:', e.message);
    }

    res.json({
      success: true,
      message: `Order #${updated.orderNumber} updated successfully.`,
      order: updated,
    });
  } catch (error) {
    console.error('Update order items error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove an individual item from order
// @route   DELETE /api/orders/:id/items/:itemIndex
// @access  Private (Staff / Admin)
const removeOrderItem = async (req, res) => {
  try {
    const isSuperAdminAuthorized = await verifySuperAdminAccess(req);
    const currentCancelCode = localDataService.getTakeawayCancelCode();
    const providedCode = String(
      req.body?.cancelCode ||
      req.headers['x-cancel-code'] ||
      req.query?.cancelCode ||
      req.body?.superAdminPassword ||
      req.headers['x-superadmin-password'] ||
      ''
    ).trim();

    const isCancelCodeValid = Boolean(providedCode && providedCode === currentCancelCode);

    if (!isSuperAdminAuthorized && !isCancelCodeValid) {
      return res.status(403).json({
        success: false,
        message: 'Valid cancellation code or Super Admin authorization is required to remove an item entry from an active order.',
      });
    }

    const { id, itemIndex } = req.params;
    const order = localDataService.getOrderById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: `Cannot modify an order that is ${order.status.toLowerCase()}.`,
      });
    }

    const idx = parseInt(itemIndex, 10);
    if (isNaN(idx) || idx < 0 || idx >= (order.items || []).length) {
      return res.status(400).json({ success: false, message: 'Invalid item index.' });
    }

    const remainingItems = [...order.items];
    remainingItems.splice(idx, 1);

    if (remainingItems.length === 0) {
      // If no items remain, cancel the whole order
      const updated = localDataService.updateOrder(order._id, {
        status: 'CANCELLED',
        cancellationReason: 'All items removed by customer request',
        cancelledAt: new Date().toISOString(),
      });

      if (order.tableId) {
        try {
          const remainingActive = localDataService.getOrders({ tableId: order.tableId }).filter(
            (o) => String(o._id) !== String(order._id) && ['PENDING', 'APPROVED', 'PREPARING', 'READY'].includes(o.status)
          );
          if (remainingActive.length === 0) {
            const table = await Table.findById(order.tableId);
            if (table && table.status === 'OCCUPIED') {
              table.status = 'AVAILABLE';
              await table.save();
              emitTableUpdated(table);
            }
          }
        } catch {}
      }

      try {
        const prepTasks = localDataService.getPrepTasks({ orderId: order._id });
        prepTasks.forEach((t) => {
          localDataService.updatePrepTask(t._id, { status: 'CANCELLED' });
          emitPrepTaskUpdated({ ...t, status: 'CANCELLED' });
        });
      } catch (e) {}

      emitOrderCancelled(updated);

      return res.json({
        success: true,
        message: `All items were removed. Order #${order.orderNumber} was cancelled.`,
        order: updated,
        cancelled: true,
      });
    }

    const subtotal = remainingItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    const total = subtotal;

    const updated = localDataService.updateOrder(order._id, {
      items: remainingItems,
      subtotal,
      total,
      updatedAt: new Date().toISOString(),
    });

    try {
      await cloudSyncService.pushOrderToCloud(updated);
    } catch (_) {}

    try {
      const existingTasks = localDataService.getPrepTasks({ orderId: order._id });
      existingTasks.forEach((t) => {
        localDataService.updatePrepTask(t._id, { status: 'CANCELLED' });
        emitPrepTaskUpdated({ ...t, status: 'CANCELLED' });
      });

      const departmentGroups = {};
      updated.items.forEach((item) => {
        const dept = detectKOTSection(item.category, item.department);
        if (item.isGrocery || item.groceryItemId || dept === 'NONE') return;
        if (!departmentGroups[dept]) {
          departmentGroups[dept] = [];
        }
        departmentGroups[dept].push({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          category: item.category || '',
          specialInstructions: item.specialInstructions,
          isReady: false,
        });
      });

      const createdTasks = [];
      for (const dept of Object.keys(departmentGroups)) {
        const task = localDataService.savePrepTask({
          orderId: updated._id,
          orderNumber: updated.orderNumber,
          orderType: updated.orderType || 'DINE_IN',
          tableId: updated.tableId,
          tableNameSnapshot: updated.tableNameSnapshot,
          department: dept,
          items: departmentGroups[dept],
          status: 'PENDING',
          specialInstructions: updated.specialInstructions,
        });
        createdTasks.push(task);
      }

      emitOrderApproved(updated, createdTasks);
    } catch (e) {}

    res.json({
      success: true,
      message: `Item removed from Order #${updated.orderNumber}.`,
      order: updated,
      cancelled: false,
    });
  } catch (error) {
    console.error('Remove order item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get preparation tasks (Kitchen / Juice / Bun / Other KDS)
// @route   GET /api/orders/prep-tasks
// @access  Private (Staff)
const getPrepTasks = async (req, res) => {
  try {
    const { department, status } = req.query;
    let tasks = localDataService.getPrepTasks({ department, status });
    tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update preparation task status (e.g. PENDING -> PREPARING -> READY)
// @route   PATCH /api/orders/prep-tasks/:id
// @access  Private (Staff)
const updatePrepTask = async (req, res) => {
  try {
    const { status, itemIndex, isReady } = req.body;
    let task = localDataService.getPrepTasks().find((t) => String(t._id) === String(req.params.id));

    if (!task) {
      return res.status(404).json({ success: false, message: 'Preparation task not found' });
    }

    const updates = {};

    if (itemIndex !== undefined && task.items && task.items[itemIndex]) {
      const items = [...task.items];
      items[itemIndex].isReady = isReady !== undefined ? isReady : !items[itemIndex].isReady;
      updates.items = items;
      const allItemsReady = items.every((it) => it.isReady);
      if (allItemsReady) {
        updates.status = 'READY';
        updates.readyAt = new Date().toISOString();
      } else {
        updates.status = 'PREPARING';
      }
    }

    if (status) {
      updates.status = status;
      if (status === 'PREPARING' && !task.startedAt) {
        updates.startedAt = new Date().toISOString();
      } else if (status === 'READY') {
        updates.readyAt = new Date().toISOString();
        if (updates.items || task.items) {
          updates.items = (updates.items || task.items).map((it) => ({ ...it, isReady: true }));
        }
      }
    }

    task = localDataService.updatePrepTask(req.params.id, updates);

    // Check parent order and sister preparation tasks
    const order = localDataService.getOrderById(task.orderId);
    let orderUpdated = false;

    if (order && order.status !== 'COMPLETED' && order.status !== 'CANCELLED') {
      const allSisterTasks = localDataService.getPrepTasks().filter(
        (t) => String(t.orderId) === String(order._id) && t.status !== 'CANCELLED'
      );

      const allReady = allSisterTasks.length > 0 && allSisterTasks.every((t) => t.status === 'READY');
      const anyPreparing = allSisterTasks.some((t) => t.status === 'PREPARING' || t.status === 'READY');

      if (allReady && order.status !== 'READY') {
        const updatedOrd = localDataService.updateOrder(order._id, {
          status: 'READY',
          readyAt: new Date().toISOString(),
        });
        orderUpdated = true;
        emitOrderReady(updatedOrd);
      } else if (anyPreparing && order.status === 'APPROVED') {
        localDataService.updateOrder(order._id, { status: 'PREPARING' });
        orderUpdated = true;
      }
    }

    emitPrepTaskUpdated(task, orderUpdated ? localDataService.getOrderById(task.orderId) : null);

    res.json({ success: true, task, order: localDataService.getOrderById(task.orderId) });
  } catch (error) {
    console.error('Update prep task error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders with rich filters (from local computer storage + cloud synced)
// @route   GET /api/orders
// @access  Private (Staff)
const getOrders = async (req, res) => {
  try {
    const { status, tableId, waiterId, orderType, limit = 50, page = 1 } = req.query;

    // Fast cloud sync with MongoDB Atlas to pull any orders placed online (e.g. from Vercel waiter portal)
    try {
      await Promise.race([
        cloudSyncService.syncOrdersFromCloud(),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
    } catch (_) {}

    let orders = localDataService.getOrders({
      status,
      tableId,
      waiterId,
      orderType,
    });

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalCount = orders.length;
    const lim = Number(limit);
    const pg = Number(page);
    const skip = (pg - 1) * lim;
    const paginated = orders.slice(skip, skip + lim);

    res.json({
      success: true,
      count: paginated.length,
      totalCount,
      page: pg,
      totalPages: Math.ceil(totalCount / lim) || 1,
      orders: paginated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order by ID (from local computer storage)
// @route   GET /api/orders/:id
// @access  Private (Staff)
const getOrderById = async (req, res) => {
  try {
    const order = localDataService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const prepTasks = localDataService.getPrepTasks().filter(
      (t) => String(t.orderId) === String(order._id)
    );

    res.json({ success: true, order, prepTasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete order completely (Admin/Staff)
// @route   DELETE /api/orders/:id
// @access  Private (Staff)
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    let order = null;

    try {
      order = await Order.findById(id);
    } catch (e) {}

    const localOrder = localDataService.getOrderById(id);
    if (!order) {
      order = localOrder;
    }

    const isTakeaway = ((order?.orderType || localOrder?.orderType || '').toUpperCase()) === 'TAKEAWAY';

    if (isTakeaway) {
      const currentCancelCode = localDataService.getTakeawayCancelCode();
      const providedCode = String(
        req.body?.cancelCode ||
        req.headers['x-cancel-code'] ||
        req.body?.superAdminPassword ||
        req.headers['x-superadmin-password'] ||
        ''
      ).trim();
      const isSuper = await verifySuperAdminAccess(req);

      if (providedCode !== currentCancelCode && !isSuper) {
        return res.status(403).json({
          success: false,
          message: 'Invalid takeaway cancellation code. Only Super Admin has access to this code.',
        });
      }
    } else {
      const isSuperAdminAuthorized = await verifySuperAdminAccess(req);
      if (!isSuperAdminAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Super Admin authorization is required to completely delete and remove an order.',
        });
      }
    }

    localDataService.deleteOrder(id);
    if (order?.orderNumber) {
      localDataService.deleteOrder(order.orderNumber);
    }
    if (localOrder?._id) {
      localDataService.deleteOrder(localOrder._id);
    }

    // Delete from MongoDB Atlas cloud database
    try {
      if (mongoose.isValidObjectId(id)) {
        await Order.deleteOne({ _id: id });
      } else if (order?.orderNumber) {
        await Order.deleteOne({ orderNumber: order.orderNumber });
      }
    } catch (_) {}

    // If order was on a table, check if table can be freed
    if (order && order.tableId) {
      try {
        const remainingActive = localDataService.getOrders({ tableId: order.tableId }).filter(
          (o) => String(o._id) !== String(id) && String(o.orderNumber) !== String(id) && ['PENDING', 'APPROVED', 'PREPARING', 'READY'].includes(o.status)
        );
        if (remainingActive.length === 0) {
          const table = await Table.findById(order.tableId);
          if (table && table.status === 'OCCUPIED') {
            table.status = 'AVAILABLE';
            await table.save();
            emitTableUpdated(table);
          }
        }
      } catch (e) {}
    }

    // Cancel or remove associated prep tasks
    try {
      const prepTasks = localDataService.getPrepTasks({ orderId: id });
      prepTasks.forEach((t) => {
        localDataService.updatePrepTask(t._id, { status: 'CANCELLED' });
        emitPrepTaskUpdated({ ...t, status: 'CANCELLED' });
      });
    } catch (e) {}

    if (order) {
      emitOrderCancelled(order);
    }

    res.json({
      success: true,
      message: `Order #${order?.orderNumber || id} has been completely removed.`,
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Takeaway Cancellation Code (Super Admin Only)
// @route   GET /api/orders/takeaway-cancel-code
// @access  Private (Super Admin)
const getTakeawayCancelCode = async (req, res) => {
  try {
    const isSuperAdmin = await verifySuperAdminAccess(req);
    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only Super Admin can view the takeaway cancellation code.',
      });
    }

    const cancelCode = localDataService.getTakeawayCancelCode();
    return res.json({
      success: true,
      cancelCode,
    });
  } catch (error) {
    console.error('getTakeawayCancelCode error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Takeaway Cancellation Code (Super Admin Only)
// @route   PUT /api/orders/takeaway-cancel-code
// @access  Private (Super Admin)
const updateTakeawayCancelCode = async (req, res) => {
  try {
    const isSuperAdmin = await verifySuperAdminAccess(req);
    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only Super Admin can change the takeaway cancellation code.',
      });
    }

    const { code } = req.body;
    const cleanCode = String(code || '').trim();
    if (!cleanCode) {
      return res.status(400).json({
        success: false,
        message: 'A valid non-empty cancellation code is required.',
      });
    }

    const updatedCode = localDataService.setTakeawayCancelCode(cleanCode);
    return res.json({
      success: true,
      message: 'Takeaway cancellation code updated successfully.',
      cancelCode: updatedCode,
    });
  } catch (error) {
    console.error('updateTakeawayCancelCode error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify takeaway / order cancellation code
// @route   POST /api/orders/verify-cancel-code
// @access  Private (Staff / Admin)
const verifyCancelCode = async (req, res) => {
  try {
    const { cancelCode, superAdminPassword } = req.body;
    const currentCancelCode = localDataService.getTakeawayCancelCode();
    const cleanCode = String(
      cancelCode ||
      req.headers['x-cancel-code'] ||
      superAdminPassword ||
      req.headers['x-superadmin-password'] ||
      ''
    ).trim();

    const isSuper = await verifySuperAdminAccess(req);
    if (cleanCode === currentCancelCode || isSuper) {
      return res.json({ success: true, valid: true });
    }
    return res.status(403).json({
      success: false,
      valid: false,
      message: 'Invalid cancellation code. Please check and try again.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  approveOrder,
  rejectOrder,
  cancelOrder,
  deleteOrder,
  updateOrderItems,
  removeOrderItem,
  getPrepTasks,
  updatePrepTask,
  getOrders,
  getOrderById,
  getTakeawayCancelCode,
  updateTakeawayCancelCode,
  verifyCancelCode,
};
