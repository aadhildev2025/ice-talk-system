import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, CheckCircle, XCircle, AlertTriangle, DollarSign, X } from 'lucide-react';

const ToastNotifications = () => {
  const { toasts, removeToast } = useSocket();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'ORDER_NEW':
        return <Bell className="w-5 h-5 text-orange-400 animate-pulse" />;
      case 'ORDER_APPROVED':
      case 'ORDER_READY':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'ORDER_REJECTED':
      case 'ORDER_CANCELLED':
        return <XCircle className="w-5 h-5 text-rose-400" />;
      case 'SALE_COMPLETED':
        return <DollarSign className="w-5 h-5 text-amber-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'ORDER_NEW':
        return 'border-orange-500/50 bg-[#1F1812]';
      case 'ORDER_APPROVED':
      case 'ORDER_READY':
        return 'border-emerald-500/50 bg-[#121F18]';
      case 'ORDER_REJECTED':
      case 'ORDER_CANCELLED':
        return 'border-rose-500/50 bg-[#241416]';
      case 'SALE_COMPLETED':
        return 'border-amber-500/50 bg-[#221B10]';
      default:
        return 'border-blue-500/50 bg-[#131924]';
    }
  };

  return (
    <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-4 z-50 flex flex-col gap-2 sm:max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all duration-300 transform translate-y-0 ${getBorderColor(
            toast.type
          )}`}
        >
          <div className="mt-0.5 flex-shrink-0">{getIcon(toast.type)}</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-white leading-snug">{toast.title}</h4>
            <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastNotifications;
