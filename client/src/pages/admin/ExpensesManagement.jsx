import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Wallet,
  Plus,
  Search,
  Calendar,
  Filter,
  Trash2,
  Edit2,
  Users,
  DollarSign,
  TrendingDown,
  Building2,
  FileText,
  Printer,
  RefreshCw,
  X,
  CheckCircle,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'SALARY', label: 'Worker Salary', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { id: 'RAW_MATERIALS', label: 'Raw Materials & Groceries', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'UTILITIES', label: 'Electricity / Water / Gas', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  { id: 'RENT', label: 'Rent & Lease', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'MAINTENANCE', label: 'Repairs & Maintenance', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  { id: 'MARKETING', label: 'Advertising & Marketing', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  { id: 'OTHER', label: 'General / Other Expense', color: 'bg-neutral-800 text-neutral-300 border-neutral-700' },
];

const PAYMENT_METHODS = [
  { id: 'CASH', label: 'Cash' },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { id: 'CARD', label: 'Card' },
  { id: 'ONLINE', label: 'Online / UPI' },
  { id: 'CHEQUE', label: 'Cheque' },
  { id: 'OTHER', label: 'Other' },
];

const ExpensesManagement = () => {
  const { user, isSuperAdmin } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    salaryTotal: 0,
    otherExpensesTotal: 0,
    count: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [timeframe, setTimeframe] = useState('thisMonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Staff users for salary picker
  const [staffList, setStaffList] = useState([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isSalaryType, setIsSalaryType] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'OTHER',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    recipient: '',
    workerId: '',
    description: '',
    receiptRef: '',
  });

  // Fetch staff users for salary recipient selection
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get('/api/auth/users');
        if (res.data.success) {
          setStaffList(res.data.users);
        }
      } catch (err) {
        console.error('Error fetching staff list:', err);
      }
    };
    fetchStaff();
  }, []);

  // Fetch expenses with active filters
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = {
        timeframe,
        category: categoryFilter,
        search,
        limit: 200,
      };
      if (timeframe === 'custom') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }

      const res = await axios.get('/api/expenses', { params });
      if (res.data.success) {
        setExpenses(res.data.data || []);
        setSummary(
          res.data.summary || {
            totalAmount: 0,
            salaryTotal: 0,
            otherExpensesTotal: 0,
            count: 0,
          }
        );
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [timeframe, categoryFilter, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExpenses();
  };

  const handleOpenAddModal = (salary = false) => {
    setEditingExpense(null);
    setIsSalaryType(salary);
    setFormData({
      title: salary ? 'Staff Monthly Salary' : '',
      category: salary ? 'SALARY' : 'RAW_MATERIALS',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
      recipient: '',
      workerId: '',
      description: '',
      receiptRef: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (exp) => {
    setEditingExpense(exp);
    setIsSalaryType(exp.category === 'SALARY');
    setFormData({
      title: exp.title || '',
      category: exp.category || 'OTHER',
      amount: exp.amount || '',
      date: exp.date ? new Date(exp.date).toISOString().split('T')[0] : '',
      paymentMethod: exp.paymentMethod || 'CASH',
      recipient: exp.recipient || '',
      workerId: exp.workerId?._id || exp.workerId || '',
      description: exp.description || '',
      receiptRef: exp.receiptRef || '',
    });
    setModalOpen(true);
  };

  const handleStaffSelect = (staffId) => {
    const selected = staffList.find((s) => s._id === staffId);
    if (selected) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      setFormData((prev) => ({
        ...prev,
        workerId: selected._id,
        recipient: selected.name,
        title: `Salary - ${selected.name} (${monthNames[now.getMonth()]} ${now.getFullYear()})`,
      }));
    } else {
      setFormData((prev) => ({ ...prev, workerId: '', recipient: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      alert('Please fill in both the title and amount.');
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        category: isSalaryType ? 'SALARY' : formData.category,
        amount: Number(formData.amount),
        workerId: formData.workerId ? formData.workerId : null,
      };

      if (editingExpense) {
        await axios.put(`/api/expenses/${editingExpense._id}`, payload);
      } else {
        await axios.post('/api/expenses', payload);
      }

      setModalOpen(false);
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteExpense = async (exp) => {
    if (window.confirm(`Are you sure you want to permanently delete expense: "${exp.title}" (Rs. ${exp.amount?.toLocaleString()})?`)) {
      try {
        await axios.delete(`/api/expenses/${exp._id}`);
        fetchExpenses();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete expense');
      }
    }
  };

  const handlePrintStatement = () => {
    window.print();
  };

  const getCategoryBadge = (catId) => {
    const found = CATEGORIES.find((c) => c.id === catId);
    const badgeColor = found ? found.color : 'bg-neutral-800 text-neutral-300 border-neutral-700';
    const label = found ? found.label : catId;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badgeColor}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141419] p-5 rounded-2xl border border-[#24242E] shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white font-display flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Wallet className="w-6 h-6" />
            </div>
            <span>Expenses & Salaries Management</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Track restaurant operational overheads, raw material purchases, and worker payroll records
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleOpenAddModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-500/20 transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Pay Salary</span>
          </button>
          <button
            onClick={() => handleOpenAddModal(false)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#FF6B00] hover:bg-[#E05A00] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
          <button
            onClick={handlePrintStatement}
            title="Print Expense Statement"
            className="hidden sm:flex items-center gap-1.5 bg-[#1C1C24] hover:bg-[#252532] text-neutral-300 hover:text-white px-3 py-2.5 rounded-xl text-xs font-bold border border-[#2B2B38] transition-all"
          >
            <Printer className="w-4 h-4 text-neutral-400" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="bg-[#141418] border border-[#24242E] p-4 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Expenses</p>
              <h3 className="text-xl md:text-2xl font-black text-rose-400 mt-1 font-display">
                Rs. {summary.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-neutral-500 mt-2">
            {summary.count} recorded entries in current filter
          </p>
        </div>

        {/* Worker Salaries */}
        <div className="bg-[#141418] border border-[#24242E] p-4 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Worker Salaries</p>
              <h3 className="text-xl md:text-2xl font-black text-purple-400 mt-1 font-display">
                Rs. {summary.salaryTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-purple-400/80 mt-2 font-medium">
            Staff payroll disbursements
          </p>
        </div>

        {/* Operations & Raw Materials */}
        <div className="bg-[#141418] border border-[#24242E] p-4 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Operational Costs</p>
              <h3 className="text-xl md:text-2xl font-black text-amber-400 mt-1 font-display">
                Rs. {summary.otherExpensesTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-amber-400/80 mt-2 font-medium">
            Raw materials, utilities & rent
          </p>
        </div>

        {/* Active Filter Period Indicator */}
        <div className="bg-[#141418] border border-[#24242E] p-4 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Active Period</p>
            <p className="text-base font-bold text-white mt-1 capitalize">
              {timeframe === 'today' ? "Today's Expenses"
                : timeframe === 'yesterday' ? "Yesterday's Expenses"
                : timeframe === 'thisWeek' ? 'This Week'
                : timeframe === 'thisMonth' ? 'This Month'
                : timeframe === 'lastMonth' ? 'Last Month'
                : timeframe === 'thisYear' ? 'This Year'
                : timeframe === 'lastYear' ? 'Last Year'
                : timeframe === 'all' ? 'All Time'
                : 'Custom Date Range'}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] text-neutral-400">Live Synchronized</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-4 space-y-3">
        {/* Preset timeframe pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'thisWeek', label: 'This Week' },
            { id: 'thisMonth', label: 'This Month' },
            { id: 'lastMonth', label: 'Last Month' },
            { id: 'thisYear', label: 'This Year' },
            { id: 'lastYear', label: 'Last Year' },
            { id: 'all', label: 'All' },
            { id: 'custom', label: 'Custom Range' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                timeframe === t.id
                  ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-500/20'
                  : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2B2B38]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Custom Range pickers if active */}
        {timeframe === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 bg-[#181820] p-3 rounded-xl border border-[#2B2B38]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#141418] border border-[#2D2D3B] text-white text-xs px-2.5 py-1 rounded-lg outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#141418] border border-[#2D2D3B] text-white text-xs px-2.5 py-1 rounded-lg outline-none"
              />
            </div>
          </div>
        )}

        {/* Categories and Search Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-1">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#1C1C24] border border-[#2B2B38] text-neutral-300 text-xs px-3 py-2 rounded-xl outline-none focus:border-[#FF6B00]"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, worker, receipt #..."
              className="w-full bg-[#1C1C24] border border-[#2B2B38] focus:border-[#FF6B00] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-neutral-500 outline-none"
            />
          </form>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-[#141418] border border-[#24242E] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-16 text-center text-neutral-500 space-y-2">
            <Wallet className="w-12 h-12 mx-auto text-neutral-600 opacity-40" />
            <p className="text-sm font-semibold text-neutral-400">No expenses recorded for this period</p>
            <p className="text-xs text-neutral-600">Click "Record Expense" or "Pay Salary" above to add an entry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1C1C24] text-neutral-400 uppercase text-[10px] tracking-wider border-b border-[#24242E]">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Title / Description</th>
                  <th className="p-4">Recipient / Staff</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Receipt Ref</th>
                  <th className="p-4 text-right">Amount (LKR)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24242E]">
                {expenses.map((exp) => {
                  const formattedDate = exp.date
                    ? new Date(exp.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '-';

                  return (
                    <tr key={exp._id} className="hover:bg-[#1A1A22] transition-colors">
                      <td className="p-4 font-mono text-neutral-400 whitespace-nowrap">{formattedDate}</td>
                      <td className="p-4 whitespace-nowrap">{getCategoryBadge(exp.category)}</td>
                      <td className="p-4">
                        <p className="font-bold text-white text-xs">{exp.title}</p>
                        {exp.description && (
                          <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">{exp.description}</p>
                        )}
                      </td>
                      <td className="p-4 text-neutral-300">
                        {exp.recipient ? (
                          <span className="font-semibold text-white">{exp.recipient}</span>
                        ) : exp.workerId?.name ? (
                          <span className="font-semibold text-purple-300">{exp.workerId.name}</span>
                        ) : (
                          <span className="text-neutral-500 italic">-</span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#1C1C24] text-[10px] font-mono font-semibold text-neutral-300 border border-[#2B2B38]">
                          {exp.paymentMethod || 'CASH'}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-neutral-400 whitespace-nowrap">
                        {exp.receiptRef || '-'}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap font-mono font-bold text-white text-sm">
                        Rs. {exp.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(exp)}
                            title="Edit Expense"
                            className="p-1.5 rounded-lg bg-[#1C1C24] hover:bg-[#252532] text-neutral-300 hover:text-white border border-[#2B2B38]"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(exp)}
                            title="Delete Expense"
                            className="p-1.5 rounded-lg bg-[#1C1C24] hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-[#2B2B38]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Expense & Salary Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141419] border border-[#24242E] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header with Type Selector */}
            <div className="p-4 bg-[#181820] border-b border-[#24242E] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-base">
                  {editingExpense ? 'Edit Entry' : isSalaryType ? 'Record Worker Salary' : 'Record Restaurant Expense'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {isSalaryType ? 'Record staff payroll disbursement' : 'Record operational cost or ingredient purchase'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#141418] text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type switcher tabs if creating new */}
            {!editingExpense && (
              <div className="grid grid-cols-2 p-2 bg-[#101014] border-b border-[#24242E] gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsSalaryType(false);
                    setFormData((prev) => ({ ...prev, category: 'RAW_MATERIALS', title: '' }));
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    !isSalaryType
                      ? 'bg-[#FF6B00] text-white shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  General Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSalaryType(true);
                    setFormData((prev) => ({
                      ...prev,
                      category: 'SALARY',
                      title: 'Staff Monthly Salary',
                    }));
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    isSalaryType
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Worker Salary
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {/* If Salary -> Select Staff Member */}
              {isSalaryType && (
                <div>
                  <label className="block font-bold text-neutral-300 mb-1 uppercase">Select Staff Member</label>
                  <select
                    value={formData.workerId}
                    onChange={(e) => handleStaffSelect(e.target.value)}
                    className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-purple-500 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="">-- Choose Staff Member or Type Below --</option>
                    {staffList.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} (@{s.username} - {s.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title / Description */}
              <div>
                <label className="block font-bold text-neutral-300 mb-1 uppercase">
                  {isSalaryType ? 'Salary Description / Period' : 'Expense Title / Purpose'}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={isSalaryType ? 'e.g. Salary - Kasun (March 2026)' : 'e.g. Vegetables & Chicken restock'}
                  className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2 text-white outline-none"
                  required
                />
              </div>

              {/* Category (If general expense) */}
              {!isSalaryType && (
                <div>
                  <label className="block font-bold text-neutral-300 mb-1 uppercase">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2 text-white outline-none"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'SALARY').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Amount and Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1 uppercase">Amount (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2 text-white font-mono font-bold outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-300 mb-1 uppercase">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2 text-white outline-none"
                    required
                  />
                </div>
              </div>

              {/* Recipient & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1 uppercase">
                    {isSalaryType ? 'Recipient Name' : 'Paid To (Vendor / Supplier)'}
                  </label>
                  <input
                    type="text"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    placeholder={isSalaryType ? 'Worker name' : 'Supplier / Company name'}
                    className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-300 mb-1 uppercase">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2 text-white outline-none"
                  >
                    {PAYMENT_METHODS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Receipt / Voucher # */}
              <div>
                <label className="block font-bold text-neutral-300 mb-1 uppercase">Receipt / Voucher # (Optional)</label>
                <input
                  type="text"
                  value={formData.receiptRef}
                  onChange={(e) => setFormData({ ...formData, receiptRef: e.target.value })}
                  placeholder="e.g. INV-2026-0042 / Voucher 12"
                  className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              {/* Notes / Description */}
              <div>
                <label className="block font-bold text-neutral-300 mb-1 uppercase">Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional notes, payment details, or item breakdown..."
                  className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl p-2.5 text-white outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#24242E]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-semibold hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className={`px-5 py-2 rounded-xl text-white font-bold disabled:opacity-50 ${
                    isSalaryType ? 'bg-purple-600 hover:bg-purple-500' : 'bg-[#FF6B00] hover:bg-[#E05A00]'
                  }`}
                >
                  {formLoading ? 'Saving...' : editingExpense ? 'Update Entry' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesManagement;
