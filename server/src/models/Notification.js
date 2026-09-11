const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientRole: {
      type: String,
      enum: ['ALL', 'admin', 'waiter', 'kitchen', 'juice', 'bun', 'other'],
      default: 'ALL',
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['ORDER_NEW', 'ORDER_APPROVED', 'ORDER_REJECTED', 'ORDER_PREPARING', 'ORDER_READY', 'ORDER_CANCELLED', 'SALE_COMPLETED', 'INFO'],
      default: 'INFO',
    },
    data: {
      orderId: mongoose.Schema.Types.ObjectId,
      orderNumber: Number,
      tableId: mongoose.Schema.Types.ObjectId,
      tableName: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
