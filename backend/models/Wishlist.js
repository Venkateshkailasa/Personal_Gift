import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  visibility: {
    type: String,
    enum: ['hidden', 'connections', 'public'],
    default: 'hidden'
  },
  interests: [{
    type: String,
    trim: true
  }],
  publicLink: {
    type: String,
    unique: true,
    sparse: true
  },
  hideReserverName: {
    type: Boolean,
    default: false
  },
  eventDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Wishlist', wishlistSchema);
