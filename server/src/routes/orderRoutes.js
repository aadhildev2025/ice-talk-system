const express = require('express');
const router = express.Router();
const {
  createOrder,
  approveOrder,
  rejectOrder,
  cancelOrder,
  deleteOrder,
  updateOrderItems,
  removeOrderItem,
  getPrepTasks,
  updatePrepTask,
  getOrders,
  getOrderById,
  getTakeawayCancelCode,
  updateTakeawayCancelCode,
  verifyCancelCode,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/prep-tasks', protect, getPrepTasks);
router.patch('/prep-tasks/:id', protect, updatePrepTask);

// Takeaway cancellation code management & verification
router.get('/takeaway-cancel-code', protect, getTakeawayCancelCode);
router.put('/takeaway-cancel-code', protect, updateTakeawayCancelCode);
router.post('/verify-cancel-code', protect, verifyCancelCode);

router.get('/:id', protect, getOrderById);

// Admin / Staff actions for orders
router.post('/:id/approve', protect, authorize('admin'), approveOrder);
router.post('/:id/reject', protect, authorize('admin'), rejectOrder);
router.post('/:id/cancel', protect, cancelOrder);
router.delete('/:id', protect, deleteOrder);
router.put('/:id/items', protect, updateOrderItems);
router.delete('/:id/items/:itemIndex', protect, removeOrderItem);

module.exports = router;
