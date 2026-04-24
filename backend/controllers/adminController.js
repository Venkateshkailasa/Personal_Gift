/**
 * Admin Controller
 * Handles administrative operations including user management and system statistics
 */

import User from '../models/User.js';
import Wishlist from '../models/Wishlist.js';
import Item from '../models/Item.js';
import Circle from '../models/Circle.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import SentGift from '../models/SentGift.js';

/**
 * Get all users (excluding admins) with age calculation
 * Used for admin user management interface
 */
export const getAllUsers = async (req, res) => {
  try {
    // Get all non-admin users with basic profile info
    const users = await User.find({ role: { $ne: 'admin' } }).select('username dateOfBirth name email');

    // Calculate age for each user
    const usersWithAge = users.map(user => {
      const userObj = user.toObject();
      if (userObj.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(userObj.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        // Adjust age if birthday hasn't occurred this year
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        userObj.age = age;
      } else {
        userObj.age = 'N/A';
      }
      return userObj;
    });

    res.status(200).json({ users: usersWithAge });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

/**
 * Delete a user and all associated data (admin only)
 * Performs cascading delete of all user-related records
 */
export const deleteUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find and validate user exists and isn't admin
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin user' });

    // Delete user account
    await User.findByIdAndDelete(userId);

    // Delete all social connections (both as user and requester)
    await Circle.deleteMany({ $or: [{ user: userId }, { requester: userId }] });

    // Get user's wishlists for cascading delete
    const userWishlists = await Wishlist.find({ userId });
    const wishlistIds = userWishlists.map(w => w._id);

    // Delete wishlists and all their items
    await Wishlist.deleteMany({ userId });
    await Item.deleteMany({ wishlistId: { $in: wishlistIds } });

    // Delete gift records (both sent and received)
    await SentGift.deleteMany({ $or: [{ sender: userId }, { receiverUser: userId }] });

    // Clear item reservations made by this user
    await Item.updateMany(
      { reservedBy: userId },
      { $set: { reservedBy: null, status: 'available', reserverName: null, reservedAt: null } }
    );

    // Delete messages and notifications
    await Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });
    await Notification.deleteMany({ user: userId });

    res.status(200).json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

/**
 * Refresh system data and return current statistics
 * Used for admin dashboard data refresh
 */
export const refreshSystem = async (req, res) => {
  try {
    // Get current user count (excluding admins)
    const userCount = await User.countDocuments({ role: { $ne: 'admin' } });
    res.status(200).json({
      message: 'System data refreshed',
      totalUsers: userCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error refreshing system', error: error.message });
  }
};

/**
 * Get basic system statistics
 * Returns user count for admin dashboard
 */
export const getSystemStats = async (req, res) => {
  try {
    // Get total non-admin user count
    const userCount = await User.countDocuments({ role: { $ne: 'admin' } });
    res.status(200).json({ totalUsers: userCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};
