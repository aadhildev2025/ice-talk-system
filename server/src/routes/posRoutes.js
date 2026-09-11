const express = require('express');
const router = express.Router();
const {
  getTableActiveOrders,
  getChannelActiveOrders,
  settleTable,
  getSalesHistory,
  getSaleById,
} = require('../controllers/posController');
const { protect, authorize } = require('../middleware/auth');

router.get('/table/:tableId/orders', protect, getTableActiveOrders);
router.get('/channel-orders', protect, getChannelActiveOrders);
router.post('/settle-table', protect, authorize('admin'), settleTable);
router.post('/settle-orders', protect, authorize('admin'), settleTable);
router.get('/sales', protect, authorize('admin'), getSalesHistory);
router.get('/sales/:id', protect, authorize('admin'), getSaleById);

module.exports = router;
