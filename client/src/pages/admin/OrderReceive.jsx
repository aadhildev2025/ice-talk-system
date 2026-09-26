import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { usePrinter } from '../../context/PrinterContext';
import {
  BellRing,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Grid,
  Printer,
  FileText,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

const OrderReceive = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { socket } = useSocket();
  const { printPreparationSlip } = usePrinter();

  const fetchPendingOrders = async () => {
    try {
      const res = await axios.get('/api/orders?status=PENDING');
      if (res.data.success) {
        setPendingOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error fetching pending orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();

    // Auto-polling interval for cloud sync
    const pollInterval = setInterval(() => {
      fetchPendingOrders();
    }, 4000);

    if (socket) {
      socket.on('order:created', (order) => {
        setPendingOrders((prev) => [order, ...prev.filter((o) => o._id !== order._id)]);
      });

      socket.on('order:approved', ({ order }) => {
        setPendingOrders((prev) => prev.filter((o) => o._id !== order._id));
      });

      socket.on('order:rejected', (order) => {
        setPendingOrders((prev) => prev.filter((o) => o._id !== order._id));
      });

      socket.on('order:cancelled', (order) => {
        setPendingOrders((prev) => prev.filter((o) => o._id !== order._id));
      });
    }

    return () => {
      clearInterval(pollInterval);
      if (socket) {
        socket.off('order:created');
        socket.off('order:approved');
        socket.off('order:rejected');
        socket.off('order:cancelled');
      }
    };
  }, [socket]);

  // Approve order: status -> APPROVED, creates preparation tasks, automatically triggers short order slip printing
  const handleApprove = async (order) => {
    setActionLoading(true);
    try {
      const res = await axios.post(`/api/orders/${order._id}/approve`);
      if (res.data.success) {
        setPendingOrders((prev) => prev.filter((o) => o._id !== order._id));
        if (selectedOrderDetails?._id === order._id) {
          setSelectedOrderDetails(null);
        }
        // Auto-print thermal preparation slip
        printPreparationSlip(res.data.order, true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve order');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject order
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingOrder) return;

    setActionLoading(true);
    try {
      const res = await axios.post(`/api/orders/${rejectingOrder._id}/reject`, {
        reason: rejectReason || 'Rejected by Admin',
      });
      if (res.data.success) {
        setPendingOrders((prev) => prev.filter((o) => o._id !== rejectingOrder._id));
        setRejectingOrder(null);
        setRejectReason('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject order');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141419] p-5 rounded-2xl border border-[#24242E]">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white font-display flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/20 text-[#FF6B00]">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <span>Order Receive (Live Queue)</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Incoming waiter orders appear in real-time. Approve to dispatch to kitchen and auto-print preparation slip.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
            {pendingOrders.length} Pending Approval
          </span>
          <button
            onClick={fetchPendingOrders}
            className="p-2 rounded-xl bg-[#1C1C24] hover:bg-[#252530] text-neutral-400 hover:text-white border border-[#2A2A38] transition-all"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : pendingOrders.length === 0 ? (
        <div className="bg-[#141418] border border-[#24242E] rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
            ✓
          </div>
          <h3 className="text-lg font-bold text-white">All Caught Up!</h3>
          <p className="text-xs text-neutral-400">
            No pending orders waiting for approval. New orders submitted by waiters will automatically pop up here with real-time sound alert.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pendingOrders.map((order) => {
            const timeAgo = new Date(order.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order._id}
                className="bg-[#141419] border-2 border-orange-500/50 hover:border-[#FF6B00] rounded-2xl p-5 shadow-xl shadow-black/40 flex flex-col justify-between transition-all relative overflow-hidden"
              >
                {/* Header status bar */}
                <div className="flex justify-between items-start pb-3 border-b border-[#24242E]">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded">
                      NEW ORDER
                    </span>
                    <h2 className="text-lg font-black text-white mt-1">
                      Order #{order.orderNumber}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1 justify-end">
                      <Clock className="w-3.5 h-3.5" />
                      {timeAgo}
                    </span>
                    <span className="text-[11px] text-amber-400 font-bold">Pending</span>
                  </div>
                </div>

                {/* Table & Waiter info */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-[#1C1C24] rounded-xl border border-[#2B2B38] text-xs">
                  <div className="flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-orange-400" />
                    <div>
                      <p className="text-[10px] text-neutral-400">Table</p>
                      <p className="font-bold text-white">{order.tableNameSnapshot}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <div>
                      <p className="text-[10px] text-neutral-400">Waiter</p>
                      <p className="font-bold text-white">{order.waiterNameSnapshot}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items list */}
                <div className="my-2 space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-1.5 border-b border-neutral-800/60"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-neutral-800 text-neutral-300 font-bold text-[11px] flex items-center justify-center">
                            {item.quantity}
                          </span>
                          <span className="font-medium text-neutral-200">{item.name}</span>
                        </div>
                        <span className="font-semibold text-neutral-400">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                      {item.specialInstructions && (
                        <p className="text-[10px] text-amber-300 italic pl-7 mt-0.5">
                          * {item.specialInstructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {order.specialInstructions && (
                  <div className="my-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300">
                    <span className="font-bold">Note:</span> {order.specialInstructions}
                  </div>
                )}

                {/* Total and actions */}
                <div className="pt-3 border-t border-[#24242E] mt-2">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold text-neutral-400">ORDER TOTAL:</span>
                    <span className="text-lg font-black text-[#FF6B00] font-display">
                      Rs. {order.total.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setRejectingOrder(order)}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>

                    <button
                      onClick={() => handleApprove(order)}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#FF6B00] to-[#FF8526] hover:from-[#E55A00] hover:to-[#FF6B00] text-white py-2.5 rounded-xl text-xs font-black shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Order
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#17171C] border border-[#2B2B38] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-lg text-white">
                Reject Order #{rejectingOrder.orderNumber}
              </h3>
            </div>

            <p className="text-xs text-neutral-300">
              Please enter the reason for rejecting Table {rejectingOrder.tableNameSnapshot}'s order. Waiter {rejectingOrder.waiterNameSnapshot} will be notified immediately.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Item out of stock, kitchen closed, table requested change..."
                  className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-rose-500 rounded-xl p-3 text-xs text-white placeholder-neutral-500 outline-none h-24"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingOrder(null);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition-all disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderReceive;
