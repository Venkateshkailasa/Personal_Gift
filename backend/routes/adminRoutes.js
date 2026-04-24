/**
 * Admin Routes
 * Administrative API endpoints for system management and user administration
 */

import express from 'express';
import { getAllUsers, deleteUserByAdmin, refreshSystem, getSystemStats } from '../controllers/adminController.js';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/admin.js';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(auth, isAdmin);

// User management
router.get('/users', getAllUsers); // Get all users for admin management
router.delete('/users/:userId', deleteUserByAdmin); // Delete user and all associated data

// System management
router.get('/stats', getSystemStats); // Get system statistics
router.post('/restart', refreshSystem); // Refresh system data

export default router;
