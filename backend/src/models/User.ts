import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phoneE164: { type: String, required: true, unique: true },
  displayName: { type: String },
  profileImage: { type: String },
  savedAddresses: [{
    label: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    }
  }],
  createdAtMs: { type: Number, default: () => Date.now() },
});

export const User = mongoose.model('User', userSchema);
