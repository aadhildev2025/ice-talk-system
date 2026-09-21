const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Expense title or description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'SALARY',
        'RAW_MATERIALS',
        'UTILITIES',
        'RENT',
        'MAINTENANCE',
        'MARKETING',
        'OTHER',
      ],
      required: [true, 'Category is required'],
      default: 'OTHER',
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'ONLINE', 'BANK_TRANSFER', 'CHEQUE', 'OTHER'],
      default: 'CASH',
    },
    recipient: {
      type: String,
      trim: true,
      default: '',
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    receiptRef: {
      type: String,
      trim: true,
      default: '',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    recordedByName: {
      type: String,
      default: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
