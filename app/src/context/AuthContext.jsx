import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const signup = useCallback(async (formData) => {
    setLoading(true);
    try {
      const response = await authAPI.signup(formData);
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Signup failed';
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (identifier, password) => {
    setLoading(true);
    try {
      const response = await authAPI.login({ identifier, password });
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const fetchMe = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await authAPI.getMe();
      setUser(response.data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
  }, [token, fetchMe, user]);

  const updateProfileState = useCallback((userData) => {
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};
