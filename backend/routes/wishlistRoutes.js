/**
 * Wishlist Routes
 * API endpoints for wishlist creation, management, and sharing
 */

import express from 'express';
import {
  createWishlist,
  getMyWishlists,
  getFriendWishlists,
  getWishlistById,
  getPublicWishlist,
  updateWishlist,
  deleteWishlist
} from '../controllers/wishlistController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Wishlist CRUD operations (authenticated)
router.post('/', auth, createWishlist); // Create new wishlist
router.get('/my-wishlists', auth, getMyWishlists); // Get user's own wishlists
router.get('/friend/:friendId', auth, getFriendWishlists); // Get friend's wishlists
router.get('/:id', auth, getWishlistById); // Get specific wishlist by ID
router.put('/:id', auth, updateWishlist); // Update wishlist details
router.delete('/:id', auth, deleteWishlist); // Delete wishlist

// Public wishlist access (no authentication required)
router.get('/public/:publicLink', getPublicWishlist); // Access public wishlist by link

export default router;
