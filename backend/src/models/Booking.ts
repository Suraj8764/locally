import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  workerId: { type: String, required: true },
  categoryId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'cancelled_by_customer', 'cancelled_by_worker'],
    default: 'pending' 
  },
  createdAtMs: { type: Number, default: () => Date.now() },
  scheduledAtMs: { type: Number },
  address: { type: String, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  problemDescription: { type: String },
  issueImageUrl: { type: String },
  isEmergency: { type: Boolean, default: false },
  estimatedPrice: { type: Number },
  finalPrice: { type: Number },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'razorpay'] },
  paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
});

export const Booking = mongoose.model('Booking', bookingSchema);
