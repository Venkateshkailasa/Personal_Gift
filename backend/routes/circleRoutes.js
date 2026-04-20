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
  getFriendConnections
} from '../controllers/circleController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', getMyCircle);
router.get('/upcoming-events', getUpcomingEvents);
router.get('/friend-profile/:friendId', getFriendProfile);
router.get('/friend-profile/:friendId/connections', getFriendConnections);
router.get('/requests', getFriendRequests);
router.get('/notifications', getNotifications);
router.put('/notifications/:notificationId/read', markNotificationAsRead);
router.put('/notifications/read-all', markAllNotificationsAsRead);
router.post('/messages', sendMessage);
router.get('/messages/requests/all', getMessageRequests);
router.put('/messages/requests/:senderId/accept', acceptMessageRequest);
router.put('/messages/requests/:senderId/reject', rejectMessageRequest);
router.get('/messages/:friendId', getMessages);
router.post('/', addToCircle);
router.put('/:id', updateCirclePerson);
router.put('/:id/accept', acceptFriendRequest);
router.put('/:id/reject', rejectFriendRequest);
router.delete('/:id', removeFromCircle);

export default router;