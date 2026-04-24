/**
 * Main server file for the Personal Gift application
 * This file sets up the Express server, connects to the database,
 * configures middleware, and defines API routes.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { seedAdmin } from './seedAdmin.js';
import authRoutes from './routes/authRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import circleRoutes from './routes/circleRoutes.js';
import giftRoutes from './routes/giftRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Connect to MongoDB database and seed admin user
connectDB().then(() => {
  seedAdmin();
});

// Middleware configuration
// Parse JSON bodies with increased size limit for image uploads
app.use(express.json({ limit: '50mb' }));
// Parse URL-encoded bodies with increased size limit
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure CORS (Cross-Origin Resource Sharing) policy
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost on any port for development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// API Routes configuration
// Authentication routes (login, signup, profile management)
app.use('/api/auth', authRoutes);
// Wishlist management routes (create, read, update, delete wishlists)
app.use('/api/wishlists', wishlistRoutes);
// Item management routes (add, update, delete items in wishlists)
app.use('/api/items', itemRoutes);
// Social circle management routes (friends, connections, requests)
app.use('/api/circle', circleRoutes);
// Gift sending and tracking routes
app.use('/api/gifts', giftRoutes);
// Admin panel routes (user management, analytics)
app.use('/api/admin', adminRoutes);

// Health check endpoint for monitoring server status
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Server configuration
const PORT = process.env.PORT || 5000;

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
