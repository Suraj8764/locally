import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { socketService } from '../services/socket';

export function useLocationTracking(isActive: boolean, bookingId: string, customerId: string) {
  const watchId = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function startTracking() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      watchId.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10, // Update every 10 meters
          timeInterval: 5000,   // Or every 5 seconds
        },
        (location) => {
          if (!isMounted) return;
          
          socketService.emitWorkerLocationUpdate({
            bookingId,
            customerId,
            location: {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            },
          });
        }
      );
    }

    if (isActive && bookingId && customerId) {
      startTracking();
    } else {
      if (watchId.current) {
        watchId.current.remove();
        watchId.current = null;
      }
    }

    return () => {
      isMounted = false;
      if (watchId.current) {
        watchId.current.remove();
        watchId.current = null;
      }
    };
  }, [isActive, bookingId, customerId]);
}
