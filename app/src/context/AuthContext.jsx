/**
 * Authentication Context for the Personal Gift application
 * Provides global authentication state and user management throughout the app
 */

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../api';

// Create authentication context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // State management for authentication
  const [user, setUser] = useState(null); // Current authenticated user data
  const [token, setToken] = useState(localStorage.getItem('token')); // JWT token from localStorage
  const [loading, setLoading] = useState(!!localStorage.getItem('token')); // Loading state during auth operations

  /**
   * User registration/signup function
   * @param {Object} formData - User registration data (name, email, username, password, confirmPassword)
   * @returns {Promise<Object>} Response data with token and user info
   */
  const signup = useCallback(async (formData) => {
    setLoading(true);
    try {
      const response = await authAPI.signup(formData);
      // Store JWT token in localStorage for persistence
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);

      // Normalize user data (ensure both _id and id fields exist for compatibility)
      const userData = response.data.user;
      if (userData && userData._id && !userData.id) userData.id = userData._id;
      if (userData && userData.id && !userData._id) userData._id = userData.id;
      setUser(userData);

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Signup failed';
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * User login function
   * @param {string} identifier - Username or email
   * @param {string} password - User password
   * @returns {Promise<Object>} Response data with token and user info
   */
  const login = useCallback(async (identifier, password) => {
    setLoading(true);
    try {
      const response = await authAPI.login({ identifier, password });
      // Store JWT token in localStorage for persistence
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);

      // Normalize user data (ensure both _id and id fields exist for compatibility)
      const userData = response.data.user;
      if (userData && userData._id && !userData.id) userData.id = userData._id;
      if (userData && userData.id && !userData._id) userData._id = userData.id;
      setUser(userData);

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * User logout function
   * Clears authentication data from localStorage and state
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Fetch current user profile from API
   * Used to validate token and get fresh user data
   */
  const fetchMe = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await authAPI.getMe();
      // Normalize user data (ensure both _id and id fields exist for compatibility)
      const userData = response.data.user;
      if (userData && userData._id && !userData.id) userData.id = userData._id;
      if (userData && userData.id && !userData._id) userData._id = userData.id;
      setUser(userData);
    } catch {
      // If token is invalid, logout user
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  // Effect to fetch user data when component mounts and token exists
  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
  }, [token, fetchMe, user]);

  /**
   * Update user state after profile changes
   * @param {Object} userData - Updated user data from API
   */
  const updateProfileState = useCallback((userData) => {
    const normalizedData = { ...userData };
    // Normalize user data (ensure both _id and id fields exist for compatibility)
    if (normalizedData && normalizedData._id && !normalizedData.id) normalizedData.id = normalizedData._id;
    if (normalizedData && normalizedData.id && !normalizedData._id) normalizedData._id = normalizedData.id;
    setUser(normalizedData);
  }, []);

  // Provide authentication context to child components
  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};
