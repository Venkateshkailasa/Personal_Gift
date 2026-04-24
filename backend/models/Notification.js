/**
 * Notification Model
 * Schema for user notifications (friend requests, messages, events)
 */

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // User who receives the notification
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Type of notification
  type: {
    type: String,
    enum: ['friend_request', 'friend_accept', 'message', 'event'],
    required: true
  },

  // Short notification title
  title: {
    type: String,
    required: true,
    trim: true
  },

  // Detailed notification message
  message: {
    type: String,
    trim: true
  },

  // Additional metadata (e.g., friend request ID, event details)
  meta: {
    type: Object,
    default: {}
  },

  // Whether user has read the notification
  isRead: {
    type: Boolean,
    default: false
  },

  // Timestamp of notification creation
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying of unread notifications
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
