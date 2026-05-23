import { useEffect } from 'react';
import { socketService } from '../services/socket';
import { useBookingStore } from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';
import * as Haptics from 'expo-haptics';

export function useRealtimeBooking() {
  const { user, role, isAuthenticated } = useAuthStore();
  const { 
    setActiveBooking, 
    updateBookingStatus, 
    addPendingRequest, 
    removePendingRequest 
  } = useBookingStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    // CUSTOMER EVENTS
    const onBookingAccepted = (data: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      updateBookingStatus('accepted');
      // You could also refetch booking details here to get the worker info
    };

    const onBookingStatusChanged = (data: any) => {
      updateBookingStatus(data.status);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    // WORKER EVENTS
    const onNewRequest = (data: any) => {
      if (role === 'worker') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        addPendingRequest(data);
      }
    };

    socket.on('booking:accepted', onBookingAccepted);
    socket.on('booking:status-changed', onBookingStatusChanged);
    socket.on('booking:new-request', onNewRequest);

    return () => {
      socket.off('booking:accepted', onBookingAccepted);
      socket.off('booking:status-changed', onBookingStatusChanged);
      socket.off('booking:new-request', onNewRequest);
    };
  }, [isAuthenticated, role, updateBookingStatus, addPendingRequest]);
}
