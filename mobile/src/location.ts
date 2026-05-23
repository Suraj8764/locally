import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_LOCATION_KEY = 'lastLocation:v1';

export type Coords = { lat: number; lng: number };

export async function getLastKnownLocation(): Promise<Coords | null> {
  const raw = await AsyncStorage.getItem(LAST_LOCATION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { lat: number; lng: number };
    if (typeof parsed.lat !== 'number' || typeof parsed.lng !== 'number') return null;
    return { lat: parsed.lat, lng: parsed.lng };
  } catch {
    return null;
  }
}

export async function setLastKnownLocation(coords: Coords) {
  await AsyncStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(coords));
}

export async function requestAndGetCurrentLocation(): Promise<
  | { status: 'granted'; coords: Coords }
  | { status: 'denied'; lastKnown: Coords | null }
  | { status: 'error'; lastKnown: Coords | null; message: string }
> {
  const lastKnown = await getLastKnownLocation();
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') {
      return { status: 'denied', lastKnown };
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    await setLastKnownLocation(coords);
    return { status: 'granted', coords };
  } catch (e) {
    return { status: 'error', lastKnown, message: e instanceof Error ? e.message : 'unknown error' };
  }
}
