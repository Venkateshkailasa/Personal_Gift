import User from '../models/User.js';
import Circle from '../models/Circle.js';
import Wishlist from '../models/Wishlist.js';
import Item from '../models/Item.js';
import SentGift from '../models/SentGift.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

export const signup = async (req, res) => {
  try {
    const { name, email, username, password, confirmPassword } = req.body;

    if (!name || !email || !username || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    user = new User({
      name,
      email,
      username,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in signup', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide username/email and password' });
    }

    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'User logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        profileComplete: !!user.dateOfBirth
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in login', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    const isPasswordCorrect = await bcryptjs.compare(oldPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        profileComplete: !!user.dateOfBirth
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { mobileNumber, dateOfBirth, maritalStatus, marriageDate, address } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (maritalStatus) user.maritalStatus = maritalStatus;
    if (marriageDate) user.marriageDate = marriageDate;
    if (address) user.address = address;
    
    await user.save();
    res.status(200).json({ 
      message: 'Profile updated successfully', 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        profileComplete: !!user.dateOfBirth
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.userId;

    await User.findByIdAndDelete(userId);
    await Circle.deleteMany({ $or: [{ user: userId }, { requester: userId }] });
    
    const userWishlists = await Wishlist.find({ userId });
    const wishlistIds = userWishlists.map(w => w._id);
    
    await Wishlist.deleteMany({ userId });
    await Item.deleteMany({ wishlistId: { $in: wishlistIds } });
    
    await SentGift.deleteMany({ sender: userId });
    await Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });
    await Notification.deleteMany({ user: userId });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};
