const Table = require('../models/Table');
const localDataService = require('../services/localDataService');

// @desc    Get dashboard metrics & live status summary (from local computer storage)
// @route   GET /api/reports/dashboard
// @access  Private (Admin, SuperAdmin)
const getDashboardMetrics = async (req, res) => {
  try {
    const metrics = localDataService.getDashboardMetrics();

    // Optionally decorate with live MongoDB active tables count if MongoDB is connected
    try {
      const totalTables = await Table.countDocuments({ isActive: true });
      if (totalTables > 0) {
        metrics.tables.total = totalTables;
        metrics.tables.available = Math.max(0, totalTables - metrics.tables.occupied);
      }
    } catch {
      // If MongoDB is offline, fallback table count from localDataService is used
    }

    res.json(metrics);
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Detailed Sales Reports with timeframe analytics (from local computer storage)
// @route   GET /api/reports/analytics
// @access  Private (Admin, SuperAdmin)
const getDetailedReports = async (req, res) => {
  try {
    const { timeframe = 'week', startDate, endDate } = req.query;
    const report = localDataService.getDetailedReports({ timeframe, startDate, endDate });
    res.json(report);
  } catch (error) {
    console.error('Detailed reports error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Comprehensive Profit & Loss (P&L) Report (from local computer storage)
// @route   GET /api/reports/profit-loss
// @access  Private (Admin, SuperAdmin)
const getProfitLossReport = async (req, res) => {
  try {
    const { timeframe = 'thisMonth', startDate, endDate } = req.query;
    const report = localDataService.getProfitLossReport({ timeframe, startDate, endDate });
    res.json(report);
  } catch (error) {
    console.error('Profit & loss report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate profit & loss report',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardMetrics,
  getDetailedReports,
  getProfitLossReport,
};
