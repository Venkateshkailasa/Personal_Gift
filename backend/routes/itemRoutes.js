/**
 * Item Routes
 * API endpoints for wishlist item management and gift lifecycle
 */

import express from 'express';
import {
  addItem,
  getItemsByWishlist,
  updateItem,
  deleteItem,
  reserveItem,
  unreserveItem,
  orderItem,
  deliverItem,
  getGiftActivityForFriend
} from '../controllers/itemController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Item CRUD operations
router.post('/', auth, addItem); // Add item to wishlist
router.get('/wishlist/:wishlistId', getItemsByWishlist); // Get items for wishlist (with permissions)
router.put('/:id', auth, updateItem); // Update item details
router.delete('/:id', auth, deleteItem); // Delete item

// Item reservation and gift lifecycle
router.post('/:id/reserve', auth, reserveItem); // Reserve item for gifting
router.post('/:id/unreserve', auth, unreserveItem); // Cancel reservation
router.post('/:id/order', auth, orderItem); // Mark item as ordered
router.post('/:id/deliver', auth, deliverItem); // Mark item as delivered

// Gift activity tracking
router.get('/gift-activity/:friendId', auth, getGiftActivityForFriend); // Get gift activity for friend

export default router;
