/**
 * Authentication controller for the Personal Gift application
 * Handles user registration, login, profile management, and related operations
 */

import User from '../models/User.js';
import Circle from '../models/Circle.js';
import Wishlist from '../models/Wishlist.js';
import Item from '../models/Item.js';
import SentGift from '../models/SentGift.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';

/**
 * User registration/signup endpoint
 * Creates a new user account with validation
 */
export const signup = async (req, res) => {
  try {
    // Extract required fields from request body
    const { name, email, username, password, confirmPassword } = req.body;

    // Validate that all required fields are provided
    if (!name || !email || !username || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if user already exists with this email or username
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    // Hash the password for security
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create new user with hashed password
    user = new User({
      name,
      email,
      username,
      password: hashedPassword
    });

    // Save user to database
    await user.save();

    // Generate JWT token for authentication
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Return success response with token and user data
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        profileImage: user.profileImage,
        mobileNumber: user.mobileNumber,
        dateOfBirth: user.dateOfBirth,
        maritalStatus: user.maritalStatus,
        marriageDate: user.marriageDate,
        address: user.address,
        role: user.role,
        profileComplete: !!user.dateOfBirth // Profile is complete if dateOfBirth is set
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in signup', error: error.message });
  }
};

/**
 * User login endpoint
 * Authenticates user credentials and returns JWT token
 */
export const login = async (req, res) => {
  try {
    // Extract login credentials
    const { identifier, password } = req.body;

    // Validate required fields
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide username/email and password' });
    }

    // Find user by email or username (include password field for comparison)
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    // Verify password
    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Return success response with token and user data
    res.status(200).json({
      message: 'User logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        profileImage: user.profileImage,
        mobileNumber: user.mobileNumber,
        dateOfBirth: user.dateOfBirth,
        maritalStatus: user.maritalStatus,
        marriageDate: user.marriageDate,
        address: user.address,
        role: user.role,
        profileComplete: !!user.dateOfBirth
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in login', error: error.message });
  }
};

/**
 * Password reset endpoint
 * Allows authenticated users to change their password
 */
export const resetPassword = async (req, res) => {
  try {
    // Extract password reset data
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    // Validate all required fields are provided
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Verify new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    // Find user and include password field for verification
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    // Verify old password is correct
    const isPasswordCorrect = await bcryptjs.compare(oldPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Hash new password and save
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

/**
 * Get current user profile endpoint
 * Returns authenticated user's profile information
 */
export const getMe = async (req, res) => {
  try {
    // Find user by ID (set by auth middleware)
    const user = await User.findById(req.userId);

    // Return user profile data
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        profileImage: user.profileImage,
        mobileNumber: user.mobileNumber,
        dateOfBirth: user.dateOfBirth,
        maritalStatus: user.maritalStatus,
        marriageDate: user.marriageDate,
        address: user.address,
        role: user.role,
        profileComplete: !!user.dateOfBirth // Profile complete if dateOfBirth exists
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

/**
 * Update user profile endpoint
 * Allows users to update their profile information
 */
export const updateProfile = async (req, res) => {
  try {
    // Extract profile update data
    const { name, bio, profileImage, mobileNumber, dateOfBirth, maritalStatus, marriageDate, address } = req.body;

    // Update user fields if provided
    if (name) user.name = name;

    // Handle profile image upload/update
    if (profileImage !== undefined) {
      if (profileImage.startsWith('data:image')) {
        // Handle base64 image upload
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
          // Configure Cloudinary for image upload
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
          });

          try {
            // Upload image to Cloudinary
            const uploadRes = await cloudinary.uploader.upload(profileImage, {
              folder: 'gift_registry_avatars',
            });
            user.profileImage = uploadRes.secure_url;
          } catch (uploadErr) {
            return res.status(500).json({ message: 'Failed to upload image to Cloudinary. Please try providing an Image URL instead.', error: uploadErr.message });
          }
        } else {
          // Fallback to storing base64 string if Cloudinary is not configured
          console.warn('Cloudinary not configured. Storing base64 image directly in database.');
          user.profileImage = profileImage;
        }
      } else {
        // Direct URL provided
        user.profileImage = profileImage;
      }
    }

    // Update other profile fields
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (bio !== undefined) user.bio = bio;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (maritalStatus) user.maritalStatus = maritalStatus;
    if (marriageDate) user.marriageDate = marriageDate;
    if (address) user.address = address;

    // Save updated user
    await user.save();

    // Return updated user data
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        profileImage: user.profileImage,
        mobileNumber: user.mobileNumber,
        dateOfBirth: user.dateOfBirth,
        maritalStatus: user.maritalStatus,
        marriageDate: user.marriageDate,
        address: user.address,
        role: user.role,
        profileComplete: !!user.dateOfBirth
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

/**
 * Delete user account endpoint
 * Permanently deletes user account and all associated data
 */
export const deleteUser = async (req, res) => {
  try {
    const userId = req.userId;

    // Delete user account
    await User.findByIdAndDelete(userId);

    // Delete all circle connections (friends/family relationships)
    await Circle.deleteMany({ $or: [{ user: userId }, { requester: userId }] });

    // Find all user's wishlists
    const userWishlists = await Wishlist.find({ userId });
    const wishlistIds = userWishlists.map(w => w._id);

    // Delete all user's wishlists
    await Wishlist.deleteMany({ userId });

    // Delete all items from user's wishlists
    await Item.deleteMany({ wishlistId: { $in: wishlistIds } });
    // Delete all sent gifts records
    await SentGift.deleteMany({ $or: [{ sender: userId }, { receiverUser: userId }] });

    // Unreserve all items reserved by this user
    await Item.updateMany(
      { reservedBy: userId },
      { $set: { reservedBy: null, status: 'available', reserverName: null, reservedAt: null } }
    );

    // Delete all messages sent/received by user
    await Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });

    // Delete all notifications for user
    await Notification.deleteMany({ user: userId });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};
