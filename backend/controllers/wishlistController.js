import Wishlist from '../models/Wishlist.js';
import Item from '../models/Item.js';
import Circle from '../models/Circle.js';
import User from '../models/User.js';
import crypto from 'crypto';

const generatePublicLink = () => {
  return crypto.randomBytes(16).toString('hex');
};

export const createWishlist = async (req, res) => {
  try {
    const { title, description, visibility, interests, hideReserverName, eventDate } = req.body;
    const userId = req.userId;

    if (!title) {
      return res.status(400).json({ message: 'Wishlist title is required' });
    }

    let wishlist = new Wishlist({
      userId,
      title,
      description,
      visibility: visibility || 'hidden',
      interests: interests || [],
      hideReserverName,
      eventDate
    });

    if (visibility === 'public') {
      wishlist.publicLink = generatePublicLink();
    }

    await wishlist.save();

    res.status(201).json({
      message: 'Wishlist created successfully',
      wishlist
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating wishlist', error: error.message });
  }
};

export const getMyWishlists = async (req, res) => {
  try {
    const userId = req.userId;
    const wishlists = await Wishlist.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      wishlists
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlists', error: error.message });
  }
};

export const getFriendWishlists = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.userId;

    // Check if the current user is friends with the friendId
    const circleMember = await Circle.findOne({
      user: friendId,
      status: 'accepted',
      relationship: 'friend',
      requester: userId
    });

    if (!circleMember) {
      return res.status(403).json({ message: 'You can only view wishlists of your accepted friends' });
    }

    // Get friend's wishlists that are visible to friends (not necessarily public)
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
        relationship: { $in: ['friend', 'family'] },
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
