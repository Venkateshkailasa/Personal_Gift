/**
 * API configuration and client setup for the Personal Gift application
 * Provides centralized API calls to the backend with authentication handling
 */

import axios from 'axios';

// Base URL for API calls - uses environment variable or defaults to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Add Authorization header with Bearer token
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (error.response) {
      // Server responded with error status (4xx, 5xx)
      console.error('Response error:', {
        status: error.response.status,
        message: error.response.data?.message,
        data: error.response.data
      });
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.error('Network error - no response from server:', error.message);
      error.response = {
        status: 0,
        data: { message: 'Network error - unable to connect to server. Is the backend running?' }
      };
    } else {
      // Something else happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Authentication API endpoints
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data), // User registration
  login: (data) => api.post('/auth/login', data), // User login
  resetPassword: (data) => api.post('/auth/reset-password', data), // Password reset
  getMe: () => api.get('/auth/me'), // Get current user profile
  updateProfile: (data) => api.put('/auth/profile', data), // Update user profile
  deleteProfile: () => api.delete('/auth/profile'), // Delete user account
};

// Wishlist management API endpoints
export const wishlistAPI = {
  createWishlist: (data) => api.post('/wishlists', data), // Create new wishlist
  getMyWishlists: () => api.get('/wishlists/my-wishlists'), // Get user's own wishlists
  getFriendWishlists: (friendId) => api.get(`/wishlists/friend/${friendId}`), // Get friend's wishlists
  getWishlist: (id) => api.get(`/wishlists/${id}`), // Get specific wishlist by ID
  getPublicWishlist: (publicLink) => api.get(`/wishlists/public/${publicLink}`), // Get public wishlist by link
  updateWishlist: (id, data) => api.put(`/wishlists/${id}`, data), // Update wishlist
  deleteWishlist: (id) => api.delete(`/wishlists/${id}`), // Delete wishlist
};

// Item management API endpoints
export const itemAPI = {
  addItem: (data) => api.post('/items', data), // Add item to wishlist
  getItems: (wishlistId) => api.get(`/items/wishlist/${wishlistId}`), // Get items in a wishlist
  updateItem: (id, data) => api.put(`/items/${id}`, data), // Update item
  deleteItem: (id) => api.delete(`/items/${id}`), // Delete item
  reserveItem: (id, data) => api.post(`/items/${id}/reserve`, data), // Reserve item for purchase
  unreserveItem: (id) => api.post(`/items/${id}/unreserve`), // Cancel reservation
  orderItem: (id, data) => api.post(`/items/${id}/order`, data), // Mark item as ordered
  deliverItem: (id) => api.post(`/items/${id}/deliver`), // Mark item as delivered
  getGiftActivityForFriend: (friendId) => api.get(`/items/gift-activity/${friendId}`), // Get gift activity for friend
};

// Social circle and messaging API endpoints
export const circleAPI = {
  getMyCircle: () => api.get('/circle'), // Get user's social connections
  getUpcomingEvents: () => api.get('/circle/upcoming-events'), // Get upcoming birthdays/anniversaries
  getFriendRequests: () => api.get('/circle/requests'), // Get friend requests
  getNotifications: () => api.get('/circle/notifications'), // Get user notifications
  getFriendProfile: (friendId) => api.get(`/circle/friend-profile/${friendId}`), // Get friend's profile
  getFriendConnections: (friendId) => api.get(`/circle/friend-profile/${friendId}/connections`), // Get friend's connections
  markNotificationAsRead: (notificationId) => api.put(`/circle/notifications/${notificationId}/read`), // Mark notification as read
  markAllNotificationsAsRead: () => api.put('/circle/notifications/read-all'), // Mark all notifications as read
  sendMessage: (data) => api.post('/circle/messages', data), // Send message to friend
  getMessages: (friendId) => api.get(`/circle/messages/${friendId}`), // Get messages with friend
  deleteMessage: (messageId) => api.delete(`/circle/messages/${messageId}`), // Delete message
  clearChat: (friendId) => api.delete(`/circle/messages/chat/${friendId}`), // Clear entire chat
  getMessageRequests: () => api.get('/circle/messages/requests/all'), // Get message requests
  acceptMessageRequest: (senderId) => api.put(`/circle/messages/requests/${senderId}/accept`), // Accept message request
  rejectMessageRequest: (senderId) => api.put(`/circle/messages/requests/${senderId}/reject`), // Reject message request
  addToCircle: (data) => api.post('/circle', data), // Add person to circle
  updateCirclePerson: (id, data) => api.put(`/circle/${id}`, data), // Update circle connection
  acceptFriendRequest: (id) => api.put(`/circle/${id}/accept`), // Accept friend request
  rejectFriendRequest: (id) => api.put(`/circle/${id}/reject`),
  removeFromCircle: (id) => api.delete(`/circle/${id}`),
};

export const giftAPI = {
  sendGift: (data) => api.post('/gifts/send', data),
  getGlobalGiftActivity: () => api.get('/gifts/activity/global'),
  getSentGiftsForFriend: (friendId) => api.get(`/gifts/friend/${friendId}`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  restartSystem: () => api.post('/admin/restart'),
};

export default api;
