import Circle from '../models/Circle.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Message from '../models/Message.js';

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

export const getMyCircle = async (req, res) => {
  try {
    const circles = await Circle.find({ user: req.userId })
      .populate('requester', 'username dateOfBirth marriageDate')
      .sort({ name: 1 });
      
    const mappedCircles = circles.map(circle => {
      const circleObj = circle.toObject();
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

// Get upcoming birthdays and important dates
export const getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    const acceptedFriends = await Circle.find({
      user: req.userId,
      status: 'accepted'
    }).populate('requester', 'name dateOfBirth marriageDate');

    const events = [];

    acceptedFriends.forEach(person => {
      if (person.requester) {
        const friendDetails = person.requester;
        
        // Process Birthdays
        if (friendDetails.dateOfBirth) {
          const bday = new Date(friendDetails.dateOfBirth);
          const birthdayThisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
          const birthdayNextYear = new Date(today.getFullYear() + 1, bday.getMonth(), bday.getDate());

          let nextBirthday = birthdayThisYear;
          if (birthdayThisYear < today) nextBirthday = birthdayNextYear;

          if (nextBirthday >= today && nextBirthday <= nextMonth) {
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

        // Process Anniversaries
        if (friendDetails.marriageDate) {
          const anniv = new Date(friendDetails.marriageDate);
          const anniversaryThisYear = new Date(today.getFullYear(), anniv.getMonth(), anniv.getDate());
          const anniversaryNextYear = new Date(today.getFullYear() + 1, anniv.getMonth(), anniv.getDate());

          let nextAnniversary = anniversaryThisYear;
          if (anniversaryThisYear < today) nextAnniversary = anniversaryNextYear;

          if (nextAnniversary >= today && nextAnniversary <= nextMonth) {
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
    }).populate('requester', 'name username');

    // Get requests I sent
    const sentRequests = await Circle.find({
      requester: req.userId,
      status: 'pending'
    }).populate('user', 'name username');

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
      status: 'pending',
      relationship: 'friend'
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
      relationship: 'friend',
      status: 'accepted'
    });

    if (!existingConnection) {
      const mutualConnection = new Circle({
        user: request.requester, // Add to requester's circle
        name: currentUser.name,
        relationship: 'friend',
        status: 'accepted',
        requester: req.userId
      });
      await mutualConnection.save();
    }

    await createNotification(
      request.requester,
      'friend_accept',
      `${currentUser.name} accepted your friend request`,
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
    if (circle.relationship === 'friend' && circle.status === 'accepted' && circle.requester) {
      await Circle.findOneAndDelete({
        user: circle.requester,
        requester: req.userId,
        relationship: 'friend',
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
    const notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
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

    const isFriend = await Circle.findOne({
      user: req.userId,
      requester: receiverId,
      relationship: 'friend',
      status: 'accepted'
    });

    if (!isFriend) {
      return res.status(403).json({ message: 'You can only message accepted friends' });
    }

    const message = new Message({
      sender: req.userId,
      receiver: receiverId,
      text,
      replyTo: replyTo || null
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
        { sender: req.userId, receiver: friendId },
        { sender: friendId, receiver: req.userId }
      ]
    }).populate('replyTo', 'text sender createdAt').sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Circle.findOneAndDelete({
      _id: id,
      user: req.userId,
      status: 'pending',
      relationship: 'friend'
    });

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    res.status(200).json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting friend request', error: error.message });
  }
};