import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'granted' | 'denied' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setStatus('loading');
    setError(null);
    try {
      const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
      if (permStatus !== 'granted') {
        setStatus('denied');
        setError('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCoords({ lat: location.coords.latitude, lng: location.coords.longitude });
      setStatus('granted');
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Failed to get location');
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { coords, setCoords, status, error, refresh };
}
