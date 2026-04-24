/**
 * Gift Routes
 * API endpoints for gift sending and tracking
 */

import express from 'express';
import { sendGift, getSentGiftsForFriend, getGlobalGiftActivity } from '../controllers/giftController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All gift routes require authentication
router.use(auth);

// Gift operations
router.post('/send', sendGift); // Send a gift to a friend
router.get('/friend/:friendId', getSentGiftsForFriend); // Get gifts sent to specific friend
router.get('/activity/global', getGlobalGiftActivity); // Get global gift activity in user's circle

export default router;
