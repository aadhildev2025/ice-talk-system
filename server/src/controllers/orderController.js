const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
const localDataService = require('../services/localDataService');
const {
  emitOrderCreated,
  emitOrderApproved,
  emitOrderRejected,
  emitOrderCancelled,
  emitPrepTaskUpdated,
  emitOrderReady,
  emitTableUpdated,
} = require('../socket');

// Helper: Detect KOT preparation section directly from menu item category or explicit department
const detectKOTSection = (categoryName, explicitDept = null) => {
  const dept = (explicitDept || '').trim().toUpperCase();

  if (['JUICE', 'BUN', 'KITCHEN', 'OTHER'].includes(dept)) {
    return dept;
  }

  const cat = (categoryName || '').trim().toLowerCase();

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
    let tableNameSnapshot = 'Takeaway';

    if (orderType === 'DINE_IN') {
      if (!tableId) {
        return res.status(400).json({
          success: false,
          message: 'Table is required for Dine-in orders.',
        });
      }
      try {
        table = await Table.findById(tableId);
      } catch {}
      tableNameSnapshot = table ? table.name : `Table ${tableId}`;
    } else if (orderType === 'UBEREATS') {
      tableNameSnapshot = channelOrderRef ? `UberEats (${channelOrderRef})` : 'UberEats';
    } else if (orderType === 'PICKME') {
      tableNameSnapshot = channelOrderRef ? `PickMe (${channelOrderRef})` : 'PickMe';
    } else {
      tableNameSnapshot = customerName ? `Takeaway (${customerName})` : 'Takeaway';
    }

    // Process items & enforce pricing
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      let menuItem = null;
      try {
        menuItem = await MenuItem.findById(item.menuItemId || item._id);
      } catch {}

      const name = menuItem ? menuItem.name : (item.name || 'Item');
      const price = menuItem ? menuItem.price : (Number(item.price) || 0);
      const category = menuItem ? menuItem.category : (item.category || '');
      const dept = menuItem ? menuItem.department : (item.department || '');
      const detectedDept = detectKOTSection(category, dept);
      const qty = Math.max(1, Number(item.quantity) || 1);
      const itemTotal = price * qty;
      subtotal += itemTotal;

      processedItems.push({
        menuItemId: item.menuItemId || item._id,
        name,
        quantity: qty,
        price,
        total: itemTotal,
        department: detectedDept,
        category,
        specialInstructions: item.specialInstructions || '',
        preparationStatus: 'PENDING',
      });
    }

    const orderNumber = localDataService.getNextOrderNumber();
    const shouldAutoApprove = autoApprove !== false;

    let round = 1;
    if (table) {
      const activeTableOrders = localDataService.getOrders({ tableId: table._id }).filter(
        (o) => !o.isSettled && ['APPROVED', 'PREPARING', 'READY', 'COMPLETED'].includes(o.status)
      );
      round = activeTableOrders.length + 1;
    }

    // Save order to local computer storage
    const order = localDataService.saveOrder({
      orderNumber,
      orderType,
      tableId: table ? table._id : undefined,
      tableName: tableNameSnapshot,
      tableNameSnapshot,
      customerName,
      customerPhone,
      channelOrderRef,
      waiterId: req.user ? req.user._id : null,
      waiterNameSnapshot: req.user ? req.user.name : 'Staff',
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

    // Update MongoDB Table status to OCCUPIED if table exists
    if (table) {
      try {
        table.status = 'OCCUPIED';
        await table.save();
        emitTableUpdated(table);
      } catch {}
    }

    // If auto-approved, create preparation tasks immediately
    let createdTasks = [];
    if (shouldAutoApprove) {
      const departmentGroups = {};
      order.items.forEach((item) => {
        const dept = detectKOTSection(item.category, item.department);
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
      message: `Order #${orderNumber} placed successfully (Saved to Local Computer Storage).`,
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
    });

    // Group items by department to create Preparation Tasks
    const departmentGroups = {};
    updated.items.forEach((item) => {
      const dept = detectKOTSection(item.category, item.department);
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
    const { reason } = req.body;
    const order = localDataService.getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
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

    // Check table occupancy
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

// @desc    Get all orders with rich filters (from local computer storage)
// @route   GET /api/orders
// @access  Private (Staff)
const getOrders = async (req, res) => {
  try {
    const { status, tableId, waiterId, orderType, limit = 50, page = 1 } = req.query;

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

module.exports = {
  createOrder,
  approveOrder,
  rejectOrder,
  cancelOrder,
  getPrepTasks,
  updatePrepTask,
  getOrders,
  getOrderById,
};
