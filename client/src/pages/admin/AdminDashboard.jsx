import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Flame,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Grid,
  BellRing,
  ArrowUpRight,
  Utensils,
  Coffee,
  AlertCircle,
} from 'lucide-react';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const [resMetrics, resTables] = await Promise.all([
        axios.get('/api/reports/dashboard'),
        axios.get('/api/tables'),
      ]);
      if (resMetrics.data.success) {
        setMetrics(resMetrics.data);
      }
      if (resTables.data.success) {
        setTables(resTables.data.tables);
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    if (socket) {
      socket.on('order:created', () => fetchDashboardData());
      socket.on('order:approved', () => fetchDashboardData());
      socket.on('order:ready', () => fetchDashboardData());
      socket.on('sale:completed', () => fetchDashboardData());
      socket.on('table:updated', () => fetchDashboardData());
    }

    return () => {
      if (socket) {
        socket.off('order:created');
        socket.off('order:approved');
        socket.off('order:ready');
        socket.off('sale:completed');
        socket.off('table:updated');
      }
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const counts = metrics?.orderStatusCounts || {
    pending: 0,
    approved: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
  };

  const today = metrics?.today || {
    totalSales: 0,
    salesCount: 0,
    totalOrders: 0,
    cashSales: 0,
    cardSales: 0,
    onlineSales: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141419] p-5 rounded-2xl border border-[#24242E]">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white font-display flex items-center gap-2">
            <span>Admin Dashboard</span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00] bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              Live Overview
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time management center for Ice Talk Family Restaurant
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/admin/order-receive')}
            className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E05A00] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 transition-all"
          >
            <BellRing className="w-4 h-4" />
            <span>Receive Orders ({counts.pending})</span>
          </button>
          <button
            onClick={() => navigate('/admin/pos')}
            className="flex items-center gap-2 bg-[#1E1E26] hover:bg-[#282834] text-white border border-[#323242] px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Open POS Billing</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Today's Sales */}
        <div className="bg-gradient-to-br from-[#1C1712] to-[#17171C] border border-orange-500/30 p-4 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">TODAY'S SALES</span>
            <DollarSign className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-xl md:text-2xl font-black text-white font-display">
            Rs. {today.totalSales.toLocaleString()}
          </p>
          <p className="text-[10px] text-neutral-400 mt-1">{today.salesCount} Settled Bills</p>
        </div>

        {/* Today's Orders */}
        <div className="bg-[#141418] border border-[#24242E] p-4 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">TOTAL ORDERS</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl md:text-2xl font-black text-white font-display">
            {today.totalOrders}
          </p>
          <p className="text-[10px] text-neutral-400 mt-1">Received today</p>
        </div>

        {/* Pending Orders */}
        <div
          onClick={() => navigate('/admin/order-receive')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            counts.pending > 0
              ? 'bg-amber-500/10 border-amber-500/50 hover:bg-amber-500/20'
              : 'bg-[#141418] border-[#24242E]'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">PENDING</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl md:text-2xl font-black text-amber-300 font-display">
            {counts.pending}
          </p>
          <p className="text-[10px] text-amber-400/80 mt-1">Awaiting approval</p>
        </div>

        {/* Preparing Orders */}
        <div
          onClick={() => navigate('/admin/orders?status=PREPARING')}
          className="cursor-pointer bg-[#141418] border border-[#24242E] hover:border-blue-500/40 p-4 rounded-2xl transition-all"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">PREPARING</span>
            <Flame className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl md:text-2xl font-black text-blue-300 font-display">
            {counts.preparing + counts.approved}
          </p>
          <p className="text-[10px] text-neutral-400 mt-1">In kitchen/prep</p>
        </div>

        {/* Ready Orders */}
        <div
          onClick={() => navigate('/admin/orders?status=READY')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            counts.ready > 0
              ? 'bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-500/20'
              : 'bg-[#141418] border-[#24242E]'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">READY</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl md:text-2xl font-black text-emerald-300 font-display">
            {counts.ready}
          </p>
          <p className="text-[10px] text-emerald-400/80 mt-1">Ready to serve</p>
        </div>

        {/* Completed Orders */}
        <div className="bg-[#141418] border border-[#24242E] p-4 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">COMPLETED</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl md:text-2xl font-black text-purple-300 font-display">
            {counts.completed}
          </p>
          <p className="text-[10px] text-neutral-400 mt-1">Settled today</p>
        </div>
      </div>

      {/* Tables Overview Grid & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tables Map (2 Cols) */}
        <div className="lg:col-span-2 bg-[#141418] border border-[#24242E] rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Grid className="w-4 h-4 text-orange-400" />
                <span>Restaurant Table Status</span>
              </h3>
              <p className="text-xs text-neutral-400">
                {tables.filter((t) => t.hasActiveOrder).length} of {tables.length} tables currently active
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/tables')}
              className="text-xs text-[#FF6B00] hover:underline font-semibold"
            >
              Manage Tables →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {tables.map((tbl) => {
              const hasOrder = tbl.hasActiveOrder;
              const isOccupied = tbl.status === 'OCCUPIED' || hasOrder;
              const isDisabled = tbl.status === 'DISABLED';

              return (
                <div
                  key={tbl._id}
                  onClick={() => {
                    if (hasOrder) {
                      navigate(`/admin/pos?table=${tbl._id}`);
                    }
                  }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isDisabled
                      ? 'bg-[#121216] border-neutral-800 opacity-50'
                      : isOccupied
                      ? 'bg-gradient-to-b from-[#2A1512] to-[#1C1414] border-rose-500/40 hover:border-rose-400 shadow-md shadow-rose-950/30'
                      : 'bg-[#1C1C24] border-[#2A2A38] hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-neutral-400">{tbl.type}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isDisabled
                          ? 'bg-neutral-600'
                          : isOccupied
                          ? 'bg-rose-500 animate-pulse'
                          : 'bg-emerald-500'
                      }`}
                    ></span>
                  </div>
                  <p className="font-black text-sm text-white truncate">{tbl.name}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{tbl.capacity} Seats</p>
                  {hasOrder && (
                    <div className="mt-1.5 pt-1.5 border-t border-rose-500/30 text-[10px] text-rose-300 font-bold">
                      Rs. {tbl.activeOrdersTotal?.toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Today's Collection</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-[#1C1C24] rounded-xl border border-[#2A2A38] flex justify-between items-center">
              <div>
                <p className="text-xs text-neutral-400 font-medium">Cash Payments</p>
                <p className="text-base font-bold text-white">Rs. {today.cashSales.toLocaleString()}</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20">
                CASH
              </span>
            </div>

            <div className="p-3 bg-[#1C1C24] rounded-xl border border-[#2A2A38] flex justify-between items-center">
              <div>
                <p className="text-xs text-neutral-400 font-medium">Card Payments</p>
                <p className="text-base font-bold text-white">Rs. {today.cardSales.toLocaleString()}</p>
              </div>
              <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20">
                CARD
              </span>
            </div>

            <div className="p-3 bg-[#1C1C24] rounded-xl border border-[#2A2A38] flex justify-between items-center">
              <div>
                <p className="text-xs text-neutral-400 font-medium">Online Transfers</p>
                <p className="text-base font-bold text-white">Rs. {today.onlineSales.toLocaleString()}</p>
              </div>
              <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-lg border border-purple-500/20">
                ONLINE
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#24242E] flex justify-between items-center">
            <span className="text-xs font-semibold text-neutral-300">Gross Revenue:</span>
            <span className="text-base font-extrabold text-[#FF6B00]">
              Rs. {today.totalSales.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 Cols) */}
        <div className="lg:col-span-2 bg-[#141418] border border-[#24242E] rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-orange-400" />
              <span>Recent Restaurant Orders</span>
            </h3>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs text-[#FF6B00] hover:underline font-semibold"
            >
              View All Orders →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1C1C24] text-neutral-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Order #</th>
                  <th className="p-3">Table</th>
                  <th className="p-3">Waiter</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24242E]">
                {metrics?.recentOrders?.length ? (
                  metrics.recentOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-[#1A1A22] transition-colors">
                      <td className="p-3 font-bold text-white">#{ord.orderNumber}</td>
                      <td className="p-3 text-neutral-300 font-medium">{ord.tableNameSnapshot}</td>
                      <td className="p-3 text-neutral-400">{ord.waiterNameSnapshot}</td>
                      <td className="p-3 text-neutral-400">{ord.items.length} items</td>
                      <td className="p-3 font-bold text-[#FF6B00]">Rs. {ord.total.toLocaleString()}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ord.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : ord.status === 'PREPARING' || ord.status === 'APPROVED'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                              : ord.status === 'READY'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : ord.status === 'COMPLETED'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {ord.status === 'PENDING' ? (
                          <button
                            onClick={() => navigate('/admin/order-receive')}
                            className="text-[10px] font-bold bg-[#FF6B00] text-white px-2.5 py-1 rounded-lg hover:bg-[#E05A00]"
                          >
                            Review
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate('/admin/orders')}
                            className="text-[10px] font-medium text-neutral-400 hover:text-white"
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center p-6 text-neutral-500">
                      No orders placed yet today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-[#141418] border border-[#24242E] rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Popular Menu Items</span>
          </h3>

          <div className="space-y-3">
            {metrics?.topItems?.length ? (
              metrics.topItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-[#1C1C24] rounded-xl border border-[#2B2B38] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-xs text-white">{item._id}</p>
                      <p className="text-[10px] text-neutral-400">{item.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xs text-emerald-400">{item.totalQty} sold</p>
                    <p className="text-[10px] text-neutral-400">Rs. {item.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 text-center py-6">No sales recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
