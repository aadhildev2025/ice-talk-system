import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
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
  UserCheck,
  Package,
  BarChart3,
  Flame,
  Receipt,
  Wallet,
  Menu,
  X,
  Printer,
  QrCode,
} from 'lucide-react';
import { usePrinter } from '../../context/PrinterContext';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { isSuperAdmin, isAdmin, isDsuper, isCashier, isWaiter, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [preparingCount, setPreparingCount] = useState(0);
  const [readyCount, setReadyCount] = useState(0);
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const { openSettings, multiPrinterMode } = usePrinter();

  // If dsuper navigates to expenses or reports, redirect to dashboard
  useEffect(() => {
    if (isDsuper && (location.pathname === '/admin/expenses' || location.pathname === '/admin/reports')) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isDsuper, location.pathname, navigate]);

  // If staff/cashier/waiter navigates to staff management, redirect to dashboard
  useEffect(() => {
    if (
      (user?.role === 'cashier' || user?.role === 'waiter' || isCashier || isWaiter) &&
      location.pathname === '/admin/staff'
    ) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user?.role, isCashier, isWaiter, location.pathname, navigate]);

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

  const isStaff = user?.role === 'cashier' || user?.role === 'waiter' || isCashier || isWaiter;

  const allNavLinks = [
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
    { to: '/admin/grocery', label: 'Grocery Items', icon: Package },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/staff', label: 'Staff Management', icon: UserCheck, hideForStaff: true },
    { to: '/admin/expenses', label: 'Expenses & Salaries', icon: Wallet, superAdminOnly: true, hideForDsuper: true },
    { to: '/admin/reports', label: 'Sales & Reports', icon: BarChart3, superAdminOnly: true, hideForDsuper: true },
    { to: '/superadmin/scanner', label: 'QR Cancel Scanner', icon: QrCode, superAdminOnly: true },
  ];

  const navLinks = allNavLinks.filter((item) => {
    if (isDsuper && item.hideForDsuper) return false;
    if (isStaff && item.hideForStaff) return false;
    return !item.superAdminOnly || isSuperAdmin;
  });

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
            {/* Live Status Mini Card */}
            <div className="bg-[#1C1C24] p-3 rounded-2xl border border-[#2B2B38] space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-neutral-400">
                <span>LIVE ORDERS</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-[#141418] p-2 rounded-xl border border-[#2B2B38]">
                  <p className="text-[10px] text-amber-400 font-bold tracking-wider">PENDING</p>
                  <p className="text-xl font-black text-white mt-0.5 font-display">{pendingCount}</p>
                </div>
                <div className="bg-[#141418] p-2 rounded-xl border border-[#2B2B38]">
                  <p className="text-[10px] text-emerald-400 font-bold tracking-wider">PREPARING</p>
                  <p className="text-xl font-black text-white mt-0.5 font-display">{preparingCount}</p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
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
                      <Icon className="w-5 h-5" />
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

            {/* Direct Thermal Printers & KOT Setup button in Admin Sidebar */}
            {isAdmin && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSidebarOpen(false);
                    openSettings();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-[#1C1C24] border border-[#2B2B38] transition-all group"
                  title="Configure Station Printers & KOT Routing"
                >
                  <div className="flex items-center gap-2.5">
                    <Printer className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                    <span>Printers & KOT Setup</span>
                  </div>
                  {multiPrinterMode ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      Split ON
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
                      Single
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#24242E] text-xs text-neutral-500 flex items-center justify-between bg-[#111116]">
            <span>ICE TALK v1.0</span>
            <span className="text-[#FF6B00] font-bold">PRO POS</span>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0A0A0D] p-3 sm:p-4 md:p-6 pb-20 lg:pb-6 w-full">
          <Outlet />
        </main>
      </div>

      <ToastNotifications />
    </div>
  );
};

export default AdminLayout;
