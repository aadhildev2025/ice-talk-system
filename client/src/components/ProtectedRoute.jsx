import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading, getRoleHomePath } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-1 min-h-full bg-[#0F0F12] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-neutral-400 text-sm font-medium">Loading Ice Talk POS...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If kitchen role accesses kitchen portal
    if (['kitchen', 'juice', 'bun', 'other'].includes(user.role) && allowedRoles.includes('kitchen')) {
      return children;
    }
    // Unauthorized for this specific route -> redirect to their role home
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
