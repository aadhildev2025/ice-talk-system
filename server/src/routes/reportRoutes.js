const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getDetailedReports,
  getProfitLossReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin'), getDashboardMetrics);
router.get('/analytics', protect, authorize('superadmin'), getDetailedReports);
router.get('/profit-loss', protect, authorize('superadmin'), getProfitLossReport);

module.exports = router;
