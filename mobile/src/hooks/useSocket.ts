import { useEffect } from 'react';
import { socketService } from '../services/socket';
import { useAuthStore } from '../store/authStore';

export function useSocket() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? socketService.getSocket() : null;
}

export function useSocketEvent<T>(eventName: string, callback: (data: T) => void) {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [eventName, callback, isAuthenticated]);
}
