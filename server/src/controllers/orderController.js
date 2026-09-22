const Order = require('../models/Order');
const Table = require('../models/Table');
const PreparationTask = require('../models/PreparationTask');
const MenuItem = require('../models/MenuItem');
const {
  emitOrderCreated,
  emitOrderApproved,
  emitOrderRejected,
  emitOrderCancelled,
  emitPrepTaskUpdated,
  emitOrderReady,
  emitTableUpdated,
} = require('../socket');

// Helper to get next sequential order number
const getNextOrderNumber = async () => {
  const latestOrder = await Order.findOne().sort({ orderNumber: -1 });
  if (latestOrder && latestOrder.orderNumber) {
    return latestOrder.orderNumber + 1;
  }
  return 1001; // Start at 1001
};

// Helper: Detect KOT preparation section directly from menu item category
const detectKOTSection = (categoryName, fallbackDept = 'KITCHEN') => {
  const cat = (categoryName || '').trim().toLowerCase();

  // 1. JUICE & DESSERTS (Beverages, Shakes, Falooda, Ice Cream, Desserts, Sweets, Smoothies, Mojitos)
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

  // 2. BUNS & SHORT EATS (Bakery, Buns, Rolls, Pastries, Samosas, Snacks, Sandwiches)
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

  // 3. RICE & KITCHEN (Rice, Kottu, Burgers, Noodles, Curries, Hot Meals, Mains, Grills)
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

  if (fallbackDept && ['JUICE', 'BUN', 'KITCHEN'].includes(fallbackDept.toUpperCase())) {
    return fallbackDept.toUpperCase();
  }

  return 'KITCHEN';
};

