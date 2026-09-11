const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getDetailedReports,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin'), getDashboardMetrics);
router.get('/analytics', protect, authorize('admin'), getDetailedReports);

module.exports = router;
