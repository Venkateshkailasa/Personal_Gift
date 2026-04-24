/**
 * User model for the Personal Gift application
 * Defines the schema for user accounts and profiles
 */

import mongoose from 'mongoose';

// Define the User schema with validation rules
const userSchema = new mongoose.Schema({
  // Basic user information
  name: {
    type: String,
    required: true, // Must be provided during registration
    trim: true // Removes whitespace from beginning and end
  },
  username: {
    type: String,
    required: true, // Must be provided during registration
    unique: true, // Must be unique across all users
    lowercase: true, // Automatically converted to lowercase
    trim: true // Removes whitespace
  },
  bio: {
    type: String,
    trim: true,
    default: '' // Optional user biography/description
  },

  // Authentication fields
  email: {
    type: String,
    required: true, // Must be provided during registration
    unique: true, // Must be unique across all users
    lowercase: true, // Automatically converted to lowercase
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'] // Email validation regex
  },
  password: {
    type: String,
    required: true, // Must be provided during registration
    minlength: 6, // Minimum password length
    select: false // Password won't be included in query results by default (security)
  },

  // Personal information
  dateOfBirth: {
    type: Date // User's birth date for age calculations and birthday reminders
  },
  profileImage: {
    type: String,
    trim: true,
    default: '' // URL to user's profile picture
  },
  mobileNumber: {
    type: String,
    trim: true // User's phone number
  },

  // Relationship status
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married'] // Only these values are allowed
  },
  marriageDate: {
    type: Date // Wedding anniversary date
  },

  // Address information for gift delivery
  address: {
    state: String, // State/Province
    district: String, // District/City
    pinCode: String, // Postal/ZIP code
    street: String // Street address
  },

  // User permissions and roles
  role: {
    type: String,
    enum: ['user', 'admin'], // User roles for access control
    default: 'user' // Default role for new users
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now // Automatically set when user is created
  }
});

// Create and export the User model
export default mongoose.model('User', userSchema);
