const mongoose = require('mongoose');
const Order = require('../models/Order');
const PreparationTask = require('../models/PreparationTask');
const localDataService = require('./localDataService');
const {
  emitOrderCreated,
  emitOrderApproved,
  emitOrderRejected,
  emitOrderCancelled,
  emitPrepTaskUpdated,
} = require('../socket');

// Helper: Sanitize order document for MongoDB schema
const sanitizeOrderForMongo = (ord) => {
  const isOid = (v) => mongoose.isValidObjectId(v);
  return {
    orderNumber: Number(ord.orderNumber),
    orderType: ord.orderType || 'DINE_IN',
    tableId: isOid(ord.tableId) ? ord.tableId : undefined,
    tableNameSnapshot: ord.tableNameSnapshot || ord.tableName || 'Dine-In',
    customerName: ord.customerName || '',
    customerPhone: ord.customerPhone || '',
    channelOrderRef: ord.channelOrderRef || '',
    waiterId: isOid(ord.waiterId) ? ord.waiterId : undefined,
    waiterNameSnapshot: ord.waiterNameSnapshot || ord.waiterName || 'Staff',
    items: (ord.items || []).map((it) => ({
      menuItemId: isOid(it.menuItemId) ? it.menuItemId : undefined,
      name: it.name || 'Item',
      portion: it.portion || 'Portion',
      quantity: Number(it.quantity) || 1,
      price: Number(it.price) || 0,
      department: it.department || 'KITCHEN',
      category: it.category || '',
      specialInstructions: it.specialInstructions || '',
      preparationStatus: it.preparationStatus || 'PENDING',
    })),
    subtotal: Number(ord.subtotal) || 0,
    tax: Number(ord.tax) || 0,
    discount: Number(ord.discount) || 0,
    discountPercentage: Number(ord.discountPercentage) || 0,
    total: Number(ord.total) || 0,
    round: Number(ord.round) || 1,
    status: ord.status || 'PENDING',
    priority: ord.priority || 'NORMAL',
    specialInstructions: ord.specialInstructions || '',
    rejectionReason: ord.rejectionReason || '',
    cancellationReason: ord.cancellationReason || '',
    isSettled: Boolean(ord.isSettled),
    isDemo: Boolean(ord.isDemo),
    approvedAt: ord.approvedAt ? new Date(ord.approvedAt) : undefined,
    readyAt: ord.readyAt ? new Date(ord.readyAt) : undefined,
    completedAt: ord.completedAt ? new Date(ord.completedAt) : undefined,
    cancelledAt: ord.cancelledAt ? new Date(ord.cancelledAt) : undefined,
    saleId: isOid(ord.saleId) ? ord.saleId : undefined,
  };
};

