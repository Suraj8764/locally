import mongoose from 'mongoose';
import { ENV } from './env';

export async function connectDB() {
  if (!ENV.USE_DB) {
    console.log('Skipping MongoDB connection (USE_DB=false)');
    return;
  }

  if (!ENV.MONGODB_URI) {
    console.warn('MONGODB_URI is not set, skipping DB connection.');
    return;
  }

  try {
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}
