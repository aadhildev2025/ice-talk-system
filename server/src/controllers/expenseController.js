const localDataService = require('../services/localDataService');

// @desc    Get all expenses with filters & summary (from local computer storage)
// @route   GET /api/expenses
// @access  Private (Admin, SuperAdmin)
const getExpenses = async (req, res) => {
  try {
    const { category, timeframe, startDate, endDate, search, limit = 100, page = 1 } = req.query;

    let expenses = localDataService.getExpenses({
      category,
      timeframe,
      startDate,
      endDate,
      search,
    });

    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    let totalAmount = 0;
    let salaryTotal = 0;
    let otherExpensesTotal = 0;

    expenses.forEach((e) => {
      const amt = Number(e.amount) || 0;
      totalAmount += amt;
      if (e.category === 'SALARY') {
        salaryTotal += amt;
      } else {
        otherExpensesTotal += amt;
      }
    });

    const totalCount = expenses.length;
    const lim = parseInt(limit) || 100;
    const pg = parseInt(page) || 1;
    const skip = (pg - 1) * lim;
    const paginated = expenses.slice(skip, skip + lim);

    res.json({
      success: true,
      data: paginated,
      summary: {
        totalAmount,
        salaryTotal,
        otherExpensesTotal,
        count: totalCount,
      },
      pagination: {
        page: pg,
        limit: lim,
        totalCount,
        totalPages: Math.ceil(totalCount / lim) || 1,
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

// @desc    Create new expense or salary record (saves to local computer storage)
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

    const newExpense = localDataService.saveExpense({
      title: title.trim(),
      category,
      amount: Number(amount),
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      paymentMethod: paymentMethod || 'CASH',
      recipient: recipient ? recipient.trim() : '',
      workerId: workerId || null,
      description: description ? description.trim() : '',
      receiptRef: receiptRef ? receiptRef.trim() : '',
      recordedByName: req.user ? req.user.name : 'Staff',
      isDemo: Boolean(req.user?.isDemo),
    });

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully (Stored Locally)',
      data: newExpense,
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

// @desc    Update an expense (in local computer storage)
// @route   PUT /api/expenses/:id
// @access  Private (Admin, SuperAdmin)
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = localDataService.updateExpense(id, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found',
      });
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

// @desc    Delete an expense (from local computer storage)
// @route   DELETE /api/expenses/:id
// @access  Private (Admin, SuperAdmin)
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    localDataService.deleteExpense(id);

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
    const expenses = localDataService.getExpenses({ timeframe, startDate, endDate });

    const catMap = {};
    let grandTotal = 0;

    expenses.forEach((e) => {
      const cat = e.category || 'OTHER';
      const amt = Number(e.amount) || 0;
      catMap[cat] = (catMap[cat] || 0) + amt;
      grandTotal += amt;
    });

    const byCategory = Object.entries(catMap).map(([k, v]) => ({
      _id: k,
      total: v,
    })).sort((a, b) => b.total - a.total);

    res.json({
      success: true,
      data: {
        byCategory,
        grandTotal,
        totalCount: expenses.length,
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
};
