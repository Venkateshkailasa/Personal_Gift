/**
 * Wishlist Controller
 * Handles wishlist creation, management, and sharing functionality
 */

import Wishlist from '../models/Wishlist.js';
import Item from '../models/Item.js';
import Circle from '../models/Circle.js';
import User from '../models/User.js';
import crypto from 'crypto';

/**
 * Generate a unique public link for wishlist sharing
 * @returns {string} Random 32-character hex string
 */
const generatePublicLink = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Create a new wishlist
 * Handles wishlist creation with privacy settings and public link generation
 */
export const createWishlist = async (req, res) => {
  try {
    // Extract wishlist data from request
    const { title, description, visibility, interests, hideReserverName, eventDate } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Wishlist title is required' });
    }

    // Create new wishlist instance
    let wishlist = new Wishlist({
      userId,
      title,
      description,
      visibility: visibility || 'hidden', // hidden, friends_only, public
      interests: interests || [],
      hideReserverName, // Hide who reserved items
      eventDate // Optional event date for the wishlist
    });

    // Generate public link if wishlist is public
    if (visibility === 'public') {
      wishlist.publicLink = generatePublicLink();
    }

    // Save wishlist to database
    await wishlist.save();

    res.status(201).json({
      message: 'Wishlist created successfully',
      wishlist
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating wishlist', error: error.message });
  }
};

/**
 * Get all wishlists for the authenticated user
 * Returns user's own wishlists sorted by creation date
 */
export const getMyWishlists = async (req, res) => {
  try {
    const userId = req.userId;

    // Find all wishlists belonging to user
    const wishlists = await Wishlist.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      wishlists
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlists', error: error.message });
  }
};

/**
 * Get wishlists of a friend
 * Only accessible if users are connected in circle
 */
export const getFriendWishlists = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.userId;

    // Verify friendship/connection exists
    const circleMember = await Circle.findOne({
      user: friendId,
      status: 'accepted',
      requester: userId
    });

    if (!circleMember) {
      return res.status(403).json({ message: 'You can only view wishlists of your accepted friends' });
    }

    // Get friend's wishlists (currently shows all, could be made more granular)
    const wishlists = await Wishlist.find({
      userId: friendId,
      // For now, we'll show all wishlists to friends, but you could add more granular privacy
    }).sort({ createdAt: -1 });

    // Get items for each wishlist
    const wishlistsWithItems = await Promise.all(
      wishlists.map(async (wishlist) => {
        const items = await Item.find({ wishlistId: wishlist._id }).sort({ createdAt: -1 });
        return {
          ...wishlist.toObject(),
          items
        };
      })
    );

    res.status(200).json({
      wishlists: wishlistsWithItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friend wishlists', error: error.message });
  }
};

/**
 * Get a specific wishlist by ID
 * Includes ownership and permission checks
 */
export const getWishlistById = async (req, res) => {
  try {
    const { id } = req.params;
    const wishlist = await Wishlist.findById(id).populate('userId', 'name email');

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const userId = req.userId;
    const currentUser = await User.findById(userId);
    const isOwner = wishlist.userId._id.toString() === userId;

    if (!isOwner && wishlist.visibility !== 'public') {
      if (wishlist.visibility === 'hidden') {
         return res.status(403).json({ message: 'Not authorized to view this wishlist' });
      }
      const circleMember = await Circle.findOne({
        user: wishlist.userId._id,
        status: 'accepted',
        relationship: { $in: ['friend', 'family', 'colleague'] },
        $or: [
          { requester: userId },
          { email: currentUser?.email }
        ]
      });

      if (!circleMember) {
        return res.status(403).json({ message: 'Not authorized to view this wishlist' });
      }
    }

    res.status(200).json({
      wishlist
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
  }
};

export const getPublicWishlist = async (req, res) => {
  try {
    const { publicLink } = req.params;
    const wishlist = await Wishlist.findOne({ publicLink, visibility: 'public' }).populate('userId', 'name');

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    res.status(200).json({
      wishlist
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
  }
};

export const updateWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, visibility, interests, hideReserverName, eventDate } = req.body;
    const userId = req.userId;

    let wishlist = await Wishlist.findById(id);

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    if (wishlist.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this wishlist' });
    }

    wishlist.title = title || wishlist.title;
    wishlist.description = description !== undefined ? description : wishlist.description;
    wishlist.hideReserverName = hideReserverName !== undefined ? hideReserverName : wishlist.hideReserverName;
    wishlist.eventDate = eventDate !== undefined ? eventDate : wishlist.eventDate;
    if (interests) {
      wishlist.interests = interests;
    }

    if (visibility === 'public' && wishlist.visibility !== 'public') {
      wishlist.publicLink = generatePublicLink();
    }
    if (visibility !== 'public' && wishlist.visibility === 'public') {
      wishlist.publicLink = null;
    }
    wishlist.visibility = visibility !== undefined ? visibility : wishlist.visibility;

    wishlist.updatedAt = Date.now();

    await wishlist.save();

    res.status(200).json({
      message: 'Wishlist updated successfully',
      wishlist
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating wishlist', error: error.message });
  }
};

export const deleteWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const wishlist = await Wishlist.findById(id);

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    if (wishlist.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this wishlist' });
    }

    await Wishlist.findByIdAndDelete(id);
    await Item.deleteMany({ wishlistId: id });

    res.status(200).json({
      message: 'Wishlist deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting wishlist', error: error.message });
  }
};
