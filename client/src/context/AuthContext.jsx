import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set base API URL if configured in environment (e.g. Vercel / Cloud deployment)
if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
}

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('icetalk_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('icetalk_token') || '');
  const [loading, setLoading] = useState(true);

  // Set default axios header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await axios.get('/api/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('icetalk_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Auth verification failed, clearing session', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('icetalk_token', newToken);
        localStorage.setItem('icetalk_user', JSON.stringify(newUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return { success: true, user: newUser };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.',
      };
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('icetalk_token');
    localStorage.removeItem('icetalk_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Helper for role path redirection
  const getRoleHomePath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'waiter':
        return '/waiter/menu';
      default:
        return '/admin/dashboard';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin',
        isWaiter: user?.role === 'waiter',
        getRoleHomePath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
