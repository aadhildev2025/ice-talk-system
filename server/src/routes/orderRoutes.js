const express = require('express');
const router = express.Router();
const {
  createOrder,
  approveOrder,
  rejectOrder,
  cancelOrder,
  getPrepTasks,
  updatePrepTask,
  getOrders,
  getOrderById,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/prep-tasks', protect, getPrepTasks);
router.patch('/prep-tasks/:id', protect, updatePrepTask);
router.get('/:id', protect, getOrderById);

// Admin actions
router.post('/:id/approve', protect, authorize('admin'), approveOrder);
router.post('/:id/reject', protect, authorize('admin'), rejectOrder);
router.post('/:id/cancel', protect, cancelOrder);

module.exports = router;
