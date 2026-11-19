import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { PrinterProvider } from './context/PrinterContext';
import { UIProvider } from './context/UIContext';
import ProtectedRoute from './components/ProtectedRoute';
import ToastNotifications from './components/ToastNotifications';
import PrintModal from './components/PrintModal';
import PrinterSettingsModal from './components/PrinterSettingsModal';

// Pages
import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrderReceive from './pages/admin/OrderReceive';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPOS from './pages/admin/AdminPOS';
import TableManagement from './pages/admin/TableManagement';
import MenuManagement from './pages/admin/MenuManagement';
import GroceryManagement from './pages/admin/GroceryManagement';
import CustomersManagement from './pages/admin/CustomersManagement';
import StaffManagement from './pages/admin/StaffManagement';
import ExpensesManagement from './pages/admin/ExpensesManagement';
import Reports from './pages/admin/Reports';

import WaiterMenu from './pages/waiter/WaiterMenu';
import WaiterOrders from './pages/waiter/WaiterOrders';

const RootRedirect = () => {
  const { isAuthenticated, user, getRoleHomePath, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getRoleHomePath(user.role)} replace />;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <UIProvider>
          <PrinterProvider>
            <ToastNotifications />
            <PrintModal />
            <PrinterSettingsModal />
            <Routes>
              {/* Public Login Route */}
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<RootRedirect />} />

              {/* Admin Portal */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="order-receive" element={<OrderReceive />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="pos" element={<AdminPOS />} />
                <Route path="tables" element={<TableManagement />} />
                <Route path="menu" element={<MenuManagement />} />
                <Route path="grocery" element={<GroceryManagement />} />
                <Route path="customers" element={<CustomersManagement />} />
                <Route
                  path="staff"
                  element={
                    <ProtectedRoute disallowedRoles={['cashier', 'waiter']}>
                      <StaffManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="expenses"
                  element={
                    <ProtectedRoute allowedRoles={['superadmin']} blockDsuper>
                      <ExpensesManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute allowedRoles={['superadmin']} blockDsuper>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Waiter Portal */}
              <Route
                path="/waiter/menu"
                element={
                  <ProtectedRoute allowedRoles={['waiter', 'admin']}>
                    <WaiterMenu />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/waiter/orders"
                element={
                  <ProtectedRoute allowedRoles={['waiter', 'admin']}>
                    <WaiterOrders />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </PrinterProvider>
        </UIProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
