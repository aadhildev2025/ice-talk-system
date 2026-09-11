import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import PrintModal from '../../components/PrintModal';
import ToastNotifications from '../../components/ToastNotifications';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import {
  LayoutDashboard,
  BellRing,
  ClipboardList,
  UtensilsCrossed,
  CreditCard,
  Grid,
  Users,
  BarChart3,
  Flame,
  Receipt,
  Menu,
  X,
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [preparingCount, setPreparingCount] = useState(0);
  const [readyCount, setReadyCount] = useState(0);
  const { socket } = useSocket();
  const location = useLocation();

  const fetchBadgeCounts = async () => {
    try {
      const res = await axios.get('/api/reports/dashboard');
      if (res.data.success) {
        setPendingCount(res.data.orderStatusCounts.pending || 0);
        setPreparingCount(res.data.orderStatusCounts.preparing || 0);
        setReadyCount(res.data.orderStatusCounts.ready || 0);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchBadgeCounts();

    const pollInterval = setInterval(() => {
      fetchBadgeCounts();
    }, 5000);

    if (socket) {
      socket.on('order:created', () => fetchBadgeCounts());
      socket.on('order:approved', () => fetchBadgeCounts());
      socket.on('order:rejected', () => fetchBadgeCounts());
      socket.on('order:ready', () => fetchBadgeCounts());
      socket.on('sale:completed', () => fetchBadgeCounts());
      socket.on('order:cancelled', () => fetchBadgeCounts());
    }

    return () => {
      clearInterval(pollInterval);
      if (socket) {
        socket.off('order:created');
        socket.off('order:approved');
        socket.off('order:rejected');
        socket.off('order:ready');
        socket.off('sale:completed');
        socket.off('order:cancelled');
      }
    };
  }, [socket]);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      to: '/admin/order-receive',
      label: 'Order Receive',
      icon: BellRing,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-[#FF6B00] text-white animate-pulse',
    },
    {
      to: '/admin/orders',
      label: 'Orders Monitor',
      icon: ClipboardList,
      subBadge: readyCount > 0 ? `${readyCount} Ready` : null,
    },
    { to: '/admin/pos', label: 'POS Billing', icon: CreditCard, highlight: true },
    { to: '/admin/tables', label: 'Tables', icon: Grid },
    { to: '/admin/menu', label: 'Menu & Categories', icon: UtensilsCrossed },
    { to: '/admin/staff', label: 'Staff Management', icon: Users },
    { to: '/admin/reports', label: 'Sales & Reports', icon: BarChart3 },
  ];

  return (
    <div className="h-full flex-1 bg-[#0F0F12] flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile menu trigger button */}
        <div className="lg:hidden fixed bottom-5 left-5 z-40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-12 h-12 rounded-full bg-[#FF6B00] text-white shadow-lg flex items-center justify-center border-2 border-white/20"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#141418] border-r border-[#24242E] transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-full flex flex-col justify-between ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-6 overflow-y-auto">
            {/* Quick Live Status Widget */}
            <div className="bg-[#1C1C24] p-3 rounded-2xl border border-[#2B2B38] space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-neutral-400">
                <span>LIVE ORDERS</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center">
                <div className="bg-[#141418] p-1.5 rounded-lg border border-[#2B2B38]">
                  <p className="text-[10px] text-amber-400 font-bold">PENDING</p>
                  <p className="text-base font-black text-white">{pendingCount}</p>
                </div>
                <div className="bg-[#141418] p-1.5 rounded-lg border border-[#2B2B38]">
                  <p className="text-[10px] text-blue-400 font-bold">PREP</p>
                  <p className="text-base font-black text-white">{preparingCount}</p>
                </div>
                <div className="bg-[#141418] p-1.5 rounded-lg border border-[#2B2B38]">
                  <p className="text-[10px] text-emerald-400 font-bold">READY</p>
                  <p className="text-base font-black text-white">{readyCount}</p>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <nav className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20'
                          : item.highlight
                          ? 'text-white bg-[#1C1C24] hover:bg-[#252530] border border-orange-500/30'
                          : 'text-neutral-400 hover:text-white hover:bg-[#1A1A22]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}

                    {item.subBadge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {item.subBadge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Restaurant footer watermark */}
          <div className="p-4 border-t border-[#24242E] text-[11px] text-neutral-500 flex items-center justify-between">
            <span>ICE TALK v1.0</span>
            <span className="text-[#FF6B00] font-bold">PRO POS</span>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0A0A0D] p-4 md:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Global Thermal Print Modal */}
      <PrintModal />

      {/* Real-Time Toast Alerts */}
      <ToastNotifications />
    </div>
  );
};

export default AdminLayout;
