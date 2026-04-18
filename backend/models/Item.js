import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  wishlistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wishlist',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  productLink: {
    type: String,
    trim: true
  },
  productImage: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'taken'],
    default: 'available'
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reserverName: {
    type: String,
    trim: true
  },
  reservedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Item', itemSchema);