// @desc    Create new order (Waiter / Admin)
// @route   POST /api/orders
// @access  Private (Waiter / Admin)
const createOrder = async (req, res) => {
  try {
    const {
      tableId,
      items,
      specialInstructions,
      priority,
      orderType = 'DINE_IN',
      customerName = '',
      customerPhone = '',
      channelOrderRef = '',
      autoApprove = false,
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
      table = await Table.findById(tableId);
      if (!table) {
        return res.status(404).json({ success: false, message: 'Table not found.' });
      }
      if (table.status === 'DISABLED' || !table.isActive) {
        return res.status(400).json({
          success: false,
          message: 'This table is currently disabled or inactive.',
        });
      }
      tableNameSnapshot = table.name;
    } else if (orderType === 'UBEREATS') {
      tableNameSnapshot = channelOrderRef ? `UberEats (${channelOrderRef})` : 'UberEats';
    } else if (orderType === 'PICKME') {
      tableNameSnapshot = channelOrderRef ? `PickMe (${channelOrderRef})` : 'PickMe';
    } else {
      tableNameSnapshot = customerName ? `Takeaway (${customerName})` : 'Takeaway';
    }

    // Process items & enforce current pricing & department
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId || item._id);
      if (!menuItem) {
        return res.status(400).json({
          success: false,
          message: `Menu item '${item.name || 'Unknown'}' is not found.`,
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `'${menuItem.name}' is currently out of stock.`,
        });
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      const price = menuItem.price;
      subtotal += price * qty;

      const detectedDept = detectKOTSection(menuItem.category, menuItem.department);
      processedItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        quantity: qty,
        price: price,
        department: detectedDept,
        category: menuItem.category || '',
        specialInstructions: item.specialInstructions || '',
        preparationStatus: 'PENDING',
      });
    }

    const orderNumber = await getNextOrderNumber();
    const shouldAutoApprove = autoApprove !== false;

    let round = 1;
    if (table) {
      const activeTableOrdersCount = await Order.countDocuments({
        tableId: table._id,
        status: { $in: ['APPROVED', 'PREPARING', 'READY', 'COMPLETED'] },
        isSettled: false,
      });
      round = activeTableOrdersCount + 1;
    }

    const order = await Order.create({
      orderNumber,
      orderType,
      tableId: table ? table._id : undefined,
      tableNameSnapshot,
      customerName,
      customerPhone,
      channelOrderRef,
      waiterId: req.user._id,
      waiterNameSnapshot: req.user.name || (req.user.role === 'admin' ? 'Admin' : 'Staff'),
      items: processedItems,
      subtotal,
      total: subtotal,
      round,
      status: shouldAutoApprove ? 'APPROVED' : 'PENDING',
      approvedAt: shouldAutoApprove ? new Date() : undefined,
      priority: priority || 'NORMAL',
      specialInstructions: specialInstructions || '',
    });

    if (table) {
      table.status = 'OCCUPIED';
      await table.save();
      emitTableUpdated(table);
    }

    // If auto-approved (e.g. from Admin POS), create preparation tasks immediately
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
        const task = await PreparationTask.create({
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
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve order with status '${order.status}'`,
      });
    }

    order.status = 'APPROVED';
    order.approvedAt = new Date();
    await order.save();

    // Group items by department to create Preparation Tasks
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

    // Create preparation tasks
    const createdTasks = [];
    for (const dept of Object.keys(departmentGroups)) {
      const task = await PreparationTask.create({
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

    // Notify real-time
    emitOrderApproved(order, createdTasks);

    res.json({
      success: true,
      message: `Order #${order.orderNumber} approved. Short preparation slip generated.`,
      order,
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
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = 'REJECTED';
    order.rejectionReason = reason || 'Rejected by Admin';
    await order.save();

    emitOrderRejected(order);

    res.json({
      success: true,
      message: `Order #${order.orderNumber} has been rejected.`,
      order,
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
    const order = await Order.findById(req.params.id);

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

    order.status = 'CANCELLED';
    order.cancellationReason = reason || `Cancelled by ${req.user?.role === 'admin' ? 'Admin' : 'Waiter'}`;
    order.cancelledAt = new Date();
    await order.save();

    // Cancel related preparation tasks
    await PreparationTask.updateMany(
      { orderId: order._id },
      { $set: { status: 'CANCELLED' } }
    );

    // If order was associated with a table, check if any other active orders remain on this table
    if (order.tableId) {
      const remainingActive = await Order.countDocuments({
        tableId: order.tableId,
        _id: { $ne: order._id },
        status: { $in: ['PENDING', 'APPROVED', 'PREPARING', 'READY'] },
      });

      if (remainingActive === 0) {
        const table = await Table.findById(order.tableId);
        if (table && table.status === 'OCCUPIED') {
          table.status = 'AVAILABLE';
          await table.save();
          emitTableUpdated(table);
        }
      }
    }

    emitOrderCancelled(order);

    res.json({
      success: true,
      message: `Order #${order.orderNumber} has been cancelled successfully.`,
      order,
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
    const filter = {
      status: { $in: ['PENDING', 'PREPARING', 'READY'] },
    };

    if (department && department !== 'ALL') {
      filter.department = department;
    }
    if (status) {
      filter.status = status;
    }

    const tasks = await PreparationTask.find(filter).sort({ createdAt: 1 });
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
    const task = await PreparationTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Preparation task not found' });
    }

    if (itemIndex !== undefined && task.items[itemIndex]) {
      task.items[itemIndex].isReady = isReady !== undefined ? isReady : !task.items[itemIndex].isReady;
      const allItemsReady = task.items.every((it) => it.isReady);
      if (allItemsReady) {
        task.status = 'READY';
        task.readyAt = new Date();
      } else {
        task.status = 'PREPARING';
      }
    }

    if (status) {
      task.status = status;
      if (status === 'PREPARING' && !task.startedAt) {
        task.startedAt = new Date();
      } else if (status === 'READY') {
        task.readyAt = new Date();
        task.items.forEach((it) => {
          it.isReady = true;
        });
      }
    }

    await task.save();

    // Check parent order and all sister preparation tasks
    const order = await Order.findById(task.orderId);
    let orderUpdated = false;

    if (order && order.status !== 'COMPLETED' && order.status !== 'CANCELLED') {
      const allSisterTasks = await PreparationTask.find({
        orderId: order._id,
        status: { $ne: 'CANCELLED' },
      });

      const allReady = allSisterTasks.length > 0 && allSisterTasks.every((t) => t.status === 'READY');
      const anyPreparing = allSisterTasks.some((t) => t.status === 'PREPARING' || t.status === 'READY');

      if (allReady && order.status !== 'READY') {
        order.status = 'READY';
        order.readyAt = new Date();
        await order.save();
        orderUpdated = true;
        emitOrderReady(order);
      } else if (anyPreparing && order.status === 'APPROVED') {
        order.status = 'PREPARING';
        await order.save();
        orderUpdated = true;
      }
    }

    emitPrepTaskUpdated(task, orderUpdated ? order : null);

    res.json({ success: true, task, order });
  } catch (error) {
    console.error('Update prep task error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders with rich filters
// @route   GET /api/orders
// @access  Private (Staff)
const getOrders = async (req, res) => {
  try {
    const { status, tableId, waiterId, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (status) {
      if (status.includes(',')) {
        filter.status = { $in: status.split(',') };
      } else {
        filter.status = status;
      }
    }

    if (tableId) filter.tableId = tableId;
    if (waiterId) filter.waiterId = waiterId;

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalCount = await Order.countDocuments(filter);

    res.json({
      success: true,
      count: orders.length,
      totalCount,
      page: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)),
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private (Staff)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const prepTasks = await PreparationTask.find({ orderId: order._id });

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
