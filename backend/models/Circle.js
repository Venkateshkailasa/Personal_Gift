import mongoose from 'mongoose';

const circleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  relationship: {
    type: String,
    enum: ['family', 'friend', 'colleague', 'other'],
    default: 'friend'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'accepted'
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  requestMessage: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
circleSchema.index({ user: 1, name: 1 });
circleSchema.index({ user: 1, birthday: 1 });

export default mongoose.model('Circle', circleSchema);