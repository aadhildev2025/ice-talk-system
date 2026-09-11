const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Table name is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      default: 4,
      min: 1,
    },
    type: {
      type: String,
      default: 'Family',
      trim: true,
    },
    floor: {
      type: String,
      default: 'Ground Floor',
      trim: true,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'ORDERING', 'OCCUPIED', 'RESERVED', 'DISABLED'],
      default: 'AVAILABLE',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    qrCode: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Table', tableSchema);
