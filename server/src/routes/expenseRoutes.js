const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');

// All expense routes require authentication and admin or superadmin role
router.use(protect);
router.use(authorize('admin')); // Note: authorize('admin') also allows 'superadmin' automatically

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/summary')
  .get(getExpenseSummary);

router.route('/:id')
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;
