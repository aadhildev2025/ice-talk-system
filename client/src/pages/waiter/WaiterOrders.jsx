import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ToastNotifications from '../../components/ToastNotifications';
import {
  ClipboardList,
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  Flame,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

const WaiterOrders = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWaiterOrders = async () => {
    try {
      const res = await axios.get(`/api/orders?waiterId=${user.id || user._id}&limit=50`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error fetching waiter orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaiterOrders();

    const pollInterval = setInterval(() => {
      fetchWaiterOrders();
    }, 4000);

    if (socket) {
      socket.on('order:created', () => fetchWaiterOrders());
      socket.on('order:approved', () => fetchWaiterOrders());
      socket.on('order:rejected', () => fetchWaiterOrders());
      socket.on('order:ready', () => fetchWaiterOrders());
      socket.on('order:status_updated', () => fetchWaiterOrders());
      socket.on('order:cancelled', () => fetchWaiterOrders());
      socket.on('sale:completed', () => fetchWaiterOrders());
    }

    return () => {
      clearInterval(pollInterval);
      if (socket) {
        socket.off('order:created');
        socket.off('order:approved');
        socket.off('order:rejected');
        socket.off('order:ready');
        socket.off('order:status_updated');
        socket.off('order:cancelled');
        socket.off('sale:completed');
      }
    };
  }, [socket, user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Awaiting Admin Approval
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved / In Kitchen
          </span>
        );
      case 'PREPARING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 animate-pulse flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" /> Cooking in Progress
          </span>
        );
      case 'READY':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-black border border-emerald-400 flex items-center gap-1 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/50">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready to Serve!
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Completed & Settled
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Order Cancelled
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Order Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-800 text-neutral-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-white flex flex-col font-sans">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6 flex-1">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#141418] p-5 rounded-2xl border border-[#24242E]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/waiter/menu')}
              className="p-2 rounded-xl bg-[#1C1C24] hover:bg-[#252530] text-neutral-300 hover:text-white border border-[#2A2A38] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-black text-white font-display flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#FF6B00]" />
                <span>Live Order Tracker</span>
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Orders placed by {user?.name || 'you'} in real-time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchWaiterOrders}
              className="p-2 rounded-xl bg-[#1C1C24] hover:bg-[#252530] text-neutral-300 hover:text-white border border-[#2A2A38]"
              title="Refresh Orders"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/waiter/menu')}
              className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E55A00] text-white font-bold text-xs shadow-lg shadow-orange-500/20"
            >
              + New Order
            </button>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-[#141418] border border-[#24242E] rounded-3xl p-12 text-center space-y-3">
            <UtensilsCrossed className="w-12 h-12 text-neutral-600 mx-auto" />
            <h3 className="font-bold text-base text-white">No Orders Placed Yet</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              You haven't submitted any orders during this shift yet. Go to the menu to create your first order.
            </p>
            <button
              onClick={() => navigate('/waiter/menu')}
              className="mt-2 px-5 py-2.5 bg-[#FF6B00] text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20"
            >
              Browse Menu & Take Order
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => {
              const isReady = ord.status === 'READY';
              const isRejected = ord.status === 'REJECTED';
              const isCancelled = ord.status === 'CANCELLED';

              return (
                <div
                  key={ord._id}
                  className={`bg-[#141419] border rounded-2xl p-5 shadow-xl transition-colors ${
                    isReady
                      ? 'border-emerald-500/80 bg-gradient-to-br from-[#122417] to-[#141419] ring-2 ring-emerald-500/30'
                      : isRejected || isCancelled
                      ? 'border-rose-500/50 bg-[#1F1214]'
                      : 'border-[#24242E]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#24242E]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg text-white font-display">
                          Order #{ord.orderNumber}
                        </span>
                        <span className="text-xs font-bold text-neutral-300 bg-[#1C1C24] px-2.5 py-0.5 rounded-lg border border-[#2B2B38]">
                          Table: {ord.tableNameSnapshot}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Placed at {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div>{getStatusBadge(ord.status)}</div>
                  </div>

                  {/* Rejection Alert */}
                  {isRejected && ord.rejectionReason && (
                    <div className="my-3 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                      <div>
                        <span className="font-bold">Admin Rejection Reason:</span> {ord.rejectionReason}
                      </div>
                    </div>
                  )}

                  {/* Cancellation Alert */}
                  {isCancelled && (
                    <div className="my-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                      <div>
                        <span className="font-bold">Cancellation Reason:</span> {ord.cancellationReason || 'Cancelled by staff'}
                      </div>
                    </div>
                  )}

                  {/* Items summary */}
                  <div className="py-3 space-y-1.5">
                    {ord.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-xs p-2 rounded-lg bg-[#1C1C24] border border-[#282834]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-neutral-800 text-neutral-300 font-bold text-[11px] flex items-center justify-center">
                            {it.quantity}
                          </span>
                          <span className="font-bold text-white">{it.name}</span>
                          <span className="text-[10px] text-neutral-400">({it.department})</span>
                          {it.specialInstructions && (
                            <span className="text-[10px] italic text-amber-300">
                              * {it.specialInstructions}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-neutral-300">
                          Rs. {(it.price * it.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer with Total and Actions */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pt-3 border-t border-[#24242E]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-400 uppercase font-semibold">Total Bill</span>
                      <span className="text-base font-black text-[#FF6B00] font-display">
                        Rs. {ord.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ToastNotifications />
    </div>
  );
};

export default WaiterOrders;
