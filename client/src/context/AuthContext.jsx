import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onUnauthorized = () => {
      localStorage.removeItem('buildora_token');
      setUser(null);
    };
    window.addEventListener('buildora:unauthorized', onUnauthorized);
    return () => window.removeEventListener('buildora:unauthorized', onUnauthorized);
  }, [refresh]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const userData = data.data?.user || data.data;
    const token = data.data?.token;
    if (token) localStorage.setItem('buildora_token', token);
    setUser(userData);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    const userData = data.data?.user || data.data;
    const token = data.data?.token;
    if (token) localStorage.setItem('buildora_token', token);
    setUser(userData);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    localStorage.removeItem('buildora_token');
    setUser(null);
    queryClient.clear();
  };

  const inDemoOrg = user?.email === 'demo@buildora.dev';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, inDemoOrg, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
