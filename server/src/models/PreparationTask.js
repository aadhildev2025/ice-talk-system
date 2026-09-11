const mongoose = require('mongoose');

const preparationTaskSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    orderNumber: {
      type: Number,
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
    department: {
      type: String,
      enum: ['KITCHEN', 'JUICE', 'BUN', 'OTHER'],
      required: true,
    },
    items: [
      {
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
        },
        specialInstructions: {
          type: String,
          default: '',
        },
        isReady: {
          type: Boolean,
          default: false,
        },
      },
    ],
    status: {
      type: String,
      enum: ['PENDING', 'PREPARING', 'READY', 'CANCELLED'],
      default: 'PENDING',
    },
    specialInstructions: {
      type: String,
      default: '',
    },
    startedAt: Date,
    readyAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('PreparationTask', preparationTaskSchema);
