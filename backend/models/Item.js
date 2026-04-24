/**
 * Item model for the Personal Gift application
 * Defines the schema for individual items within wishlists
 */

import mongoose from 'mongoose';

// Define the Item schema
const itemSchema = new mongoose.Schema({
  // Reference to the wishlist this item belongs to
  wishlistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wishlist', // References the Wishlist model
    required: true // Every item must belong to a wishlist
  },

  // Basic item information
  name: {
    type: String,
    required: true, // Item must have a name
    trim: true // Remove whitespace
  },
  productLink: {
    type: String,
    trim: true // URL to the product page
  },
  productImage: {
    type: String,
    trim: true // URL to the product image
  },
  description: {
    type: String,
    trim: true // Optional item description
  },

  // Item status tracking
  status: {
    type: String,
    enum: ['available', 'reserved', 'ordered', 'delivered'], // Only these values allowed
    default: 'available' // New items start as available
  },

  // Reservation information
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User who reserved the item
    default: null // Null if not reserved
  },
  reserverName: {
    type: String,
    trim: true // Name of the person who reserved (for display)
  },
  reservedAt: {
    type: Date // When the item was reserved
  },

  // Order and delivery tracking
  orderedAt: {
    type: Date // When the item was ordered/purchased
  },
  deliveredAt: {
    type: Date // When the item was delivered
  },

  // Additional metadata
  platform: {
    type: String,
    trim: true // E-commerce platform (Amazon, Flipkart, etc.)
  },
  orderNotes: {
    type: String,
    trim: true // Notes about the order/delivery
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now // Automatically set when item is created
  }
});

// Create and export the Item model
export default mongoose.model('Item', itemSchema);
