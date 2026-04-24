/**
 * Sent Gift Model
 * Schema for tracking gifts sent between users with privacy controls
 */

import mongoose from 'mongoose';

const sentGiftSchema = new mongoose.Schema({
  // User who sent the gift
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Reference to circle entry (friend relationship)
  receiverFriendId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Circle',
    required: true
  },

  // Reference to actual user if registered (optional)
  receiverUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Gift name/title
  name: {
    type: String,
    required: true,
    trim: true
  },

  // Gift description
  description: {
    type: String,
    trim: true
  },

  // Platform where gift was purchased (Amazon, Etsy, etc.)
  platform: {
    type: String,
    trim: true
  },

  // Link to gift product
  link: {
    type: String,
    trim: true
  },

  // Gift price
  price: {
    type: Number
  },

  // Array of image URLs for the gift
  images: [{
    type: String
  }],

  // Privacy setting for who can see this gift
  privacy: {
    type: String,
    enum: ['public_to_friends', 'private_to_sender'],
    default: 'public_to_friends'
  },

  // Timestamp of gift creation
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('SentGift', sentGiftSchema);
