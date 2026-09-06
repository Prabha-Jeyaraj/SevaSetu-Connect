import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sevasetu_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('sevasetu_token') || null;
  });

  // Verify session on initial load if token exists
  useEffect(() => {
    if (user?.id) {
      api.getMe()
        .then(res => {
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('sevasetu_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          // If session expired or invalid, keep current local cache or handle gracefully
        });
    }
  }, []);

  const login = async (credentials) => {
    const res = await api.login(credentials);
    if (res.data.success) {
      const { user: authUser, token: authToken } = res.data;
      setUser(authUser);
      setToken(authToken);
      localStorage.setItem('sevasetu_user', JSON.stringify(authUser));
      localStorage.setItem('sevasetu_token', authToken);
      return authUser;
    }
    throw new Error(res.data.error || 'Login failed');
  };

  const register = async (data) => {
    const res = await api.register(data);
    if (res.data.success) {
      const { user: authUser, token: authToken } = res.data;
      setUser(authUser);
      setToken(authToken);
      localStorage.setItem('sevasetu_user', JSON.stringify(authUser));
      localStorage.setItem('sevasetu_token', authToken);
      return authUser;
    }
    throw new Error(res.data.error || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sevasetu_user');
    localStorage.removeItem('sevasetu_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: Boolean(user),
      isCustomer: user?.role === 'customer',
      isWorker: user?.role === 'worker',
      isSocietyAdmin: user?.role === 'society_admin',
      isSuperAdmin: user?.role === 'super_admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
