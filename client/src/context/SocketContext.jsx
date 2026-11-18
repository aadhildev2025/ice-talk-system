import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { sound } from '../utils/sound';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [soundMuted, setSoundMuted] = useState(false);

  // Helper to add a toast notification
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleSound = () => {
    const isNowMuted = sound.toggleMute();
    setSoundMuted(isNowMuted);
  };

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const socketInstance = io(socketUrl, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      if (user) {
        socketInstance.emit('join_role', {
          role: user.role,
          department: user.department,
          userId: user.id || user._id,
        });
        if (user.role === 'superadmin' || user.role === 'cashier' || user.username === 'dsuper') {
          socketInstance.emit('join_role', { role: 'admin' });
        }
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    // Helper to identify admin/cashier/superadmin/dsuper
    const isStaffUser = (u) =>
      Boolean(
        u && (
          u.role === 'admin' ||
          u.role === 'superadmin' ||
          u.role === 'cashier' ||
          u.username === 'dsuper' ||
          u.username === 'admin'
        )
      );

    // Real-time toast notifications
    socketInstance.on('notification:toast', (data) => {
      addToast(data);
    });

    // New order created (Admin / Cashier / Dsuper notification)
    socketInstance.on('order:created', (order) => {
      if (isStaffUser(user)) {
        sound.playNewOrderSound();
        addToast({
          title: `🔔 New Order #${order.orderNumber}`,
          message: `Table ${order.tableNameSnapshot || order.tableName || 'Takeaway'} by ${order.waiterNameSnapshot || order.waiterName || 'Staff'} (Rs. ${(order.total || 0).toLocaleString()})`,
          type: 'ORDER_NEW',
          order,
        });
      }
    });

    // Order Approved (Kitchen / Juice / Waiter notification)
    socketInstance.on('order:approved', ({ order, prepTasks }) => {
      if (user?.role === 'waiter' && (order.waiterId === user.id || order.waiterId === user._id)) {
        sound.playNewOrderSound();
        addToast({
          title: `✅ Order #${order.orderNumber} Approved!`,
          message: `Admin approved order for Table ${order.tableNameSnapshot || order.tableName}. Sent to preparation.`,
          type: 'ORDER_APPROVED',
        });
      } else if (['kitchen', 'juice', 'bun', 'other'].includes(user?.role)) {
        sound.playNewOrderSound();
        addToast({
          title: `🔔 New Prep Order #${order.orderNumber}`,
          message: `Table ${order.tableNameSnapshot || order.tableName} — ${prepTasks?.length || 1} task(s)`,
          type: 'ORDER_NEW',
        });
      }
    });

    // Order Rejected (Waiter notification)
    socketInstance.on('order:rejected', (order) => {
      if (user?.role === 'waiter') {
        addToast({
          title: `❌ Order #${order.orderNumber} Rejected`,
          message: `Reason: ${order.rejectionReason || 'Rejected by Admin'}`,
          type: 'ORDER_REJECTED',
        });
      }
    });

    // Order Ready notification
    socketInstance.on('order:ready', (order) => {
      sound.playReadySound();
      if (isStaffUser(user) || user?.role === 'waiter') {
        addToast({
          title: `🍽 Order #${order.orderNumber} is READY!`,
          message: `Table ${order.tableNameSnapshot || order.tableName || 'Takeaway'} items are ready to serve.`,
          type: 'ORDER_READY',
        });
      }
    });

    // Sale Completed notification
    socketInstance.on('sale:completed', ({ sale }) => {
      if (isStaffUser(user)) {
        sound.playSaleSuccessSound();
        addToast({
          title: `💰 Sale Completed: ${sale.saleNumber}`,
          message: `Table ${sale.tableNameSnapshot || sale.tableName || 'Takeaway'} settled for Rs. ${(sale.total || 0).toLocaleString()} (${sale.paymentMethod || 'CASH'})`,
          type: 'SALE_COMPLETED',
        });
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user, addToast]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        toasts,
        addToast,
        removeToast,
        soundMuted,
        toggleSound,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
