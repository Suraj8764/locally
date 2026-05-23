import React from 'react';
import { View, Text } from 'react-native';
import { MapPin, Navigation } from 'lucide-react-native';
import { Avatar } from '../ui/Avatar';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface LiveTrackingMapProps {
  workerLocation: { lat: number; lng: number };
  customerLocation: { lat: number; lng: number };
  workerName?: string;
  workerImage?: string | null;
}

export function LiveTrackingMap({ workerLocation, customerLocation, workerName, workerImage }: LiveTrackingMapProps) {
  return (
    <Animated.View entering={FadeInUp} className="mb-8 h-64 rounded-[40px] overflow-hidden border border-white/10 shadow-2xl bg-surface items-center justify-center p-6 relative">
      {/* Premium Glassmorphism Background Pattern */}
      <View className="absolute inset-0 opacity-10 bg-radial flex-wrap flex-row gap-4 p-4">
        {Array.from({ length: 64 }).map((_, i) => (
          <View key={i} className="w-2 h-2 rounded-full bg-white" />
        ))}
      </View>
      
      {/* Mock Radar/Tracking Pulse */}
      <View className="w-20 h-20 bg-accent/10 rounded-full items-center justify-center border border-accent/20 mb-4 relative">
        <View className="absolute inset-0 bg-accent/20 rounded-full animate-ping" />
        <Navigation size={32} color="#E8294C" className="rotate-45" />
      </View>
      
      <Text className="text-white font-black text-lg mb-1">Live Tracking Active</Text>
      <Text className="text-textSecondary text-center text-xs px-10">
        GPS tracking is active on mobile devices. {workerName || 'Professional'} is moving towards your location.
      </Text>

      <View className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex-row items-center gap-3">
         <View className="w-2 h-2 bg-onlineGreen rounded-full animate-pulse" />
         <Text className="text-white font-bold text-xs">Worker is heading to your location</Text>
      </View>
    </Animated.View>
  );
}
export default LiveTrackingMap;
