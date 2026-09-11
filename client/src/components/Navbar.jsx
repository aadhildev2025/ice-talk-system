import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useUI } from '../context/UIContext';
import { usePrinter } from '../context/PrinterContext';
import { LogOut, Wifi, WifiOff, User as UserIcon, Monitor, Tablet, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const { uiMode, setMode } = useUI();
  const { isElectron, availablePrinters, selectedPrinter, setPrinter, autoPrintEnabled, toggleAutoPrint } = usePrinter();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">Admin</span>;
      case 'waiter':
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">Waiter</span>;
      default:
        return <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">{role || 'Staff'}</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 h-14 bg-[#141418] border-b border-[#24242E] px-3 sm:px-4 flex items-center justify-between shrink-0">
      {/* Brand & Logo */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
          <img src="/logo.png" alt="Ice Talk" className="w-full h-full object-contain" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-extrabold text-base sm:text-lg tracking-tight font-display bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent truncate">
              ICE TALK
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#FF6B00] bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 hidden xs:inline-block">
              POS
            </span>
          </div>
          <p className="text-[9px] text-neutral-400 font-medium tracking-wide hidden md:block">FAMILY RESTAURANT</p>
        </div>
      </div>

      {/* Center Controls: Live Status & UI Mode Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Desktop / Touch Screen Mode Toggle - Admin only */}
        {user?.role === 'admin' && (
          <div className="hidden sm:flex items-center bg-[#181820] p-1 rounded-xl border border-[#2B2B38] shadow-inner">
            <button
              onClick={() => setMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                uiMode === 'desktop'
                  ? 'bg-[#282834] text-white shadow-sm border border-neutral-600/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setMode('touch')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                uiMode === 'touch'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8C2A] text-white shadow-md shadow-orange-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Touch Screen</span>
            </button>
          </div>
        )}

        {/* Native Hardware Printer Status & Selector (Admin / Desktop Mode) */}
        {user?.role === 'admin' && isElectron && (
          <div className="hidden lg:flex items-center gap-1.5 bg-[#1C1C24] px-2.5 py-1 rounded-xl border border-[#2B2B38] text-xs">
            <Printer className={`w-3.5 h-3.5 ${autoPrintEnabled ? 'text-emerald-400' : 'text-neutral-500'}`} />
            {availablePrinters.length > 0 ? (
              <select
                value={selectedPrinter}
                onChange={(e) => setPrinter(e.target.value)}
                className="bg-transparent text-neutral-300 font-semibold text-xs outline-none cursor-pointer max-w-[130px] truncate"
                title="Select Silent Thermal Printer"
              >
                {availablePrinters.map((p) => (
                  <option key={p.name} value={p.name} className="bg-[#1C1C24] text-white">
                    {p.name} {p.isDefault ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-[11px] text-emerald-400 font-bold">Auto-Print Ready</span>
            )}
          </div>
        )}

        {/* Live status indicator */}
        <div className="flex items-center gap-1.5 bg-[#1C1C24] px-2 sm:px-2.5 py-1 rounded-xl border border-[#2B2B38] text-xs">
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-neutral-300 font-medium text-[11px] sm:text-xs">Live</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-rose-400 font-medium text-[11px] sm:text-xs">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* User Info & Role Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1C1C24] border border-[#2B2B38] px-2 sm:px-3 py-1 rounded-xl">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
            <UserIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-semibold text-white leading-none truncate max-w-[90px]">{user?.name || 'Staff'}</p>
            <p className="text-[10px] text-neutral-400 leading-tight capitalize">{user?.role}</p>
          </div>
          <div className="shrink-0">
            {getRoleBadge(user?.role)}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-1.5 sm:p-2 rounded-xl bg-neutral-800/80 hover:bg-rose-500/20 border border-neutral-700 hover:border-rose-500/40 text-neutral-400 hover:text-rose-400 transition-all shrink-0"
        >
          <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
