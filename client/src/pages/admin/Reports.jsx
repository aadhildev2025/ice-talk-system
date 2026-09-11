import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Search,
  FileSpreadsheet,
} from 'lucide-react';

const Reports = () => {
  const [timeframe, setTimeframe] = useState('today');
  const [salesData, setSalesData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  const { printCustomerReceipt } = usePrinter();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [resSummary, resSales] = await Promise.all([
        axios.get('/api/reports/dashboard'),
        axios.get(`/api/pos/sales?timeframe=${timeframe}&paymentMethod=${paymentFilter}&limit=100`),
      ]);

      if (resSummary.data.success) {
        setSummary(resSummary.data);
      }
      if (resSales.data.success) {
        setSalesData(resSales.data.sales);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [timeframe, paymentFilter]);

  const filteredSales = salesData.filter((s) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      s.saleNumber.toLowerCase().includes(term) ||
      s.tableNameSnapshot.toLowerCase().includes(term)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141419] p-5 rounded-2xl border border-[#24242E]">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white font-display flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            <span>Sales History & Financial Reports</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Analyze revenue, payment method breakdowns, and re-print historical customer tax receipts
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1.5 bg-[#1C1C24] p-1 rounded-xl border border-[#2B2B38] text-xs">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'week', label: '7 Days' },
            { id: 'month', label: 'This Month' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeframe === t.id
                  ? 'bg-[#FF6B00] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141419] border border-orange-500/30 p-5 rounded-2xl">
          <div className="flex justify-between items-center text-neutral-400 mb-2">
            <span className="text-[11px] font-bold text-orange-400 uppercase">GROSS REVENUE</span>
            <DollarSign className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-black text-white font-display">
            Rs. {totalGrossRevenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-neutral-400 mt-1">{filteredSales.length} Total Completed Sales</p>
        </div>

        <div className="bg-[#141419] border border-[#24242E] p-5 rounded-2xl">
          <div className="flex justify-between items-center text-neutral-400 mb-2">
            <span className="text-[11px] font-bold text-emerald-400 uppercase">CASH COLLECTION</span>
            <Banknote className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-300 font-display">
            Rs. {cashTotal.toLocaleString()}
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
            Rs. {cardTotal.toLocaleString()}
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
            Rs. {onlineTotal.toLocaleString()}
          </p>
          <p className="text-[10px] text-neutral-400 mt-1">
            {filteredSales.filter((s) => s.paymentMethod === 'ONLINE').length} Online Settlements
          </p>
        </div>
      </div>

      {/* Sales History Table */}
      <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#24242E]">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-orange-400" />
            <span>Completed Sales Ledger</span>
          </h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Payment filter */}
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

            {/* Search */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Receipt #, table..."
                className="w-full bg-[#1C1C24] border border-[#2B2B38] focus:border-[#FF6B00] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none"
              />
            </div>
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
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5 text-right">Receipt</th>
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
                      {sale.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
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
                    <td className="p-3.5 text-neutral-400">
                      {new Date(sale.createdAt).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="p-3.5 font-black text-[#FF6B00]">
                      Rs. {sale.total.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => printCustomerReceipt(sale, false)}
                        className="flex items-center gap-1 ml-auto px-3 py-1 bg-[#1C1C24] hover:bg-[#FF6B00] text-neutral-300 hover:text-white rounded-lg border border-[#2B2B38] font-bold text-[10px] transition-all"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print Bill</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
