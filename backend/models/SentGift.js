import mongoose from 'mongoose';

const sentGiftSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverFriendId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Circle',
    required: true
  },
  receiverUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  platform: {
    type: String,
    trim: true
  },
  link: {
    type: String,
    trim: true
  },
  price: {
    type: Number
  },
  images: [{
    type: String
  }],
  privacy: {
    type: String,
    enum: ['public_to_friends', 'private_to_sender'],
    default: 'public_to_friends'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('SentGift', sentGiftSchema);
