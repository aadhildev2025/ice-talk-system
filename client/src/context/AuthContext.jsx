import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { initDsuperStorageIfNeeded } from '../services/dsuperStorageService';

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
        // dsuper session is fully managed in local storage
        if (user?.username === 'dsuper') {
          initDsuperStorageIfNeeded();
          setLoading(false);
          return;
        }

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
    const cleanUser = (username || '').toLowerCase().trim();

    // Isolated instant local storage authentication for dsuper
    if (cleanUser === 'dsuper') {
      if (password === 'dsuper123') {
        const demoUser = {
          id: 'dsuper-local-user',
          name: 'SuperADMIN',
          username: 'dsuper',
          role: 'superadmin',
          department: 'ALL',
          status: 'ACTIVE',
          phone: '+94 77 999 9999',
          isDemo: true,
        };
        const demoToken = 'dsuper_token_' + Date.now();
        setToken(demoToken);
        setUser(demoUser);
        localStorage.setItem('icetalk_token', demoToken);
        localStorage.setItem('icetalk_user', JSON.stringify(demoUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${demoToken}`;
        initDsuperStorageIfNeeded();
        // Optional background ping to server if online
        axios.post('/api/auth/login', { username, password }).catch(() => {});
        return { success: true, user: demoUser };
      } else {
        return {
          success: false,
          message: 'Invalid password for SuperADMIN account.',
        };
      }
    }

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
      case 'superadmin':
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
        isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
        isSuperAdmin: user?.role === 'superadmin',
        isWaiter: user?.role === 'waiter',
        getRoleHomePath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
