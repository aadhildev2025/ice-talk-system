const express = require('express');
const router = express.Router();
const {
  getGroceryItems,
  getGroceryItemByBarcode,
  getGroceryItemById,
  createGroceryItem,
  updateGroceryItem,
  adjustStock,
  deleteGroceryItem,
} = require('../controllers/groceryController');
const { protect, authorize } = require('../middleware/auth');

// Public / Staff read routes
router.get('/', protect, getGroceryItems);
router.get('/barcode/:barcode', protect, getGroceryItemByBarcode);
router.get('/:id', protect, getGroceryItemById);

// Admin & Staff operations
router.patch('/:id/adjust-stock', protect, authorize('admin', 'superadmin', 'cashier', 'staff'), adjustStock);
router.post('/', protect, authorize('admin', 'superadmin', 'cashier'), createGroceryItem);
router.put('/:id', protect, authorize('admin', 'superadmin', 'cashier'), updateGroceryItem);
router.delete('/:id', protect, authorize('admin', 'superadmin', 'cashier'), deleteGroceryItem);

module.exports = router;
