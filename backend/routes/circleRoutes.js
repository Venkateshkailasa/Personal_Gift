/**
 * Circle Routes
 * API endpoints for social connections, friend requests, messaging, and notifications
 */

import express from 'express';
import {
  getMyCircle,
  getUpcomingEvents,
  addToCircle,
  updateCirclePerson,
  removeFromCircle,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  sendMessage,
  getMessages,
  getMessageRequests,
  acceptMessageRequest,
  rejectMessageRequest,
  getFriendProfile,
  getFriendConnections,
  deleteMessage,
  clearChat
} from '../controllers/circleController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All circle routes require authentication
router.use(auth);

// Social circle management
router.get('/', getMyCircle); // Get user's social connections
router.get('/upcoming-events', getUpcomingEvents); // Get birthdays/anniversaries

// Friend profile and connections
router.get('/friend-profile/:friendId', getFriendProfile); // Get friend's profile
router.get('/friend-profile/:friendId/connections', getFriendConnections); // Get friend's connections

// Friend request management
router.get('/requests', getFriendRequests); // Get pending friend requests
router.put('/:id/accept', acceptFriendRequest); // Accept friend request
router.put('/:id/reject', rejectFriendRequest); // Reject friend request

// Notification management
router.get('/notifications', getNotifications); // Get user notifications
router.put('/notifications/:notificationId/read', markNotificationAsRead); // Mark notification as read
router.put('/notifications/read-all', markAllNotificationsAsRead); // Mark all notifications as read

// Messaging system
router.post('/messages', sendMessage); // Send message to friend
router.get('/messages/requests/all', getMessageRequests); // Get message requests
router.put('/messages/requests/:senderId/accept', acceptMessageRequest); // Accept message request
router.put('/messages/requests/:senderId/reject', rejectMessageRequest); // Reject message request
router.get('/messages/:friendId', getMessages); // Get messages with friend
router.delete('/messages/:messageId', deleteMessage); // Delete specific message
router.delete('/messages/chat/:friendId', clearChat); // Clear entire chat

// Circle CRUD operations
router.post('/', addToCircle); // Add person to circle
router.put('/:id', updateCirclePerson); // Update circle person details
router.delete('/:id', removeFromCircle); // Remove person from circle

export default router;

