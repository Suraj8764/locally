import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: Number(process.env.PORT || 5001),
  USE_DB: process.env.USE_DB === 'true',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/locally_db',
  JWT_SECRET: process.env.JWT_SECRET || 'locally_dev_secret',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
};
