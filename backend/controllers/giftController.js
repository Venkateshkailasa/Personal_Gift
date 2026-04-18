import SentGift from '../models/SentGift.js';
import Circle from '../models/Circle.js';

// Send a new gift
export const sendGift = async (req, res) => {
  try {
    const { receiverFriendId, name, description, link, price, images, privacy } = req.body;

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
      name,
      description,
      link,
      price,
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

    const gifts = await SentGift.find({ receiverFriendId: friendId }).populate('sender', 'name');

    // Filter gifts based on privacy rules
    const filteredGifts = gifts.filter(gift => {
      // If current logged-in user is the one receiving the gift, they cannot see it!
      if (friendEntry.requester && friendEntry.requester.toString() === req.userId) {
        return false;
      }
      if (friendEntry.user && friendEntry.user.toString() === req.userId && friendEntry.relationship !== 'friend') {
         // this is for self entries? usually user won't query themselves as a friend.
         return false;
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
