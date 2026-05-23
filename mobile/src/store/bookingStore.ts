import { create } from 'zustand';
import { Booking, BookingStatus } from '../types';

interface BookingState {
  activeBooking: Booking | null;
  pendingRequests: any[];
  setActiveBooking: (booking: Booking | null) => void;
  addPendingRequest: (request: any) => void;
  removePendingRequest: (bookingId: string) => void;
  updateBookingStatus: (status: BookingStatus) => void;
  clearState: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  activeBooking: null,
  pendingRequests: [],

  setActiveBooking: (booking) => set({ activeBooking: booking }),

  addPendingRequest: (request) => set((state) => ({
    pendingRequests: [request, ...state.pendingRequests.filter(r => r.bookingId !== request.bookingId)]
  })),

  removePendingRequest: (bookingId) => set((state) => ({
    pendingRequests: state.pendingRequests.filter(r => r.bookingId !== bookingId)
  })),

  updateBookingStatus: (status) => set((state) => ({
    activeBooking: state.activeBooking ? { ...state.activeBooking, status } : null
  })),

  clearState: () => set({ activeBooking: null, pendingRequests: [] }),
}));
