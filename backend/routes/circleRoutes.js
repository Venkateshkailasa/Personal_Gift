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
  sendMessage,
  getMessages
} from '../controllers/circleController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', getMyCircle);
router.get('/upcoming-events', getUpcomingEvents);
router.get('/requests', getFriendRequests);
router.get('/notifications', getNotifications);
router.post('/messages', sendMessage);
router.get('/messages/:friendId', getMessages);
router.post('/', addToCircle);
router.put('/:id', updateCirclePerson);
router.put('/:id/accept', acceptFriendRequest);
router.put('/:id/reject', rejectFriendRequest);
router.delete('/:id', removeFromCircle);

export default router;