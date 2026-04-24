/**
 * Admin authorization middleware for the Personal Gift application
 * Ensures only users with admin role can access protected admin routes
 */

import User from '../models/User.js';

/**
 * Admin role verification middleware
 * Checks if the authenticated user has admin privileges
 * @param {Object} req - Express request object (must have userId from auth middleware)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isAdmin = async (req, res, next) => {
  try {
    // Find user by ID (userId should be set by auth middleware)
    const user = await User.findById(req.userId);

    // Check if user exists and has admin role
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // User is admin, continue to next middleware/route handler
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error verifying admin role', error: error.message });
  }
};

export default isAdmin;
