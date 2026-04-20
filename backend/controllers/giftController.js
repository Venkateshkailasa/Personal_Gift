import SentGift from '../models/SentGift.js';
import Circle from '../models/Circle.js';

// Send a new gift
export const sendGift = async (req, res) => {
  try {
    const { receiverFriendId, name, description, link, price, images, privacy, platform } = req.body;

    if (!receiverFriendId || !name) {
      return res.status(400).json({ message: 'Receiver friend ID and Name are required' });
    }

    // Verify the receiverFriendId belongs to the current user's circle
    const friend = await Circle.findOne({ _id: receiverFriendId, user: req.userId });
    if (!friend) {
      return res.status(404).json({ message: 'Friend not found in your circle' });
    }

    const newGift = new SentGift({
      sender: req.userId,
      receiverFriendId,
      receiverUser: friend.requester || null,
      name,
      description,
      link,
      price,
      platform: platform || 'Other',
      images: images || [],
      privacy: privacy || 'public_to_friends'
    });

    await newGift.save();
    res.status(201).json({ message: 'Gift sent successfully', gift: newGift });
  } catch (error) {
    res.status(500).json({ message: 'Error sending gift', error: error.message });
  }
};

// Get gifts sent to a specific friend
// - Only the sender can see 'private_to_sender' gifts.
// - Anyone with access (friends/family) can see 'public_to_friends' gifts, BUT the receiver themselves CANNOT.
export const getSentGiftsForFriend = async (req, res) => {
  try {
    const { friendId } = req.params;

    // friendId here is the Circle document ID for the friend
    // We need to fetch all gifts where receiverFriendId matches friendId, OR
    // where the underlying User ID (if registered) matches.
    // For simplicity, we assume we fetch exact matching receiverFriendId or gifts sent to the same user.
    
    // We only want to hide it if the current logged in user IS the receiver.
    // Let's resolve the actual User ID of the receiver if available.
    const friendEntry = await Circle.findById(friendId);
    if (!friendEntry) {
      return res.status(404).json({ message: 'Friend entry not found' });
    }

    // Attempt to query by the actual underlying user if registered, 
    // otherwise fallback to the specific Circle entry for unregistered manually added friends.
    const query = friendEntry.requester 
      ? { receiverUser: friendEntry.requester } 
      : { receiverFriendId: friendId };

    const gifts = await SentGift.find(query).populate('sender', 'name username');

    // Filter gifts based on privacy rules
    const filteredGifts = gifts.filter(gift => {
      // If current user is the one receiving the gift (they are the receiverUser)
      // They should NOT see the gift if it's a surprise ('public_to_friends') sent by someone else.
      if (gift.receiverUser && gift.receiverUser.toString() === req.userId) {
        // Current user can only see gifts they sent to themselves (uncommon but possible)
        if (gift.sender._id.toString() !== req.userId) {
          return false; // hide surprises sent by others
        }
      }

      // If privacy is private_to_sender, ONLY the sender can see it
      if (gift.privacy === 'private_to_sender') {
        return gift.sender._id.toString() === req.userId;
      }

      // Public to friends is visible to others
      return true;
    });

    res.status(200).json({ gifts: filteredGifts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gifts', error: error.message });
  }
};

// Get Global Recent Gift Activity across the user's circle
export const getGlobalGiftActivity = async (req, res) => {
  try {
    // 1. Fetch the user's entire connected circle
    const userCircles = await Circle.find({ user: req.userId, status: 'accepted' });
    const friendCircleIds = userCircles.map(c => c._id);
    const friendUserIds = userCircles.filter(c => c.requester).map(c => c.requester);

    // 2. Query SentGift where either:
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
    .sort({ createdAt: -1 })
    .limit(20);

    // 3. Filter out items meant as a Surprise for the current user
    const filteredGifts = gifts.filter(gift => {
      if (gift.receiverUser && gift.receiverUser.toString() === req.userId) {
        if (gift.sender._id.toString() !== req.userId && gift.privacy === 'public_to_friends') {
          return false;
        }
      }
      if (gift.privacy === 'private_to_sender') {
        return gift.sender._id.toString() === req.userId;
      }
      return true;
    });

    res.status(200).json({ activity: filteredGifts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching global gift activity', error: error.message });
  }
};
