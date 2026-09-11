const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  department: {
    type: String,
    enum: ['KITCHEN', 'JUICE', 'BUN', 'OTHER'],
    default: 'KITCHEN',
  },
  category: {
    type: String,
    default: '',
  },
  specialInstructions: {
    type: String,
    default: '',
  },
  preparationStatus: {
    type: String,
    enum: ['PENDING', 'PREPARING', 'READY'],
    default: 'PENDING',
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      unique: true,
      required: true,
    },
    orderType: {
      type: String,
      enum: ['DINE_IN', 'TAKEAWAY', 'UBEREATS', 'PICKME'],
      default: 'DINE_IN',
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: false,
    },
    tableNameSnapshot: {
      type: String,
      required: true,
      default: 'Takeaway',
    },
    customerName: {
      type: String,
      default: '',
    },
    customerPhone: {
      type: String,
      default: '',
    },
    channelOrderRef: {
      type: String,
      default: '',
    },
    waiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    waiterNameSnapshot: {
      type: String,
      required: true,
      default: 'Staff',
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'PREPARING', 'READY', 'COMPLETED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
    },
    priority: {
      type: String,
      enum: ['NORMAL', 'HIGH', 'VIP'],
      default: 'NORMAL',
    },
    specialInstructions: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    approvedAt: Date,
    readyAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    // Whether this order has been settled in POS sale
    isSettled: {
      type: Boolean,
      default: false,
    },
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
