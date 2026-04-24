/**
 * Message Model
 * Schema for private messaging between users in the social circle
 */

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  // User who sent the message
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // User who receives the message
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Message content
  text: {
    type: String,
    required: true,
    trim: true
  },

  // Reference to message being replied to (for threaded conversations)
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },

  // Message status for request-based messaging
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'accepted'
  },

  // Whether this message is a connection request
  isRequest: {
    type: Boolean,
    default: false
  },

  // Timestamp of message creation
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying of conversations
messageSchema.index({ sender: 1, receiver: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);
