const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getDetailedReports,
  getProfitLossReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin', 'superadmin'), getDashboardMetrics);
router.get(['/analytics', '/detailed'], protect, authorize('admin', 'superadmin'), getDetailedReports);
router.get('/profit-loss', protect, authorize('admin', 'superadmin'), getProfitLossReport);

module.exports = router;
