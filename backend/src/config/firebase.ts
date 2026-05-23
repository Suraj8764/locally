import * as admin from 'firebase-admin';
import { ENV } from './env';

export function initFirebase() {
  if (!ENV.FIREBASE_PROJECT_ID) {
    console.log('Skipping Firebase init (FIREBASE_PROJECT_ID not set)');
    return;
  }

  try {
    admin.initializeApp({
      projectId: ENV.FIREBASE_PROJECT_ID,
      // Add credential file if you have it: credential: admin.credential.cert(...)
    });
    console.log('Firebase Admin initialized');
  } catch (error) {
    console.error('Firebase Admin init error:', error);
  }
}
