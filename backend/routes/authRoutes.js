import express from 'express';
import { signup, login, getMe, resetPassword, updateProfile, deleteUser } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.delete('/profile', auth, deleteUser);

export default router;
