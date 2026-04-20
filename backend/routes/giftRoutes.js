import express from 'express';
import { sendGift, getSentGiftsForFriend, getGlobalGiftActivity } from '../controllers/giftController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All gift routes require authentication
router.use(auth);

router.post('/send', sendGift);
router.get('/activity/global', getGlobalGiftActivity);
router.get('/friend/:friendId', getSentGiftsForFriend);

export default router;
