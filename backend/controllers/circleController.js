/**
 * Circle Controller
 * Handles social connections, friend requests, and relationship management
 */

import Circle from '../models/Circle.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Message from '../models/Message.js';

/**
 * Helper function to create notifications
 * @param {string} userId - User to receive notification
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} meta - Additional metadata
 */
const createNotification = async (userId, type, title, message, meta = {}) => {
  const notification = new Notification({
    user: userId,
    type,
    title,
    message,
    meta,
  });
  await notification.save();
};

/**
 * Get user's social circle (friends and family)
 * Returns all accepted and pending connections
 */
export const getMyCircle = async (req, res) => {
  try {
    // Find all circle connections for the user
    const circles = await Circle.find({ user: req.userId })
      .populate('requester', 'username dateOfBirth marriageDate profileImage')
      .sort({ name: 1 });

    // Map and enhance circle data with friend details
    const mappedCircles = circles.map(circle => {
      const circleObj = circle.toObject();

      // Add birthday/anniversary info for accepted friends
      if (circleObj.requester && circleObj.status === 'accepted') {
        circleObj.birthday = circleObj.requester.dateOfBirth;
        circleObj.anniversary = circleObj.requester.marriageDate;
        circleObj.friendUsername = circleObj.requester.username;
      }
      return circleObj;
    });

    res.status(200).json({ circles: mappedCircles });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching circle', error: error.message });
  }
};

/**
 * Get upcoming birthdays and anniversaries for user's circle
 * Calculates next occurrence dates and days until events
 */
export const getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date();

    // Get all accepted friends with their details
    const acceptedFriends = await Circle.find({
      user: req.userId,
      status: 'accepted'
    }).populate('requester', 'name dateOfBirth marriageDate profileImage');

    const events = [];

    // Process each friend for upcoming events
    acceptedFriends.forEach(person => {
      if (person.requester) {
        const friendDetails = person.requester;

        // Calculate next birthday
        if (friendDetails.dateOfBirth) {
          const bday = new Date(friendDetails.dateOfBirth);
          const birthdayThisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
          const birthdayNextYear = new Date(today.getFullYear() + 1, bday.getMonth(), bday.getDate());

          let nextBirthday = birthdayThisYear;
          if (birthdayThisYear < today) nextBirthday = birthdayNextYear;

          // Add to events if within reasonable timeframe
          if (nextBirthday >= today) {
            events.push({
              id: person._id,
              name: person.name,
              relationship: person.relationship,
              type: 'birthday',
              date: nextBirthday,
              daysUntil: Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24))
            });
          }
        }

        // Calculate next anniversary
        if (friendDetails.marriageDate) {
          const anniv = new Date(friendDetails.marriageDate);
          const anniversaryThisYear = new Date(today.getFullYear(), anniv.getMonth(), anniv.getDate());
          const anniversaryNextYear = new Date(today.getFullYear() + 1, anniv.getMonth(), anniv.getDate());

          let nextAnniversary = anniversaryThisYear;
          if (anniversaryThisYear < today) nextAnniversary = anniversaryNextYear;

          // Add to events if within reasonable timeframe
          if (nextAnniversary >= today) {
            events.push({
              id: person._id,
              name: person.name,
              relationship: person.relationship,
              type: 'anniversary',
              date: nextAnniversary,
              daysUntil: Math.ceil((nextAnniversary - today) / (1000 * 60 * 60 * 24))
            });
          }
        }
      }
    });

    // Sort events by soonest first
    events.sort((a, b) => a.daysUntil - b.daysUntil);
    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching upcoming events', error: error.message });
  }
};

