const mongoose = require('mongoose');

const groceryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Grocery item name is required'],
      trim: true,
    },
    barcode: {
      type: String,
      required: [true, 'Barcode is required'],
      unique: true,
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Price must be positive'],
    },
    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      default: '',
      trim: true,
    },
    unit: {
      type: String,
      default: 'pcs',
      trim: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GroceryItem', groceryItemSchema);
