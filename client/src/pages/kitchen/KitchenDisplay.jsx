import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Navbar from '../../components/Navbar';
import ToastNotifications from '../../components/ToastNotifications';
import {
  ChefHat,
  Flame,
  Clock,
  CheckCircle2,
  CheckSquare,
  Square,
  AlertTriangle,
  RefreshCw,
  CupSoda,
  Sandwich,
  Utensils,
  Layers,
} from 'lucide-react';

const KitchenDisplay = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  // User's default department or 'ALL'
  const initialDept = user?.department || 'ALL';
  const [selectedDept, setSelectedDept] = useState(initialDept);
  const [prepTasks, setPrepTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const fetchTasks = async () => {
    try {
      let url = '/api/orders/prep-tasks';
      if (selectedDept !== 'ALL') {
        url += `?department=${selectedDept}`;
      }
      const res = await axios.get(url);
      if (res.data.success) {
        setPrepTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Error loading prep tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    // Clock ticker for elapsed timers
    const timerInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    // Auto-polling interval for cloud sync
    const pollInterval = setInterval(() => {
      fetchTasks();
    }, 4000);

    if (socket) {
      socket.on('order:approved', () => fetchTasks());
      socket.on('prep:new_tasks', () => fetchTasks());
      socket.on('prep:task_updated', () => fetchTasks());
      socket.on('order:cancelled', () => fetchTasks());
      socket.on('sale:completed', () => fetchTasks());
    }

    return () => {
      clearInterval(timerInterval);
      clearInterval(pollInterval);
      if (socket) {
        socket.off('order:approved');
        socket.off('prep:new_tasks');
        socket.off('prep:task_updated');
        socket.off('order:cancelled');
        socket.off('sale:completed');
      }
    };
  }, [selectedDept, socket]);

  // Update whole task status
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await axios.patch(`/api/orders/prep-tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Toggle item checkbox inside a task
  const handleToggleItem = async (taskId, itemIndex) => {
    try {
      await axios.patch(`/api/orders/prep-tasks/${taskId}`, { itemIndex });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update item check');
    }
  };

  // Compute elapsed time formatted as mm:ss
  const formatElapsed = (createdAt) => {
    const diffSeconds = Math.max(0, Math.floor((currentTime - new Date(createdAt).getTime()) / 1000));
    const mins = Math.floor(diffSeconds / 60);
    const secs = diffSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getTimerBadge = (createdAt) => {
    const diffMins = Math.floor((currentTime - new Date(createdAt).getTime()) / (1000 * 60));
    const isLate = diffMins >= 15;
    const isWarning = diffMins >= 10 && !isLate;

    return (
      <span
        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 ${
          isLate
            ? 'bg-rose-500 text-white animate-pulse'
            : isWarning
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            : 'bg-[#1C1C24] text-neutral-300 border border-[#2B2B38]'
        }`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>⏱ {formatElapsed(createdAt)}</span>
      </span>
    );
  };

  const getDeptIcon = (dept) => {
    switch (dept) {
      case 'KITCHEN':
        return <ChefHat className="w-4 h-4 text-orange-400" />;
      case 'JUICE':
        return <CupSoda className="w-4 h-4 text-emerald-400" />;
      case 'BUN':
        return <Sandwich className="w-4 h-4 text-amber-400" />;
      default:
        return <Layers className="w-4 h-4 text-blue-400" />;
    }
  };

  const departments = ['ALL', 'KITCHEN', 'JUICE', 'BUN', 'OTHER'];

  return (
    <div className="flex-1 flex flex-col pb-16 bg-[#0A0A0D]">
      <Navbar />

      {/* Top Header & Department Filter Bar */}
      <div className="bg-[#141418] border-b border-[#24242E] px-4 py-4 sticky top-14 z-30 shadow-md shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-xl font-black text-white font-display flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-400" />
              <span>Kitchen Display System (KDS)</span>
            </h1>
            <p className="text-xs text-neutral-400">
              Live preparation orders, elapsed timers, and department-level checklists
            </p>
          </div>

          {/* Department Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  selectedDept === dept
                    ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-500/25'
                    : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2B2B38]'
                }`}
              >
                {dept !== 'ALL' && getDeptIcon(dept)}
                <span>{dept}</span>
              </button>
            ))}

            <button
              onClick={fetchTasks}
              className="p-2 rounded-xl bg-[#1C1C24] hover:bg-[#252530] text-neutral-400 hover:text-white border border-[#2B2B38] ml-1"
              title="Refresh KDS"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main KDS Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : prepTasks.length === 0 ? (
          <div className="bg-[#141418] border border-[#24242E] rounded-3xl p-16 text-center max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-3xl font-black">
              ✓
            </div>
            <h3 className="text-lg font-bold text-white">Kitchen Queue Clear!</h3>
            <p className="text-xs text-neutral-400">
              There are no pending preparation items for <span className="text-orange-400 font-bold">{selectedDept}</span>. New orders approved by Admin will chime here instantly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {prepTasks.map((task) => {
              const isPreparing = task.status === 'PREPARING';
              const isReady = task.status === 'READY';
              const allChecked = task.items.every((it) => it.isReady);

              return (
                <div
                  key={task._id}
                  className={`bg-[#141419] border-2 rounded-2xl p-5 shadow-2xl flex flex-col justify-between transition-all relative overflow-hidden ${
                    isReady
                      ? 'border-emerald-500/80 bg-gradient-to-br from-[#122417] to-[#141419]'
                      : isPreparing
                      ? 'border-orange-500/80 bg-gradient-to-br from-[#241712] to-[#141419]'
                      : 'border-[#2D2D3B]'
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex justify-between items-start pb-3 border-b border-[#24242E]">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-[#FF6B00] text-white px-2 py-0.5 rounded">
                            {task.department}
                          </span>
                          <span className="font-extrabold text-xs text-neutral-400">
                            #{task.orderNumber}
                          </span>
                        </div>
                        <h2 className="text-xl font-black text-white mt-1">
                          {task.tableNameSnapshot}
                        </h2>
                      </div>

                      {getTimerBadge(task.createdAt)}
                    </div>

                    {/* Items Checklist */}
                    <div className="my-4 space-y-2">
                      {task.items.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleToggleItem(task._id, idx)}
                          className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                            item.isReady
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                              : 'bg-[#1C1C24] border-[#2A2A38] text-white hover:border-neutral-500'
                          }`}
                        >
                          <div className="mt-0.5 text-neutral-400">
                            {item.isReady ? (
                              <CheckSquare className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span
                                className={`text-sm font-black ${
                                  item.isReady ? 'line-through opacity-70 text-emerald-300' : 'text-white'
                                }`}
                              >
                                {item.name}
                              </span>
                              <span className="w-7 h-7 rounded-lg bg-black/40 text-white font-black text-xs flex items-center justify-center border border-white/10">
                                x{item.quantity}
                              </span>
                            </div>

                            {item.specialInstructions && (
                              <p className="text-[11px] font-bold text-amber-400 mt-1 italic">
                                Note: {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {task.specialInstructions && (
                      <div className="mb-4 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                        <span className="font-bold">Order Note:</span> {task.specialInstructions}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-[#24242E]">
                    {task.status === 'PENDING' ? (
                      <button
                        onClick={() => handleUpdateStatus(task._id, 'PREPARING')}
                        className="w-full bg-[#1C1C24] hover:bg-[#FF6B00] text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-wider border border-[#2B2B38] hover:border-orange-500 transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span>Start Preparing</span>
                      </button>
                    ) : task.status === 'PREPARING' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleUpdateStatus(task._id, 'PENDING')}
                          className="py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-bold text-xs"
                        >
                          Back to Pending
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(task._id, 'READY')}
                          className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Ready</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-2.5 text-xs text-emerald-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Ready for Service</span>
                        </span>
                        <button
                          onClick={() => handleUpdateStatus(task._id, 'PREPARING')}
                          className="text-[10px] underline text-neutral-400 hover:text-white"
                        >
                          Reopen
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <ToastNotifications />
    </div>
  );
};

export default KitchenDisplay;
