/**
 * Wishlist model for the Personal Gift application
 * Defines the schema for user wishlists containing desired items
 */

import mongoose from 'mongoose';

// Define the Wishlist schema
const wishlistSchema = new mongoose.Schema({
  // Reference to the user who owns this wishlist
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User model
    required: true // Every wishlist must belong to a user
  },

  // Basic wishlist information
  title: {
    type: String,
    required: true, // Wishlist must have a title
    trim: true // Remove whitespace
  },
  description: {
    type: String,
    trim: true // Optional description of the wishlist
  },

  // Privacy settings for who can view the wishlist
  visibility: {
    type: String,
    enum: ['hidden', 'connections', 'public'], // Only these values allowed
    default: 'hidden' // Default to private
  },

  // Categories or interests associated with this wishlist
  interests: [{
    type: String,
    trim: true // Array of interest tags/categories
  }],

  // Public sharing link for public wishlists
  publicLink: {
    type: String,
    unique: true, // Must be unique across all wishlists
    sparse: true // Allows null values without uniqueness constraint issues
  },

  // Privacy setting for item reservations
  hideReserverName: {
    type: Boolean,
    default: false // Whether to hide who reserved items
  },

  // Optional event date this wishlist is for (birthday, wedding, etc.)
  eventDate: {
    type: Date
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now // Automatically set when wishlist is created
  },
  updatedAt: {
    type: Date,
    default: Date.now // Automatically set when wishlist is updated
  }
});

// Create and export the Wishlist model
export default mongoose.model('Wishlist', wishlistSchema);
