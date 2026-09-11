const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    saleNumber: {
      type: String,
      required: true,
      unique: true, // e.g. INV-000101
    },
    orderType: {
      type: String,
      enum: ['DINE_IN', 'TAKEAWAY', 'UBEREATS', 'PICKME'],
      default: 'DINE_IN',
    },
    channelOrderRef: {
      type: String,
      default: '',
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
    orderIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    orderNumbers: [Number],
    items: [
      {
        name: String,
        quantity: Number,
        price: Number,
        total: Number,
        department: String,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
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
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'ONLINE'],
      default: 'CASH',
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'REFUNDED'],
      default: 'PAID',
    },
    amountTendered: {
      type: Number,
      default: 0,
    },
    changeAmount: {
      type: Number,
      default: 0,
    },
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cashierNameSnapshot: {
      type: String,
      default: 'Admin',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sale', saleSchema);
