const Expense = require('../models/Expense');
const User = require('../models/User');

// Helper to construct date ranges
const getDateFilter = (timeframe, customStart, customEnd) => {
  const now = new Date();
  let start, end;

  if (timeframe === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (timeframe === 'yesterday') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
  } else if (timeframe === 'thisWeek') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    start = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0);
    end = new Date();
  } else if (timeframe === 'thisMonth') {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    end = new Date();
  } else if (timeframe === 'lastMonth') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (timeframe === 'thisYear') {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    end = new Date();
  } else if (timeframe === 'lastYear') {
    start = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0);
    end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
  } else if (customStart || customEnd) {
    if (customStart) {
      start = new Date(customStart);
      start.setHours(0, 0, 0, 0);
    }
    if (customEnd) {
      end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
    }
  }

  const filter = {};
  if (start && end) {
    filter.$gte = start;
    filter.$lte = end;
  } else if (start) {
    filter.$gte = start;
  } else if (end) {
    filter.$lte = end;
  }
  return Object.keys(filter).length > 0 ? filter : null;
};

// @desc    Get all expenses with filters & summary
// @route   GET /api/expenses
// @access  Private (Admin, SuperAdmin)
const getExpenses = async (req, res) => {
  try {
    const { category, timeframe, startDate, endDate, search, limit = 100, page = 1 } = req.query;

    const query = {};

    if (category && category !== 'ALL') {
      query.category = category;
    }

    const dateRange = getDateFilter(timeframe, startDate, endDate);
    if (dateRange) {
      query.date = dateRange;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { recipient: { $regex: search, $options: 'i' } },
        { receiptRef: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('workerId', 'name username role');

    const totalCount = await Expense.countDocuments(query);

    // Calculate totals for filtered query
    const stats = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          salaryTotal: {
            $sum: {
              $cond: [{ $eq: ['$category', 'SALARY'] }, '$amount', 0],
            },
          },
          otherExpensesTotal: {
            $sum: {
              $cond: [{ $ne: ['$category', 'SALARY'] }, '$amount', 0],
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = stats[0] || {
      totalAmount: 0,
      salaryTotal: 0,
      otherExpensesTotal: 0,
      count: 0,
    };

    res.json({
      success: true,
      data: expenses,
      summary,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses',
      error: error.message,
    });
  }
};

// @desc    Create new expense or salary record
// @route   POST /api/expenses
// @access  Private (Admin, SuperAdmin)
const createExpense = async (req, res) => {
  try {
    const {
      title,
      category,
      amount,
      date,
      paymentMethod,
      recipient,
      workerId,
      description,
      receiptRef,
    } = req.body;

    if (!title || !category || amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and amount are required.',
      });
    }

    const expense = new Expense({
      title: title.trim(),
      category,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'CASH',
      recipient: recipient ? recipient.trim() : '',
      workerId: workerId || null,
      description: description ? description.trim() : '',
      receiptRef: receiptRef ? receiptRef.trim() : '',
      recordedBy: req.user ? req.user._id : null,
      recordedByName: req.user ? req.user.name : 'Admin',
    });

    const saved = await expense.save();
    if (saved.workerId) {
      await saved.populate('workerId', 'name username role');
    }

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      data: saved,
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record expense',
      error: error.message,
    });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private (Admin, SuperAdmin)
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      amount,
      date,
      paymentMethod,
      recipient,
      workerId,
      description,
      receiptRef,
    } = req.body;

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found',
      });
    }

    if (title !== undefined) expense.title = title.trim();
    if (category !== undefined) expense.category = category;
    if (amount !== undefined) expense.amount = Number(amount);
    if (date !== undefined) expense.date = new Date(date);
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;
    if (recipient !== undefined) expense.recipient = recipient.trim();
    if (workerId !== undefined) expense.workerId = workerId || null;
    if (description !== undefined) expense.description = description.trim();
    if (receiptRef !== undefined) expense.receiptRef = receiptRef.trim();

    const updated = await expense.save();
    if (updated.workerId) {
      await updated.populate('workerId', 'name username role');
    }

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expense',
      error: error.message,
    });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private (Admin, SuperAdmin)
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found',
      });
    }

    await Expense.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Expense deleted successfully',
      id,
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
      error: error.message,
    });
  }
};

// @desc    Get expense summary by category for dashboard/reporting
// @route   GET /api/expenses/summary
// @access  Private (Admin, SuperAdmin)
const getExpenseSummary = async (req, res) => {
  try {
    const { timeframe, startDate, endDate } = req.query;
    const match = {};

    const dateRange = getDateFilter(timeframe, startDate, endDate);
    if (dateRange) {
      match.date = dateRange;
    }

    const byCategory = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalStats = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          grandTotal: { $sum: '$amount' },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        byCategory,
        grandTotal: totalStats[0]?.grandTotal || 0,
        totalCount: totalStats[0]?.totalCount || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense summary',
      error: error.message,
    });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  getDateFilter,
};
