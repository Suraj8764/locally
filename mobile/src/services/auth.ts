import { api } from '../api';

/**
 * Currently a stub for Firebase Phone Auth.
 * When real Firebase is added, this will use auth().signInWithPhoneNumber
 */
export const authService = {
  sendOTP: async (phone: string) => {
    // In dev mode without Firebase, we just simulate sending an OTP
    // and rely on backend's stub behavior
    return await api.auth.sendOTP(phone);
  },

  verifyOTP: async (phone: string, code: string, role: string) => {
    // In dev mode, we verify via our backend stub
    return await api.auth.verifyOTP(phone, code, role);
  }
};
