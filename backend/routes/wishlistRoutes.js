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

router.post('/', auth, createWishlist);
router.get('/my-wishlists', auth, getMyWishlists);
router.get('/friend/:friendId', auth, getFriendWishlists);
router.get('/public/:publicLink', getPublicWishlist);
router.get('/:id', auth, getWishlistById);
router.put('/:id', auth, updateWishlist);
router.delete('/:id', auth, deleteWishlist);

export default router;
