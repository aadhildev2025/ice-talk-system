import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { usePrinter } from '../../context/PrinterContext';
import {
  ClipboardList,
  Search,
  Printer,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Flame,
  ChevronRight,
  Filter,
} from 'lucide-react';

const AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const [activeTab, setActiveTab] = useState(initialStatus);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { socket } = useSocket();
  const { printPreparationSlip } = usePrinter();

  const fetchOrders = async () => {
    try {
      let url = '/api/orders?limit=100';
      if (activeTab !== 'ALL') {
        url += `&status=${activeTab}`;
      }
      const res = await axios.get(url);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    if (socket) {
      socket.on('order:created', () => fetchOrders());
      socket.on('order:approved', () => fetchOrders());
      socket.on('order:ready', () => fetchOrders());
      socket.on('order:status_updated', () => fetchOrders());
      socket.on('order:cancelled', () => fetchOrders());
    }

    return () => {
      if (socket) {
        socket.off('order:created');
        socket.off('order:approved');
        socket.off('order:ready');
        socket.off('order:status_updated');
        socket.off('order:cancelled');
      }
    };
  }, [activeTab, socket]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'ALL' ? {} : { status: tab });
  };

  const filteredOrders = orders.filter((o) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      o.orderNumber.toString().includes(term) ||
      o.tableNameSnapshot.toLowerCase().includes(term) ||
      o.waiterNameSnapshot.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">PENDING</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">APPROVED</span>;
      case 'PREPARING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse">PREPARING</span>;
      case 'READY':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">READY TO SERVE</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">COMPLETED</span>;
      case 'REJECTED':
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">{status}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-700 text-neutral-300">{status}</span>;
    }
  };

  const tabs = [
    { id: 'ALL', label: 'All Orders' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'PREPARING', label: 'Preparing' },
    { id: 'READY', label: 'Ready' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141419] p-5 rounded-2xl border border-[#24242E]">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white font-display flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-orange-400" />
            <span>Orders Monitor</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Track, filter, and inspect order preparation statuses across all departments
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, table..."
            className="w-full bg-[#1C1C24] border border-[#2B2B38] focus:border-[#FF6B00] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20'
                : 'bg-[#141418] hover:bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#24242E]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table List */}
      <div className="bg-[#141418] border border-[#24242E] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-xs">
            No orders found matching the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1C1C24] text-neutral-400 uppercase text-[10px] tracking-wider border-b border-[#24242E]">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Table</th>
                  <th className="p-4">Waiter</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24242E]">
                {filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-[#1A1A22] transition-colors">
                    <td className="p-4 font-black text-white text-sm">#{ord.orderNumber}</td>
                    <td className="p-4 font-bold text-neutral-200">{ord.tableNameSnapshot}</td>
                    <td className="p-4 text-neutral-400">{ord.waiterNameSnapshot}</td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        {ord.items.slice(0, 2).map((it, idx) => (
                          <div key={idx} className="text-neutral-300">
                            {it.name} <span className="text-neutral-500 font-semibold">x{it.quantity}</span>
                          </div>
                        ))}
                        {ord.items.length > 2 && (
                          <span className="text-[10px] text-orange-400 font-bold">
                            +{ord.items.length - 2} more item(s)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-neutral-400">
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 font-extrabold text-[#FF6B00]">
                      Rs. {ord.total.toLocaleString()}
                    </td>
                    <td className="p-4">{getStatusBadge(ord.status)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => printPreparationSlip(ord, false)}
                          title="Print Short Order Slip"
                          className="p-1.5 rounded-lg bg-[#1C1C24] hover:bg-[#252532] text-neutral-300 hover:text-white border border-[#2B2B38]"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 rounded-lg bg-[#1C1C24] hover:bg-[#FF6B00] text-neutral-300 hover:text-white border border-[#2B2B38] font-bold text-[11px] transition-all"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#17171C] border border-[#2B2B38] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-[#24242E] pb-3">
              <div>
                <h3 className="font-black text-xl text-white">Order #{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-neutral-400">
                  Table: <span className="text-white font-bold">{selectedOrder.tableNameSnapshot}</span> • Waiter:{' '}
                  <span className="text-white font-bold">{selectedOrder.waiterNameSnapshot}</span>
                </p>
              </div>
              <div>{getStatusBadge(selectedOrder.status)}</div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#121216] p-3 rounded-xl border border-[#24242E]">
              <div>
                <span className="text-neutral-500">Placed:</span>{' '}
                <span className="text-neutral-300 font-medium">
                  {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                </span>
              </div>
              {selectedOrder.approvedAt && (
                <div>
                  <span className="text-neutral-500">Approved:</span>{' '}
                  <span className="text-neutral-300 font-medium">
                    {new Date(selectedOrder.approvedAt).toLocaleTimeString()}
                  </span>
                </div>
              )}
              {selectedOrder.readyAt && (
                <div>
                  <span className="text-neutral-500">Ready:</span>{' '}
                  <span className="text-emerald-400 font-bold">
                    {new Date(selectedOrder.readyAt).toLocaleTimeString()}
                  </span>
                </div>
              )}
              {selectedOrder.completedAt && (
                <div>
                  <span className="text-neutral-500">Settled:</span>{' '}
                  <span className="text-purple-400 font-bold">
                    {new Date(selectedOrder.completedAt).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-400 uppercase">Order Items</h4>
              <div className="space-y-1.5">
                {selectedOrder.items.map((it, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-2.5 bg-[#1C1C24] rounded-xl border border-[#2B2B38] text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-[#FF6B00]/20 text-[#FF6B00] font-bold text-[11px] flex items-center justify-center">
                          {it.quantity}
                        </span>
                        <span className="font-bold text-white">{it.name}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        Dept: <span className="text-orange-400 font-semibold">{it.department}</span>
                        {it.specialInstructions && ` • Note: ${it.specialInstructions}`}
                      </div>
                    </div>
                    <span className="font-bold text-neutral-300">
                      Rs. {(it.price * it.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rejection / Note */}
            {selectedOrder.rejectionReason && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
                <span className="font-bold">Rejection Reason:</span> {selectedOrder.rejectionReason}
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center pt-3 border-t border-[#24242E]">
              <span className="text-xs text-neutral-400 font-semibold">TOTAL:</span>
              <span className="text-xl font-black text-[#FF6B00]">
                Rs. {selectedOrder.total.toLocaleString()}
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => printPreparationSlip(selectedOrder, true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C1C24] hover:bg-[#252532] text-white text-xs font-bold border border-[#2B2B38]"
              >
                <Printer className="w-4 h-4 text-orange-400" />
                Print Slip
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
