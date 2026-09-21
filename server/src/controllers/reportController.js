const Sale = require('../models/Sale');
const Order = require('../models/Order');
const Table = require('../models/Table');
const Expense = require('../models/Expense');

// Helper for date ranges in reports
const getReportDateRange = (timeframe, startDate, endDate) => {
  const now = new Date();
  let start = null;
  let end = null;

  if (timeframe === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (timeframe === 'yesterday') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
  } else if (timeframe === 'week' || timeframe === 'thisWeek') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    start = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0);
    end = new Date();
  } else if (timeframe === 'month' || timeframe === 'thisMonth') {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    end = new Date();
  } else if (timeframe === 'lastMonth') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (timeframe === 'year' || timeframe === 'thisYear') {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    end = new Date();
  } else if (timeframe === 'lastYear') {
    start = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0);
    end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
  } else if (timeframe === 'all') {
    return null;
  } else if (startDate || endDate) {
    if (startDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
    }
    if (endDate) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }
  }

  const range = {};
  if (start) range.$gte = start;
  if (end) range.$lte = end;
  return Object.keys(range).length > 0 ? range : null;
};

// @desc    Get dashboard metrics & live status summary
// @route   GET /api/reports/dashboard
// @access  Private (Admin, SuperAdmin)
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

    // Recent incoming / active orders
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

    // Today's total expenses
    const todayExpensesData = await Expense.aggregate([
      { $match: { date: { $gte: startOfToday } } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);
    const todayExpenses = todayExpensesData[0]?.total || 0;

    res.json({
      success: true,
      today: {
        totalSales: todaySales,
        salesCount: todaySalesCount,
        totalOrders: totalOrdersToday,
        cashSales,
        cardSales,
        onlineSales,
        totalExpenses: todayExpenses,
        netIncome: todaySales - todayExpenses,
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
// @access  Private (Admin, SuperAdmin)
const getDetailedReports = async (req, res) => {
  try {
    const { timeframe = 'week', startDate, endDate } = req.query;
    const filter = {};

    const dateRange = getReportDateRange(timeframe, startDate, endDate);
    if (dateRange) {
      filter.createdAt = dateRange;
    }

    const salesInPeriod = await Sale.find(filter).sort({ createdAt: 1 });

    const totalRevenue = salesInPeriod.reduce((sum, s) => sum + s.total, 0);
    const totalSubtotal = salesInPeriod.reduce((sum, s) => sum + (s.subtotal || s.total), 0);
    const totalDiscount = salesInPeriod.reduce((sum, s) => sum + (s.discount || 0), 0);
    const totalTax = salesInPeriod.reduce((sum, s) => sum + (s.tax || 0), 0);
    const totalSalesCount = salesInPeriod.length;

    const paymentBreakdown = {
      CASH: salesInPeriod.filter((s) => s.paymentMethod === 'CASH').reduce((sum, s) => sum + s.total, 0),
      CARD: salesInPeriod.filter((s) => s.paymentMethod === 'CARD').reduce((sum, s) => sum + s.total, 0),
      ONLINE: salesInPeriod.filter((s) => s.paymentMethod === 'ONLINE').reduce((sum, s) => sum + s.total, 0),
    };

    const orderTypeBreakdown = {
      DINE_IN: salesInPeriod.filter((s) => s.orderType === 'DINE_IN').reduce((sum, s) => sum + s.total, 0),
      TAKEAWAY: salesInPeriod.filter((s) => s.orderType === 'TAKEAWAY').reduce((sum, s) => sum + s.total, 0),
      DELIVERY: salesInPeriod.filter((s) => s.orderType === 'DELIVERY').reduce((sum, s) => sum + s.total, 0),
    };

    res.json({
      success: true,
      timeframe,
      totalRevenue,
      totalSubtotal,
      totalDiscount,
      totalTax,
      totalSalesCount,
      paymentBreakdown,
      orderTypeBreakdown,
      sales: salesInPeriod,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Comprehensive Profit & Loss (P&L) Report
// @route   GET /api/reports/profit-loss
// @access  Private (Admin, SuperAdmin)
const getProfitLossReport = async (req, res) => {
  try {
    const { timeframe = 'thisMonth', startDate, endDate } = req.query;

    const salesFilter = {};
    const expenseFilter = {};

    const dateRange = getReportDateRange(timeframe, startDate, endDate);
    if (dateRange) {
      salesFilter.createdAt = dateRange;
      expenseFilter.date = dateRange;
    }

    // Aggregate Sales (Revenue)
    const salesAgg = await Sale.aggregate([
      { $match: salesFilter },
      {
        $group: {
          _id: null,
          grossSales: { $sum: '$subtotal' },
          totalDiscount: { $sum: '$discount' },
          totalTax: { $sum: '$tax' },
          netSales: { $sum: '$total' },
          transactionsCount: { $sum: 1 },
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

    const salesData = salesAgg[0] || {
      grossSales: 0,
      totalDiscount: 0,
      totalTax: 0,
      netSales: 0,
      transactionsCount: 0,
      cashSales: 0,
      cardSales: 0,
      onlineSales: 0,
    };

    // Aggregate Expenses by Category
    const categoryAgg = await Expense.aggregate([
      { $match: expenseFilter },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Categories mapping
    const expenseCategories = {
      SALARY: 0,
      RAW_MATERIALS: 0,
      UTILITIES: 0,
      RENT: 0,
      MAINTENANCE: 0,
      MARKETING: 0,
      OTHER: 0,
    };

    let totalExpenses = 0;
    let salaryExpenses = 0;
    let operatingExpenses = 0;

    categoryAgg.forEach((c) => {
      expenseCategories[c._id] = c.totalAmount;
      totalExpenses += c.totalAmount;
      if (c._id === 'SALARY') {
        salaryExpenses += c.totalAmount;
      } else {
        operatingExpenses += c.totalAmount;
      }
    });

    // Net Profit/Loss Calculation
    const netProfit = salesData.netSales - totalExpenses;
    const profitMargin = salesData.netSales > 0 ? (netProfit / salesData.netSales) * 100 : 0;

    // Fetch recent expense line items for the statement detail (up to 50)
    const expenseRecords = await Expense.find(expenseFilter)
      .sort({ date: -1 })
      .limit(50)
      .populate('workerId', 'name username role');

    res.json({
      success: true,
      timeframe,
      dateRange: {
        startDate: dateRange?.$gte || null,
        endDate: dateRange?.$lte || null,
      },
      revenue: {
        grossSales: salesData.grossSales || salesData.netSales,
        discounts: salesData.totalDiscount,
        taxes: salesData.totalTax,
        netSales: salesData.netSales,
        transactionsCount: salesData.transactionsCount,
        paymentBreakdown: {
          cash: salesData.cashSales,
          card: salesData.cardSales,
          online: salesData.onlineSales,
        },
      },
      expenses: {
        total: totalExpenses,
        salary: salaryExpenses,
        operating: operatingExpenses,
        byCategory: expenseCategories,
        categoryList: categoryAgg,
        recentExpenses: expenseRecords,
      },
      netProfit,
      profitMargin: Number(profitMargin.toFixed(2)),
      isProfitable: netProfit >= 0,
    });
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
