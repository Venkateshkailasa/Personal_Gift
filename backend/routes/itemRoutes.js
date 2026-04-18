import express from 'express';
import {
  addItem,
  getItemsByWishlist,
  updateItem,
  deleteItem,
  reserveItem,
  unreserveItem
} from '../controllers/itemController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, addItem);
router.get('/wishlist/:wishlistId', getItemsByWishlist);
router.put('/:id', auth, updateItem);
router.delete('/:id', auth, deleteItem);
router.post('/:id/reserve', auth, reserveItem);
router.post('/:id/unreserve', auth, unreserveItem);

export default router;
