import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'location'],
    default: 'text',
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export const Message = mongoose.model('Message', messageSchema);
