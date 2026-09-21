import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { usePrinter } from '../../context/PrinterContext';
import {
  BarChart3,
  Calendar,
  DollarSign,
  Printer,
  CreditCard,
  Banknote,
  Globe,
  TrendingUp,
  TrendingDown,
  Search,
  FileSpreadsheet,
  Trash2,
  PieChart,
  Layers,
  Users,
  Building2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

const Reports = () => {
  const { isSuperAdmin } = useAuth();
  const { printCustomerReceipt } = usePrinter();

  // Active Main Tab: 'sales' or 'pnl'
  const [activeTab, setActiveTab] = useState('sales');

  // Filters
  const [timeframe, setTimeframe] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Data States
  const [salesData, setSalesData] = useState([]);
  const [pnlData, setPnlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pnlLoading, setPnlLoading] = useState(false);

  // Deletion modal state
  const [deletingSale, setDeletingSale] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch Sales Ledger
  const fetchSalesReports = async () => {
    setLoading(true);
    try {
      const params = {
        timeframe,
        paymentMethod: paymentFilter,
        search,
        limit: 250,
      };
      if (timeframe === 'custom') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }

      const res = await axios.get('/api/pos/sales', { params });
      if (res.data.success) {
        setSalesData(res.data.sales || []);
      }
    } catch (err) {
      console.error('Error fetching sales ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Profit & Loss Report
  const fetchPnlReport = async () => {
    setPnlLoading(true);
    try {
      const params = { timeframe };
      if (timeframe === 'custom') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }

      const res = await axios.get('/api/reports/profit-loss', { params });
      if (res.data.success) {
        setPnlData(res.data);
      }
    } catch (err) {
      console.error('Error fetching P&L report:', err);
    } finally {
      setPnlLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesReports();
    } else {
      fetchPnlReport();
    }
  }, [activeTab, timeframe, paymentFilter, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'sales') {
      fetchSalesReports();
    }
  };

  // Super Admin Delete Sale Transaction
  const confirmDeleteSale = async () => {
    if (!deletingSale) return;
    setDeleteLoading(true);
    try {
      const res = await axios.delete(`/api/pos/sales/${deletingSale._id}`);
      if (res.data.success) {
        setDeletingSale(null);
        fetchSalesReports();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete transaction');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredSales = salesData.filter((s) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      s.saleNumber?.toLowerCase().includes(term) ||
      s.tableNameSnapshot?.toLowerCase().includes(term)
    );
  });

  const totalGrossRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const cashTotal = filteredSales
    .filter((s) => s.paymentMethod === 'CASH')
    .reduce((sum, s) => sum + s.total, 0);
  const cardTotal = filteredSales
    .filter((s) => s.paymentMethod === 'CARD')
    .reduce((sum, s) => sum + s.total, 0);
  const onlineTotal = filteredSales
    .filter((s) => s.paymentMethod === 'ONLINE')
    .reduce((sum, s) => sum + s.total, 0);

  const printPnLStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141419] p-5 rounded-2xl border border-[#24242E] shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white font-display flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span>Financial Reports & Analytics</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Historical sales ledger, multi-year reporting, and comprehensive Profit & Loss (P&L) statements
          </p>
        </div>

        {/* View Toggle (Sales Ledger vs P&L Statement) */}
        <div className="flex items-center gap-1.5 bg-[#181820] p-1 rounded-xl border border-[#2B2B38] w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'sales'
                ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Sales Ledger</span>
          </button>
          <button
            onClick={() => setActiveTab('pnl')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'pnl'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Profit & Loss (P&L)</span>
          </button>
        </div>
      </div>

      {/* Date & Timeframe Filter Bar (Includes multi-year, last year, all time) */}
      <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'thisWeek', label: 'This Week' },
            { id: 'thisMonth', label: 'This Month' },
            { id: 'lastMonth', label: 'Last Month' },
            { id: 'thisYear', label: 'This Year' },
            { id: 'lastYear', label: 'Last Year' },
            { id: 'all', label: 'All Time' },
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

        {/* Custom Range pickers */}
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
      </div>

      {/* VIEW 1: SALES LEDGER */}
      {activeTab === 'sales' && (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#141419] border border-orange-500/30 p-5 rounded-2xl">
              <div className="flex justify-between items-center text-neutral-400 mb-2">
                <span className="text-[11px] font-bold text-orange-400 uppercase">GROSS REVENUE</span>
                <DollarSign className="w-4 h-4 text-orange-400" />
              </div>
              <p className="text-2xl font-black text-white font-display">
                Rs. {totalGrossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-neutral-400 mt-1">{filteredSales.length} Total Completed Sales</p>
            </div>

            <div className="bg-[#141419] border border-[#24242E] p-5 rounded-2xl">
              <div className="flex justify-between items-center text-neutral-400 mb-2">
                <span className="text-[11px] font-bold text-emerald-400 uppercase">CASH COLLECTION</span>
                <Banknote className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-300 font-display">
                Rs. {cashTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-neutral-400 mt-1">
                {filteredSales.filter((s) => s.paymentMethod === 'CASH').length} Cash Bills
              </p>
            </div>

            <div className="bg-[#141419] border border-[#24242E] p-5 rounded-2xl">
              <div className="flex justify-between items-center text-neutral-400 mb-2">
                <span className="text-[11px] font-bold text-blue-400 uppercase">CARD PAYMENTS</span>
                <CreditCard className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-black text-blue-300 font-display">
                Rs. {cardTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-neutral-400 mt-1">
                {filteredSales.filter((s) => s.paymentMethod === 'CARD').length} POS Card Swipes
              </p>
            </div>

            <div className="bg-[#141419] border border-[#24242E] p-5 rounded-2xl">
              <div className="flex justify-between items-center text-neutral-400 mb-2">
                <span className="text-[11px] font-bold text-purple-400 uppercase">ONLINE TRANSFERS</span>
                <Globe className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-purple-300 font-display">
                Rs. {onlineTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-neutral-400 mt-1">
                {filteredSales.filter((s) => s.paymentMethod === 'ONLINE').length} Online Settlements
              </p>
            </div>
          </div>

          {/* Sales History Table */}
          <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#24242E]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-orange-400" />
                <span className="font-bold text-base text-white">Completed Sales Ledger</span>
                {isSuperAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Super Admin Controls Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="bg-[#1C1C24] border border-[#2B2B38] text-neutral-300 text-xs rounded-xl px-3 py-1.5 outline-none"
                >
                  <option value="ALL">All Payments</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="ONLINE">Online</option>
                </select>

                <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-56">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Receipt #, table..."
                    className="w-full bg-[#1C1C24] border border-[#2B2B38] focus:border-[#FF6B00] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none"
                  />
                </form>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-3 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="p-10 text-center text-neutral-500 text-xs">
                No sales records found for the selected period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1C1C24] text-neutral-400 uppercase text-[10px] tracking-wider border-b border-[#24242E]">
                    <tr>
                      <th className="p-3.5">Invoice #</th>
                      <th className="p-3.5">Table</th>
                      <th className="p-3.5">Orders</th>
                      <th className="p-3.5">Items Summary</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5">Date & Time</th>
                      <th className="p-3.5 text-right">Total (LKR)</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#24242E]">
                    {filteredSales.map((sale) => (
                      <tr key={sale._id} className="hover:bg-[#1A1A22] transition-colors">
                        <td className="p-3.5 font-bold font-mono text-white text-xs">{sale.saleNumber}</td>
                        <td className="p-3.5 font-semibold text-neutral-200">{sale.tableNameSnapshot}</td>
                        <td className="p-3.5 text-neutral-400">
                          #{Array.isArray(sale.orderNumbers) ? sale.orderNumbers.join(', #') : sale.orderNumbers}
                        </td>
                        <td className="p-3.5 text-neutral-300 max-w-xs truncate">
                          {sale.items?.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sale.paymentMethod === 'CASH'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : sale.paymentMethod === 'CARD'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-purple-500/20 text-purple-400'
                            }`}
                          >
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="p-3.5 text-neutral-400 whitespace-nowrap">
                          {new Date(sale.createdAt).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="p-3.5 font-black text-[#FF6B00] text-right whitespace-nowrap">
                          Rs. {sale.total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => printCustomerReceipt(sale, false)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-[#1C1C24] hover:bg-[#FF6B00] text-neutral-300 hover:text-white rounded-lg border border-[#2B2B38] font-bold text-[10px] transition-all"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Bill</span>
                            </button>

                            {/* Delete Transaction - Super Admin Only */}
                            {isSuperAdmin && (
                              <button
                                onClick={() => setDeletingSale(sale)}
                                title="Delete Sale (Super Admin Only)"
                                className="p-1.5 rounded-lg bg-[#1C1C24] hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-[#2B2B38] transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* VIEW 2: PROFIT & LOSS (P&L) STATEMENT */}
      {activeTab === 'pnl' && (
        <div className="space-y-6">
          {pnlLoading ? (
            <div className="flex items-center justify-center h-64 bg-[#141418] border border-[#24242E] rounded-2xl">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !pnlData ? (
            <div className="p-12 text-center text-neutral-500 bg-[#141418] border border-[#24242E] rounded-2xl text-xs">
              No financial data available for this timeframe.
            </div>
          ) : (
            <>
              {/* Executive P&L Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Net Sales */}
                <div className="bg-[#141418] border border-[#24242E] p-5 rounded-2xl relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Net Sales (Revenue)</p>
                      <h3 className="text-xl md:text-2xl font-black text-emerald-400 mt-1 font-display">
                        Rs. {pnlData.revenue?.netSales?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-2">
                    {pnlData.revenue?.transactionsCount} completed transactions
                  </p>
                </div>

                {/* Total Expenses */}
                <div className="bg-[#141418] border border-[#24242E] p-5 rounded-2xl relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Expenses</p>
                      <h3 className="text-xl md:text-2xl font-black text-rose-400 mt-1 font-display">
                        Rs. {pnlData.expenses?.total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-2">
                    Salary: Rs. {pnlData.expenses?.salary?.toLocaleString()} | Ops: Rs. {pnlData.expenses?.operating?.toLocaleString()}
                  </p>
                </div>

                {/* Net Profit / Loss */}
                <div
                  className={`border p-5 rounded-2xl relative overflow-hidden ${
                    pnlData.isProfitable
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-rose-950/20 border-rose-500/40'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        {pnlData.isProfitable ? 'Net Profit' : 'Net Loss'}
                      </p>
                      <h3
                        className={`text-xl md:text-2xl font-black mt-1 font-display ${
                          pnlData.isProfitable ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        Rs. {pnlData.netProfit?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <div
                      className={`p-2.5 rounded-xl border ${
                        pnlData.isProfitable
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {pnlData.isProfitable ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-300 mt-2 font-semibold">
                    Profit Margin: {pnlData.profitMargin}%
                  </p>
                </div>

                {/* Profit Margin Status */}
                <div className="bg-[#141418] border border-[#24242E] p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Financial Status</p>
                    <p
                      className={`text-lg font-black mt-1 ${
                        pnlData.isProfitable ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {pnlData.isProfitable ? 'PROFITABLE' : 'OPERATING AT LOSS'}
                    </p>
                  </div>
                  <button
                    onClick={printPnLStatement}
                    className="flex items-center justify-center gap-1.5 w-full mt-2 py-1.5 bg-[#1C1C24] hover:bg-[#252532] text-white text-xs font-bold rounded-xl border border-[#2B2B38] transition-all"
                  >
                    <Printer className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Print P&L Statement</span>
                  </button>
                </div>
              </div>

              {/* Printable P&L Statement Detailed Table */}
              <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-[#24242E]">
                  <div>
                    <h2 className="text-lg font-black text-white font-display uppercase tracking-wider">
                      ICE TALK FAMILY RESTAURANT
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Statement of Profit and Loss (Income Statement)
                    </p>
                  </div>
                  <span className="text-xs font-bold text-neutral-400 uppercase bg-[#1C1C24] px-3 py-1 rounded-xl border border-[#2B2B38]">
                    Period: {timeframe}
                  </span>
                </div>

                {/* Section 1: Revenue Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-neutral-400 tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>1. Operating Revenue (Sales)</span>
                  </h4>
                  <div className="bg-[#181820] rounded-xl p-4 border border-[#2B2B38] space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-300 py-1">
                      <span>Gross Sales Revenue</span>
                      <span className="font-mono font-semibold">
                        Rs. {pnlData.revenue?.grossSales?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-rose-400/80 py-1">
                      <span>Less: Customer Discounts</span>
                      <span className="font-mono font-semibold">
                        - Rs. {pnlData.revenue?.discounts?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold border-t border-[#24242E] pt-2 text-sm">
                      <span>Total Net Sales (A)</span>
                      <span className="font-mono">
                        Rs. {pnlData.revenue?.netSales?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Operating Expenses Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-neutral-400 tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span>2. Operating Expenses</span>
                  </h4>
                  <div className="bg-[#181820] rounded-xl p-4 border border-[#2B2B38] space-y-2.5 text-xs">
                    <div className="flex justify-between text-purple-300 py-1 border-b border-[#24242E]/50 pb-2">
                      <span className="font-bold flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" />
                        <span>Worker Salaries & Wages</span>
                      </span>
                      <span className="font-mono font-bold">
                        Rs. {(pnlData.expenses?.byCategory?.SALARY || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-300 py-1">
                      <span>Raw Materials & Food Groceries</span>
                      <span className="font-mono font-semibold">
                        Rs. {(pnlData.expenses?.byCategory?.RAW_MATERIALS || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-300 py-1">
                      <span>Utilities (Electricity, Water, Cooking Gas)</span>
                      <span className="font-mono font-semibold">
                        Rs. {(pnlData.expenses?.byCategory?.UTILITIES || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-300 py-1">
                      <span>Rent & Premises Lease</span>
                      <span className="font-mono font-semibold">
                        Rs. {(pnlData.expenses?.byCategory?.RENT || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-300 py-1">
                      <span>Repairs & Maintenance</span>
                      <span className="font-mono font-semibold">
                        Rs. {(pnlData.expenses?.byCategory?.MAINTENANCE || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-300 py-1">
                      <span>Marketing & Promotion</span>
                      <span className="font-mono font-semibold">
                        Rs. {(pnlData.expenses?.byCategory?.MARKETING || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-300 py-1">
                      <span>General & Other Miscellaneous</span>
                      <span className="font-mono font-semibold">
                        Rs. {(pnlData.expenses?.byCategory?.OTHER || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between text-rose-400 font-bold border-t border-[#24242E] pt-2 text-sm">
                      <span>Total Operating Expenses (B)</span>
                      <span className="font-mono">
                        Rs. {pnlData.expenses?.total?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Net Profit / Loss Result */}
                <div
                  className={`rounded-xl p-5 border flex flex-col sm:flex-row justify-between items-center gap-3 ${
                    pnlData.isProfitable
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-rose-500/10 border-rose-500/40'
                  }`}
                >
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wider text-white">
                      Net Income / Operating Profit (A - B)
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Net operational earnings after all expense and salary deductions
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-black font-display ${
                        pnlData.isProfitable ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      Rs. {pnlData.netProfit?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11px] font-bold text-neutral-400 mt-0.5">
                      Margin: {pnlData.profitMargin}%
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Super Admin Delete Transaction Confirmation Modal */}
      {deletingSale && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141419] border border-rose-500/50 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Delete Transaction</h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to permanently delete sale{' '}
              <span className="font-bold text-white font-mono">{deletingSale.saleNumber}</span>{' '}
              (Total: <span className="font-bold text-white">Rs. {deletingSale.total?.toLocaleString()}</span>)?
            </p>

            <div className="bg-[#181820] p-3 rounded-xl border border-[#2B2B38] text-[11px] text-neutral-400 space-y-1">
              <p>• Table: <span className="text-white font-semibold">{deletingSale.tableNameSnapshot}</span></p>
              <p>• Method: <span className="text-white font-semibold">{deletingSale.paymentMethod}</span></p>
              <p>• Date: <span className="text-white font-semibold">{new Date(deletingSale.createdAt).toLocaleString()}</span></p>
              <p className="text-rose-400 font-bold pt-1">
                Warning: This action is permanent and can only be performed by the Super Admin.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#24242E]">
              <button
                type="button"
                onClick={() => setDeletingSale(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-semibold text-xs hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={confirmDeleteSale}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
