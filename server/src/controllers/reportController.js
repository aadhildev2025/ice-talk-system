const Sale = require('../models/Sale');
const Order = require('../models/Order');
const Table = require('../models/Table');

// @desc    Get dashboard metrics & live status summary
// @route   GET /api/reports/dashboard
// @access  Private (Admin)
const getDashboardMetrics = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Today's sales from Sale collection
    const todaySalesData = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          count: { $sum: 1 },
          cashSales: {
            $sum: { $cond: [{ $eq: ['$paymentMethod', 'CASH'] }, '$total', 0] },
          },
          cardSales: {
            $sum: { $cond: [{ $eq: ['$paymentMethod', 'CARD'] }, '$total', 0] },
          },
          onlineSales: {
            $sum: { $cond: [{ $eq: ['$paymentMethod', 'ONLINE'] }, '$total', 0] },
          },
        },
      },
    ]);

    const todaySales = todaySalesData[0]?.totalSales || 0;
    const todaySalesCount = todaySalesData[0]?.count || 0;
    const cashSales = todaySalesData[0]?.cashSales || 0;
    const cardSales = todaySalesData[0]?.cardSales || 0;
    const onlineSales = todaySalesData[0]?.onlineSales || 0;

    // Order counts by status
    const pendingOrders = await Order.countDocuments({ status: 'PENDING' });
    const approvedOrders = await Order.countDocuments({ status: 'APPROVED' });
    const preparingOrders = await Order.countDocuments({ status: 'PREPARING' });
    const readyOrders = await Order.countDocuments({ status: 'READY' });
    const completedTodayOrders = await Order.countDocuments({
      status: 'COMPLETED',
      updatedAt: { $gte: startOfToday },
    });
    const cancelledTodayOrders = await Order.countDocuments({
      status: 'CANCELLED',
      updatedAt: { $gte: startOfToday },
    });
    const rejectedTodayOrders = await Order.countDocuments({
      status: 'REJECTED',
      updatedAt: { $gte: startOfToday },
    });

    const totalOrdersToday = await Order.countDocuments({
      createdAt: { $gte: startOfToday },
    });

    // Active Tables summary
    const totalTables = await Table.countDocuments({ isActive: true });
    const occupiedTables = await Table.countDocuments({
      isActive: true,
      status: 'OCCUPIED',
    });
    const availableTables = await Table.countDocuments({
      isActive: true,
      status: 'AVAILABLE',
    });

    // Recent 5 incoming / active orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6);

    // Top selling items
    const topItemsData = await Sale.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQty: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          department: { $first: '$items.department' },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      today: {
        totalSales: todaySales,
        salesCount: todaySalesCount,
        totalOrders: totalOrdersToday,
        cashSales,
        cardSales,
        onlineSales,
      },
      orderStatusCounts: {
        pending: pendingOrders,
        approved: approvedOrders,
        preparing: preparingOrders,
        ready: readyOrders,
        completed: completedTodayOrders,
        cancelled: cancelledTodayOrders,
        rejected: rejectedTodayOrders,
      },
      tables: {
        total: totalTables,
        occupied: occupiedTables,
        available: availableTables,
      },
      recentOrders,
      topItems: topItemsData,
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Detailed Sales Reports with timeframe analytics
// @route   GET /api/reports/analytics
// @access  Private (Admin)
const getDetailedReports = async (req, res) => {
  try {
    const { timeframe = 'week' } = req.query;
    const now = new Date();
    let startDate = new Date();

    if (timeframe === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeframe === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeframe === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const salesInPeriod = await Sale.find({ createdAt: { $gte: startDate } }).sort({ createdAt: 1 });

    const totalRevenue = salesInPeriod.reduce((sum, s) => sum + s.total, 0);
    const totalSalesCount = salesInPeriod.length;

    const paymentBreakdown = {
      CASH: salesInPeriod.filter((s) => s.paymentMethod === 'CASH').reduce((sum, s) => sum + s.total, 0),
      CARD: salesInPeriod.filter((s) => s.paymentMethod === 'CARD').reduce((sum, s) => sum + s.total, 0),
      ONLINE: salesInPeriod.filter((s) => s.paymentMethod === 'ONLINE').reduce((sum, s) => sum + s.total, 0),
    };

    res.json({
      success: true,
      timeframe,
      totalRevenue,
      totalSalesCount,
      paymentBreakdown,
      sales: salesInPeriod,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardMetrics,
  getDetailedReports,
};
