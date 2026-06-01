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

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    // Using Google Maps Geocoding API
    // Note: Requires GOOGLE_MAPS_API_KEY in environment variables
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
    
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found, falling back to OpenStreetMap');
      // Fallback to OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SebaLink/1.0 (hyperlocal-worker-app)',
          },
        }
      );
      
      if (!response.ok) {
        console.error('Geocoding API error:', response.status);
        return getLocationNameFromCoords(lat, lng);
      }
      
      const data = await response.json();
      
      console.log('OpenStreetMap reverse geocoding response:', data);
      
      if (data.address) {
        const { city, town, village, county, state, country, state_district, district } = data.address;
        // Try multiple fields for locality
        const locality = city || town || village || district || state_district || county || '';
        const region = state || country || '';
        const locationParts = [locality, region].filter(Boolean);
        const result = locationParts.length > 0 ? locationParts.join(', ') : data.display_name || 'Location detected';
        console.log('OpenStreetMap geocoded location:', result);
        return result;
      }
      
      // If no address but we have display_name, use it
      if (data.display_name) {
        console.log('Using display_name:', data.display_name);
        // Extract meaningful parts from display_name
        const parts = data.display_name.split(',').map((p: string) => p.trim()).slice(0, 3);
        return parts.join(', ');
      }
      
      console.log('No address found in response');
      return getLocationNameFromCoords(lat, lng);
    }
    
    // Use Google Maps Geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) {
      console.error('Google Maps Geocoding API error:', response.status);
      return getLocationNameFromCoords(lat, lng);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const addressComponents = result.address_components;
      
      // Extract city, state, country from address components
      let city = '';
      let state = '';
      let country = '';
      
      for (const component of addressComponents) {
        if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
          city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (component.types.includes('country')) {
          country = component.long_name;
        }
      }
      
      const locationParts = [city, state, country].filter(Boolean);
      const locationName = locationParts.length > 0 ? locationParts.join(', ') : result.formatted_address;
      console.log('Google Maps geocoded location:', locationName);
      return locationName;
    }
    
    console.log('No results from Google Maps Geocoding API');
    return getLocationNameFromCoords(lat, lng);
  } catch (e) {
    console.error('Reverse geocoding error:', e);
    return getLocationNameFromCoords(lat, lng);
  }
}

export function getLocationNameFromCoords(lat: number, lng: number): string {
  // Simple fallback based on approximate coordinates for Odisha, India
  // This is a basic approximation for the MVP
  if (lat > 20 && lat < 22 && lng > 85 && lng < 88) {
    return 'Odisha, India';
  }
  return 'Location detected';
}

export async function requestAndGetCurrentLocation(): Promise<
  | { status: 'granted'; coords: Coords; locationName?: string }
  | { status: 'denied'; lastKnown: Coords | null; locationName?: string }
  | { status: 'error'; lastKnown: Coords | null; message: string; locationName?: string }
> {
  const lastKnown = await getLastKnownLocation();
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') {
      const locationName = lastKnown ? await reverseGeocode(lastKnown.lat, lastKnown.lng) : undefined;
      return { status: 'denied', lastKnown, locationName };
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    await setLastKnownLocation(coords);
    
    const locationName = await reverseGeocode(coords.lat, coords.lng);
    return { status: 'granted', coords, locationName };
  } catch (e) {
    const locationName = lastKnown ? await reverseGeocode(lastKnown.lat, lastKnown.lng) : undefined;
    return { status: 'error', lastKnown, message: e instanceof Error ? e.message : 'unknown error', locationName };
  }
}
