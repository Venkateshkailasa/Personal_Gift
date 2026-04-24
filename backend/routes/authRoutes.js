/**
 * Authentication routes for the Personal Gift application
 * Defines API endpoints for user authentication and profile management
 */

import express from 'express';
import { signup, login, getMe, resetPassword, updateProfile, deleteUser } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

// Create Express router instance
const router = express.Router();

// Public routes (no authentication required)
// POST /api/auth/signup - User registration
router.post('/signup', signup);

// POST /api/auth/login - User login
router.post('/login', login);

// POST /api/auth/reset-password - Password reset (public endpoint)
router.post('/reset-password', resetPassword);

// Protected routes (authentication required)
// GET /api/auth/me - Get current user profile
router.get('/me', auth, getMe);

// PUT /api/auth/profile - Update user profile
router.put('/profile', auth, updateProfile);

// DELETE /api/auth/profile - Delete user account
router.delete('/profile', auth, deleteUser);

// Export the router for use in main server file
export default router;
