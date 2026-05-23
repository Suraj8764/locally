import { useState, useEffect } from 'react';
import { socketService } from '../services/socket';

export function useWorkerTracking(bookingId: string) {
  const [workerLocation, setWorkerLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket || !bookingId) return;

    const onLocationChanged = (data: any) => {
      if (data.bookingId === bookingId) {
        setWorkerLocation(data.location);
      }
    };

    socket.on('worker:location-changed', onLocationChanged);

    return () => {
      socket.off('worker:location-changed', onLocationChanged);
    };
  }, [bookingId]);

  return workerLocation;
}
