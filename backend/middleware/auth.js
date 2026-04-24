/**
 * Authentication middleware for the Personal Gift application
 * Validates JWT tokens and extracts user information for protected routes
 */

import jwt from 'jsonwebtoken';

/**
 * Authentication middleware function
 * Verifies JWT token from Authorization header and adds userId to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const auth = (req, res, next) => {
  try {
    // Extract JWT token from Authorization header (format: "Bearer <token>")
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user ID to request object for use in route handlers
    req.userId = decoded.userId;

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Token verification failed (expired, invalid, etc.)
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default auth;
