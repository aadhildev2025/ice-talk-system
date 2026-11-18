let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // Staff joins role-based room
    socket.on('join_role', ({ role, department, userId }) => {
      if (role) {
        socket.join(`role:${role}`);
        // Ensure superadmin, admin, cashier join common staff rooms
        if (role === 'superadmin' || role === 'admin' || role === 'cashier') {
          socket.join('role:admin');
          socket.join('role:pos');
          socket.join('role:cashier');
          socket.join('role:superadmin');
        }
        console.log(`[Socket] Socket ${socket.id} joined role:${role}`);
      }
      if (department) {
        socket.join(`dept:${department}`);
        console.log(`[Socket] Socket ${socket.id} joined dept:${department}`);
      }
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket] Socket ${socket.id} joined user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return ioInstance;
};

// Helper event emitters
const emitOrderCreated = (order) => {
  if (ioInstance) {
    // Broadcast order:created so all admin, cashier, dsuper, POS, and waiter terminals receive it immediately
    ioInstance.emit('order:created', order);
    ioInstance.to('role:admin').emit('order:created', order);
    ioInstance.to('role:cashier').emit('order:created', order);
    ioInstance.to('role:superadmin').emit('order:created', order);
    // Notify waiter who created it
    if (order.waiterId) {
      ioInstance.to(`user:${order.waiterId}`).emit('order:created_ack', order);
    }
  }
};

const emitOrderApproved = (order, prepTasks) => {
  if (ioInstance) {
    // Notify admin, cashier, superadmin, waiter, kitchen, and relevant departments
    ioInstance.emit('order:approved', { order, prepTasks });
    ioInstance.to('role:kitchen').emit('prep:new_tasks', prepTasks);
  }
};

const emitOrderRejected = (order) => {
  if (ioInstance) {
    ioInstance.emit('order:rejected', order);
    ioInstance.to('role:admin').emit('order:rejected', order);
    ioInstance.to('role:cashier').emit('order:rejected', order);
    ioInstance.to('role:superadmin').emit('order:rejected', order);
    if (order.waiterId) {
      ioInstance.to(`user:${order.waiterId}`).emit('order:rejected', order);
    }
    ioInstance.emit('order:status_updated', order);
  }
};

const emitOrderCancelled = (order) => {
  if (ioInstance) {
    ioInstance.emit('order:cancelled', order);
    ioInstance.emit('order:status_updated', order);
  }
};

const emitPrepTaskUpdated = (task, order) => {
  if (ioInstance) {
    ioInstance.emit('prep:task_updated', { task, order });
    if (order) {
      ioInstance.emit('order:status_updated', order);
    }
  }
};

const emitOrderReady = (order) => {
  if (ioInstance) {
    ioInstance.emit('order:ready', order);
    ioInstance.to('role:admin').emit('notification:toast', {
      title: 'Order Ready!',
      message: `Order #${order.orderNumber} for Table ${order.tableNameSnapshot} is ready for serving!`,
      type: 'ORDER_READY',
    });
    ioInstance.to(`user:${order.waiterId}`).emit('notification:toast', {
      title: 'Order Ready!',
      message: `Order #${order.orderNumber} for Table ${order.tableNameSnapshot} is ready to serve!`,
      type: 'ORDER_READY',
    });
  }
};

const emitTableUpdated = (table) => {
  if (ioInstance) {
    ioInstance.emit('table:updated', table);
  }
};

const emitMenuUpdated = () => {
  if (ioInstance) {
    ioInstance.emit('menu:updated');
  }
};

const emitSaleCompleted = (sale, tables) => {
  if (ioInstance) {
    ioInstance.emit('sale:completed', { sale, tables });
  }
};

const emitGroceryUpdated = (item) => {
  if (ioInstance) {
    ioInstance.emit('grocery:updated', item);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitOrderCreated,
  emitOrderApproved,
  emitOrderRejected,
  emitOrderCancelled,
  emitPrepTaskUpdated,
  emitOrderReady,
  emitTableUpdated,
  emitMenuUpdated,
  emitSaleCompleted,
  emitGroceryUpdated,
};
