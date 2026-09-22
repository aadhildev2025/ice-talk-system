const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      default: 'Utensils',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    department: {
      type: String,
      enum: ['KITCHEN', 'JUICE', 'BUN', 'OTHER'],
      default: 'KITCHEN',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
