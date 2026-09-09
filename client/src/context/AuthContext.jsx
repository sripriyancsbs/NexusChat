import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { socketClient } from '../services/socket.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('nexus_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.getSession()
        .then((res) => {
          setUser(res.user);
          socketClient.connect(token);
        })
        .catch(() => {
          localStorage.removeItem('nexus_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (identifier, password) => {
    const res = await api.login({ identifier, password });
    localStorage.setItem('nexus_token', res.token);
    setToken(res.token);
    setUser(res.user);
    socketClient.connect(res.token);
    return res.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network errors during logout
    }
    localStorage.removeItem('nexus_token');
    setToken(null);
    setUser(null);
    socketClient.disconnect();
  };

  const updateUser = (updated) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : updated));
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.user) {
        setUser(res.user);
      }
    } catch {
      // Ignore if cannot refresh
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isModerator = ['ADMIN', 'MODERATOR'].includes(user?.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        refreshUser,
        isAdmin,
        isModerator
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
