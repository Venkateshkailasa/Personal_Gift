import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  deleteProfile: () => api.delete('/auth/profile'),
};

export const wishlistAPI = {
  createWishlist: (data) => api.post('/wishlists', data),
  getMyWishlists: () => api.get('/wishlists/my-wishlists'),
  getFriendWishlists: (friendId) => api.get(`/wishlists/friend/${friendId}`),
  getWishlist: (id) => api.get(`/wishlists/${id}`),
  getPublicWishlist: (publicLink) => api.get(`/wishlists/public/${publicLink}`),
  updateWishlist: (id, data) => api.put(`/wishlists/${id}`, data),
  deleteWishlist: (id) => api.delete(`/wishlists/${id}`),
};

export const itemAPI = {
  addItem: (data) => api.post('/items', data),
  getItems: (wishlistId) => api.get(`/items/wishlist/${wishlistId}`),
  updateItem: (id, data) => api.put(`/items/${id}`, data),
  deleteItem: (id) => api.delete(`/items/${id}`),
  reserveItem: (id, data) => api.post(`/items/${id}/reserve`, data),
  unreserveItem: (id) => api.post(`/items/${id}/unreserve`),
};

export const circleAPI = {
  getMyCircle: () => api.get('/circle'),
  getUpcomingEvents: () => api.get('/circle/upcoming-events'),
  getFriendRequests: () => api.get('/circle/requests'),
  getNotifications: () => api.get('/circle/notifications'),
  sendMessage: (data) => api.post('/circle/messages', data),
  getMessages: (friendId) => api.get(`/circle/messages/${friendId}`),
  addToCircle: (data) => api.post('/circle', data),
  updateCirclePerson: (id, data) => api.put(`/circle/${id}`, data),
  acceptFriendRequest: (id) => api.put(`/circle/${id}/accept`),
  rejectFriendRequest: (id) => api.put(`/circle/${id}/reject`),
  removeFromCircle: (id) => api.delete(`/circle/${id}`),
};

export const giftAPI = {
  sendGift: (data) => api.post('/gifts/send', data),
  getSentGiftsForFriend: (friendId) => api.get(`/gifts/friend/${friendId}`),
};

export default api;