// Add a new person to circle via username
export const addToCircle = async (req, res) => {
  try {
    const { username, relationship, requestMessage } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const currentUser = await User.findById(req.userId);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (!existingUser) {
      return res.status(404).json({ message: 'No registered user matches this username' });
    }

    if (existingUser._id.toString() === req.userId) {
      return res.status(400).json({ message: 'You cannot add yourself as a friend' });
    }

    if (existingUser.role === 'admin') {
      return res.status(403).json({ message: 'You cannot add an administrator to your circle' });
    }

    const existingRequest = await Circle.findOne({
      user: existingUser._id,
      requester: req.userId
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent/connected to this person' });
    }

    const friendRequest = new Circle({
      user: existingUser._id,
      name: currentUser.name, 
      relationship: relationship || 'friend',
      status: 'pending',
      requester: req.userId,
      requestMessage: requestMessage || ''
    });

    await friendRequest.save();

    await createNotification(
      existingUser._id,
      'friend_request',
      `New friend request from ${currentUser.name} (@${currentUser.username})`,
      requestMessage || `${currentUser.name} Wants to connect with you.`,
      { from: req.userId }
    );

    return res.status(201).json({
      message: 'Friend request sent successfully',
      request: friendRequest,
      isRequest: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding person to circle', error: error.message });
  }
};

// Update a person in circle
export const updateCirclePerson = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const circle = await Circle.findOneAndUpdate(
      { _id: id, user: req.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!circle) {
      return res.status(404).json({ message: 'Person not found in your circle' });
    }

    res.status(200).json({ message: 'Person updated successfully', circle });
  } catch (error) {
    res.status(500).json({ message: 'Error updating person', error: error.message });
  }
};

// Get pending friend requests (both sent and received)
export const getFriendRequests = async (req, res) => {
  try {
    // Get requests sent to me
    const receivedRequests = await Circle.find({
      user: req.userId,
      status: 'pending'
    }).populate('requester', 'name username profileImage');

    // Get requests I sent
    const sentRequests = await Circle.find({
      requester: req.userId,
      status: 'pending'
    }).populate('user', 'name username profileImage');

    res.status(200).json({
      received: receivedRequests,
      sent: sentRequests
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friend requests', error: error.message });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Circle.findOne({
      _id: id,
      user: req.userId,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Update the request to accepted
    request.status = 'accepted';
    await request.save();

    const currentUser = await User.findById(req.userId);

    // Also add the requester to current user's circle (mutual friendship)
    const existingConnection = await Circle.findOne({
      user: request.requester, // Add to requester's circle
      requester: req.userId,   // From current user
      status: 'accepted'
    });

    if (!existingConnection) {
      const mutualConnection = new Circle({
        user: request.requester, // Add to requester's circle
        name: currentUser.name,
        relationship: request.relationship,
        status: 'accepted',
        requester: req.userId
      });
      await mutualConnection.save();
    }

    await createNotification(
      request.requester,
      'friend_accept',
      `${currentUser.name} accepted your request`,
      `You are now connected with ${currentUser.name}.`,
      { from: req.userId }
    );

    res.status(200).json({ message: 'Friend request accepted', request });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting friend request', error: error.message });
  }
};

// Remove a person from circle
export const removeFromCircle = async (req, res) => {
  try {
    const { id } = req.params;

    const circle = await Circle.findOneAndDelete({ _id: id, user: req.userId });

    if (!circle) {
      return res.status(404).json({ message: 'Person not found in your circle' });
    }

    // If this was an accepted friend connection, remove reciprocal entry too
    if (circle.status === 'accepted' && circle.requester) {
      await Circle.findOneAndDelete({
        user: circle.requester,
        requester: req.userId,
        status: 'accepted'
      });
    }

    res.status(200).json({ message: 'Person removed from circle successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing person from circle', error: error.message });
  }
};

// Get notifications for the current user
export const getNotifications = async (req, res) => {
  try {
    const unreadNotifications = await Notification.find({ user: req.userId, isRead: false })
      .sort({ createdAt: -1 })
      .limit(30);

    const readNotifications = await Notification.find({ user: req.userId, isRead: true })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({ user: req.userId, isRead: false });

    res.status(200).json({ 
      notifications: [...unreadNotifications, ...readNotifications],
      unreadNotifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: req.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notifications as read', error: error.message });
  }
};

// Send a message to a friend
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, replyTo } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ message: 'Receiver and text are required' });
    }

    const currentUser = await User.findById(req.userId);
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if there is already an accepted conversation where the current user is involved.
    // If receiver has previously sent an accepted message to sender, or sender to receiver has an accepted message.
    const priorDiscussion = await Message.findOne({
      $or: [
        { sender: req.userId, receiver: receiverId, status: 'accepted' },
        { sender: receiverId, receiver: req.userId, status: 'accepted' }
      ]
    });

    const isRequest = !priorDiscussion;
    const status = isRequest ? 'pending' : 'accepted';

    const message = new Message({
      sender: req.userId,
      receiver: receiverId,
      text,
      replyTo: replyTo || null,
      status,
      isRequest
    });
    await message.save();

    await createNotification(
      receiverId,
      'message',
      `New message from ${currentUser.name}`,
      text,
      { from: req.userId }
    );

    res.status(201).json({ message: 'Message sent successfully', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// Get conversation with a friend
export const getMessages = async (req, res) => {
  try {
    const { friendId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: friendId, status: { $ne: 'rejected' } },
        { sender: friendId, receiver: req.userId, status: { $ne: 'rejected' } }
      ]
    }).populate('replyTo', 'text sender createdAt').sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

// Get Message Requests
export const getMessageRequests = async (req, res) => {
  try {
    // Find messages sent to me that are pending and requests
    const requests = await Message.find({
      receiver: req.userId,
      status: 'pending',
      isRequest: true
    }).populate('sender', 'name username').sort({ createdAt: -1 });

    // Group by sender mapping
    const grouped = {};
    requests.forEach(msg => {
      const senderId = msg.sender._id.toString();
      if (!grouped[senderId]) {
        grouped[senderId] = {
          sender: msg.sender,
          lastMessage: msg,
          count: 0
        };
      }
      grouped[senderId].count += 1;
    });

    res.status(200).json({ requests: Object.values(grouped) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching message requests', error: error.message });
  }
};

// Accept Message Request
export const acceptMessageRequest = async (req, res) => {
  try {
    const { senderId } = req.params;
    await Message.updateMany(
      { sender: senderId, receiver: req.userId, status: 'pending' },
      { status: 'accepted', isRequest: false }
    );
    res.status(200).json({ message: 'Message request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting message request', error: error.message });
  }
};

// Reject Message Request
export const rejectMessageRequest = async (req, res) => {
  try {
    const { senderId } = req.params;
    // Set to rejected so they disappear from requests
    await Message.updateMany(
      { sender: senderId, receiver: req.userId, status: 'pending' },
      { status: 'rejected', isRequest: false }
    );
    res.status(200).json({ message: 'Message request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting message request', error: error.message });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Circle.findOneAndDelete({
      _id: id,
      user: req.userId,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    res.status(200).json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting friend request', error: error.message });
  }
};

// Get friend profile details for pre-filling forms
export const getFriendProfile = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.userId;

    // Check if user is connected to this friend
    const circleMember = await Circle.findOne({
      $or: [
        { user: friendId, requester: userId, status: 'accepted' },
        { user: userId, requester: friendId, status: 'accepted' }
      ]
    });

    if (!circleMember) {
      return res.status(403).json({ message: 'Not connected to this friend' });
    }

    // Get friend profile
    const friend = await User.findById(friendId).select('-password');

    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    res.status(200).json({
      friend: {
        name: friend.name,
        profileImage: friend.profileImage,
        email: friend.email,
        dateOfBirth: friend.dateOfBirth,
        mobileNumber: friend.mobileNumber,
        maritalStatus: friend.maritalStatus,
        marriageDate: friend.marriageDate,
        address: friend.address,
        username: friend.username
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friend profile', error: error.message });
  }
};

// Get connections for a specific friend profile (inspect feature)
export const getFriendConnections = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.userId;

    // Check my relationship with this friend
    const circleMember = await Circle.findOne({
      $or: [
        { user: friendId, requester: userId, status: 'accepted' },
        { user: userId, requester: friendId, status: 'accepted' }
      ]
    });

    if (!circleMember) {
      return res.status(403).json({ message: 'Not connected to this friend' });
    }

    const relationshipLevel = circleMember.relationship; // 'friend', 'family', 'colleague'

    // Fetch the target friend's circle connections that MATCH the relationship type
    // If I am their family, I can see their family connections.
    
    const friendConnections = await Circle.find({
      user: friendId,
      status: 'accepted',
      relationship: relationshipLevel
    }).populate('requester', 'name username profileImage');

    // Remove the current user from the returned list of connections
    const filteredConnections = friendConnections.filter(c => 
      c.requester && c.requester._id.toString() !== userId
    );

    res.status(200).json({ connections: filteredConnections });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friend connections', error: error.message });
  }
};

// Unsend / Delete Message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    if (message.sender.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only unsend your own messages' });
    }
    await Message.findByIdAndDelete(messageId);
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
};

// Clear Chat
export const clearChat = async (req, res) => {
  try {
    const { friendId } = req.params;
    await Message.deleteMany({
      $or: [
        { sender: req.userId, receiver: friendId },
        { sender: friendId, receiver: req.userId }
      ]
    });
    res.status(200).json({ message: 'Chat cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing chat', error: error.message });
  }
};