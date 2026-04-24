/**
 * Gift Controller
 * Handles gift sending, tracking, and privacy management
 */

import SentGift from '../models/SentGift.js';
import Circle from '../models/Circle.js';

/**
 * Send a gift to a friend in the user's circle
 * Creates a gift record with privacy settings and delivery tracking
 */
export const sendGift = async (req, res) => {
  try {
    // Extract gift data from request
    const { receiverFriendId, name, description, link, price, images, privacy, platform } = req.body;

    // Validate required fields
    if (!receiverFriendId || !name) {
      return res.status(400).json({ message: 'Receiver friend ID and Name are required' });
    }

    // Verify the friend exists in user's circle
    const friend = await Circle.findOne({ _id: receiverFriendId, user: req.userId });
    if (!friend) {
      return res.status(404).json({ message: 'Friend not found in your circle' });
    }

    // Create new gift record
    const newGift = new SentGift({
      sender: req.userId,
      receiverFriendId,
      receiverUser: friend.requester || null, // Link to registered user if available
      name,
      description,
      link,
      price,
      platform: platform || 'Other',
      images: images || [],
      privacy: privacy || 'public_to_friends' // Default privacy setting
    });

    // Save gift to database
    await newGift.save();
    res.status(201).json({ message: 'Gift sent successfully', gift: newGift });
  } catch (error) {
    res.status(500).json({ message: 'Error sending gift', error: error.message });
  }
};

/**
 * Get gifts sent to a specific friend
 * Implements complex privacy filtering based on sender/receiver relationships
 */
export const getSentGiftsForFriend = async (req, res) => {
  try {
    const { friendId } = req.params;

    // Find the friend entry in circle
    let friendEntry = await Circle.findById(friendId);
    
    // If not found by ID, try to find by requester ID (case where friendId is a User ID)
    if (!friendEntry) {
      friendEntry = await Circle.findOne({ requester: friendId, user: req.userId });
    }

    if (!friendEntry) {
      return res.status(404).json({ message: 'Friend entry not found in your circle' });
    }

    // Query gifts by registered user ID or circle entry ID
    const query = friendEntry.requester
      ? { receiverUser: friendEntry.requester }
      : { receiverFriendId: friendId };

    // Get gifts with sender details
    const gifts = await SentGift.find(query).populate('sender', 'name username');

    // Apply privacy filtering based on current user's relationship to the gift
    const filteredGifts = gifts.filter(gift => {
      // If current user is the receiver, hide surprise gifts from others
      if (gift.receiverUser && gift.receiverUser.toString() === req.userId) {
        if (gift.sender._id.toString() !== req.userId) {
          return false; // Hide surprises sent by others
        }
      }

      // Private gifts are only visible to sender
      if (gift.privacy === 'private_to_sender') {
        return gift.sender._id.toString() === req.userId;
      }

      // Public gifts are visible to friends/family
      return true;
    });

    res.status(200).json({ gifts: filteredGifts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gifts', error: error.message });
  }
};

/**
 * Get global gift activity across user's entire circle
 * Shows recent gifts sent within the user's social network
 */
export const getGlobalGiftActivity = async (req, res) => {
  try {
    // Get all accepted connections in user's circle
    const userCircles = await Circle.find({ user: req.userId, status: 'accepted' });
    const friendCircleIds = userCircles.map(c => c._id);
    const friendUserIds = userCircles.filter(c => c.requester).map(c => c.requester);

    // Query gifts where either:
    //    - The intended receiver is in their Circle
    //    - The intended receiver is explicitly an underlying friend User _id
    const gifts = await SentGift.find({
      $or: [
        { receiverFriendId: { $in: friendCircleIds } },
        { receiverUser: { $in: friendUserIds } },
        { sender: { $in: friendUserIds } } // Activity my friends sent to others? Let's just track stuff involving the circle.
      ]
    })
    .populate('sender', 'name username')
    .populate('receiverFriendId')
    .sort({ createdAt: -1 })
    .limit(40);

    // 3. Filter out items meant as a Surprise for the current user
    const filteredGifts = gifts.filter(gift => {
      // 1. Hide surprises from the receiver themselves
      if (gift.receiverUser && gift.receiverUser.toString() === req.userId) {
        if (gift.sender._id.toString() !== req.userId) {
          return false;
        }
      }

      // 2. Private gifts only visible to sender
      if (gift.privacy === 'private_to_sender') {
        return gift.sender._id.toString() === req.userId;
      }

      // 3. Cleanup rule: Hide if occasion date has passed (current year)
      if (gift.receiverFriendId) {
        const circle = gift.receiverFriendId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (circle.birthday) {
          const bday = new Date(circle.birthday);
          const bdayThisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
          if (bdayThisYear < today) return false;
        }

        if (circle.marriageDate) {
          const anniv = new Date(circle.marriageDate);
          const annivThisYear = new Date(today.getFullYear(), anniv.getMonth(), anniv.getDate());
          if (annivThisYear < today) return false;
        }
      }

      return true;
    });

    res.status(200).json({ activity: filteredGifts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching global gift activity', error: error.message });
  }
};
