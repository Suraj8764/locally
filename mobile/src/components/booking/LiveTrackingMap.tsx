import React from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin } from 'lucide-react-native';
import { Avatar } from '../ui/Avatar';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface LiveTrackingMapProps {
  workerLocation: { lat: number; lng: number };
  customerLocation: { lat: number; lng: number };
  workerName?: string;
  workerImage?: string | null;
}

const DARK_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
  { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];

export function LiveTrackingMap({ workerLocation, customerLocation, workerName, workerImage }: LiveTrackingMapProps) {
  return (
    <Animated.View entering={FadeInUp} className="mb-8 h-64 rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
      <MapView
        provider={PROVIDER_GOOGLE}
        className="flex-1"
        initialRegion={{
          latitude: workerLocation.lat,
          longitude: workerLocation.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        customMapStyle={DARK_MAP_STYLE}
      >
        <Marker 
          coordinate={{ latitude: workerLocation.lat, longitude: workerLocation.lng }}
          title="Professional"
        >
          <View className="w-10 h-10 bg-accent rounded-2xl items-center justify-center border-2 border-white">
            <Avatar url={workerImage || undefined} name={workerName || 'Professional'} size={32} />
          </View>
        </Marker>
        <Marker 
          coordinate={{ latitude: customerLocation.lat, longitude: customerLocation.lng }}
          title="Your Location"
        >
          <View className="w-10 h-10 bg-white rounded-2xl items-center justify-center border-2 border-accent">
             <MapPin size={20} color="#E8294C" />
          </View>
        </Marker>
      </MapView>
      <View className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex-row items-center gap-3">
         <View className="w-2 h-2 bg-onlineGreen rounded-full animate-pulse" />
         <Text className="text-white font-bold text-xs">Worker is heading to your location</Text>
      </View>
    </Animated.View>
  );
}
export default LiveTrackingMap;
