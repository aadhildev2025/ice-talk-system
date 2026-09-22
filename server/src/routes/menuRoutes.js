const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  seedDefaultMenu,
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

// Menu items
router.get('/', protect, getMenuItems);
router.post('/seed-default', protect, authorize('admin'), seedDefaultMenu);
router.get('/:id', protect, getMenuItem);
router.post('/', protect, authorize('admin'), createMenuItem);
router.put('/:id', protect, authorize('admin'), updateMenuItem);
router.patch('/:id/toggle-availability', protect, toggleAvailability);
router.delete('/:id', protect, authorize('admin'), deleteMenuItem);

// Categories
router.get('/categories/all', protect, getCategories);
router.post('/categories', protect, authorize('admin'), createCategory);
router.put('/categories/:id', protect, authorize('admin'), updateCategory);
router.delete('/categories/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