// Push an order to MongoDB Atlas
const pushOrderToCloud = async (order) => {
  if (!mongoose.connection || mongoose.connection.readyState < 1) return null;
  try {
    const sanitized = sanitizeOrderForMongo(order);
    let filter = null;
    if (mongoose.isValidObjectId(order._id)) {
      filter = { _id: order._id };
    } else if (order.orderNumber) {
      filter = { orderNumber: order.orderNumber };
    } else {
      return null;
    }

    const doc = await Order.findOneAndUpdate(filter, sanitized, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
    return doc;
  } catch (err) {
    console.warn('[CloudSync] pushOrderToCloud warning:', err.message);
    return null;
  }
};

// Update order status in MongoDB Atlas
const updateOrderStatusInCloud = async (orderIdOrNumber, statusUpdates) => {
  if (!mongoose.connection || mongoose.connection.readyState < 1) return null;
  try {
    const filter = mongoose.isValidObjectId(orderIdOrNumber)
      ? { _id: orderIdOrNumber }
      : { orderNumber: Number(orderIdOrNumber) };

    const updateDoc = { ...statusUpdates };
    if (updateDoc.approvedAt && typeof updateDoc.approvedAt === 'string') {
      updateDoc.approvedAt = new Date(updateDoc.approvedAt);
    }
    if (updateDoc.cancelledAt && typeof updateDoc.cancelledAt === 'string') {
      updateDoc.cancelledAt = new Date(updateDoc.cancelledAt);
    }
    if (updateDoc.completedAt && typeof updateDoc.completedAt === 'string') {
      updateDoc.completedAt = new Date(updateDoc.completedAt);
    }

    return await Order.findOneAndUpdate(filter, { $set: updateDoc }, { new: true });
  } catch (err) {
    console.warn('[CloudSync] updateOrderStatusInCloud warning:', err.message);
    return null;
  }
};

// Pull and sync active/pending orders from MongoDB Atlas to localDataService
let isSyncing = false;
const syncOrdersFromCloud = async () => {
  if (isSyncing) return;
  if (!mongoose.connection || mongoose.connection.readyState < 1) return;

  isSyncing = true;
  try {
    // Look for active/unsettled orders or orders created in the last 24h
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const cloudOrders = await Order.find({
      $or: [
        { isSettled: false },
        { createdAt: { $gte: since24h } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(80)
      .lean();

    for (const cloudOrd of cloudOrders) {
      const cloudIdStr = String(cloudOrd._id);
      const localOrd =
        localDataService.getOrderById(cloudIdStr) ||
        localDataService.getOrders().find((o) => o.orderNumber === cloudOrd.orderNumber);

      const normalized = {
        _id: cloudIdStr,
        orderNumber: cloudOrd.orderNumber,
        orderType: cloudOrd.orderType || 'DINE_IN',
        tableId: cloudOrd.tableId ? String(cloudOrd.tableId) : null,
        tableName: cloudOrd.tableNameSnapshot || 'Dine-In',
        tableNameSnapshot: cloudOrd.tableNameSnapshot || 'Dine-In',
        waiterId: cloudOrd.waiterId ? String(cloudOrd.waiterId) : null,
        waiterName: cloudOrd.waiterNameSnapshot || 'Staff',
        waiterNameSnapshot: cloudOrd.waiterNameSnapshot || 'Staff',
        customerName: cloudOrd.customerName || '',
        customerPhone: cloudOrd.customerPhone || '',
        channelOrderRef: cloudOrd.channelOrderRef || '',
        round: cloudOrd.round || 1,
        status: cloudOrd.status || 'PENDING',
        isSettled: Boolean(cloudOrd.isSettled),
        items: (cloudOrd.items || []).map((it) => ({
          menuItemId: it.menuItemId ? String(it.menuItemId) : '',
          isGrocery: Boolean(it.isGrocery),
          barcode: it.barcode || '',
          name: it.name || 'Item',
          portion: it.portion || 'Portion',
          quantity: Number(it.quantity) || 1,
          price: Number(it.price) || 0,
          total: Number(it.total) || (Number(it.price) * Number(it.quantity)),
          department: it.department || 'KITCHEN',
          category: it.category || '',
          specialInstructions: it.specialInstructions || '',
          preparationStatus: it.preparationStatus || 'PENDING',
        })),
        subtotal: cloudOrd.subtotal || 0,
        total: cloudOrd.total || 0,
        specialInstructions: cloudOrd.specialInstructions || '',
        priority: cloudOrd.priority || 'NORMAL',
        isDemo: Boolean(cloudOrd.isDemo),
        rejectionReason: cloudOrd.rejectionReason || '',
        cancellationReason: cloudOrd.cancellationReason || '',
        createdAt: cloudOrd.createdAt ? new Date(cloudOrd.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: cloudOrd.updatedAt ? new Date(cloudOrd.updatedAt).toISOString() : new Date().toISOString(),
      };

      if (!localOrd) {
        // Brand new order placed online (e.g. from Vercel waiter menu)!
        localDataService.saveOrder(normalized);
        if (normalized.status === 'PENDING') {
          emitOrderCreated(normalized);
        } else if (normalized.status === 'APPROVED') {
          emitOrderApproved(normalized, []);
        }
      } else {
        // Status discrepancy check:
        if (localOrd.status !== cloudOrd.status) {
          // If local order has reached a terminal status (e.g. Cashier approved or settled it),
          // sync that terminal status back to the cloud
          if (['APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED'].includes(localOrd.status) && cloudOrd.status === 'PENDING') {
            await updateOrderStatusInCloud(cloudOrd._id, {
              status: localOrd.status,
              isSettled: Boolean(localOrd.isSettled),
              rejectionReason: localOrd.rejectionReason,
              cancellationReason: localOrd.cancellationReason,
            });
          } else {
            // Update local order to reflect cloud status
            localDataService.updateOrder(localOrd._id, {
              status: cloudOrd.status,
              isSettled: Boolean(cloudOrd.isSettled),
              rejectionReason: cloudOrd.rejectionReason,
              cancellationReason: cloudOrd.cancellationReason,
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('[CloudSync] syncOrdersFromCloud warning:', err.message);
  } finally {
    isSyncing = false;
  }
};

let syncIntervalHandle = null;
const startCloudSyncLoop = (intervalMs = 3500) => {
  if (syncIntervalHandle) return;
  // Trigger initial sync after 2 seconds
  setTimeout(() => {
    syncOrdersFromCloud();
  }, 2000);

  syncIntervalHandle = setInterval(() => {
    syncOrdersFromCloud();
  }, intervalMs);

  console.log(`[CloudSync] Live cloud-sync service active (every ${intervalMs}ms).`);
};

module.exports = {
  sanitizeOrderForMongo,
  pushOrderToCloud,
  updateOrderStatusInCloud,
  syncOrdersFromCloud,
  startCloudSyncLoop,
};
