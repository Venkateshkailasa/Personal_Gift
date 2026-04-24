/**
 * Circle model for the Personal Gift application
 * Defines the schema for social connections and relationships
 */

import mongoose from 'mongoose';

// Define the Circle schema for managing social connections
const circleSchema = new mongoose.Schema({
  // The user who has this person in their circle
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User model
    required: true // Every circle entry must belong to a user
  },

  // Information about the connected person
  name: {
    type: String,
    required: true, // Must provide a name
    trim: true // Remove whitespace
  },
  relationship: {
    type: String,
    enum: ['family', 'friend', 'colleague', 'other'], // Only these relationship types allowed
    default: 'friend' // Default relationship type
  },

  // Connection status for friend requests
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'], // Connection request states
    default: 'accepted' // Default to accepted for direct additions
  },

  // If this connection was initiated by another user
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // References the User who sent the connection request
  },

  // Optional message sent with connection request
  requestMessage: {
    type: String,
    trim: true // Message explaining the connection request
  },

  // Additional notes about this connection
  notes: {
    type: String,
    trim: true // Personal notes about the connection
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now // Automatically set when connection is created
  }
});

// Database indexes for efficient queries
// Index on user and name for fast lookups of specific connections
circleSchema.index({ user: 1, name: 1 });
// Index on user and birthday for birthday-related queries (though birthday field not in schema - might be added later)
circleSchema.index({ user: 1, birthday: 1 });

// Create and export the Circle model
export default mongoose.model('Circle', circleSchema);