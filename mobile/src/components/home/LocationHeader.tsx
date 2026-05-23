import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MapPin, User } from 'lucide-react-native';

interface LocationHeaderProps {
  locationName: string;
  onProfilePress?: () => void;
  onLocationPress?: () => void;
}

export function LocationHeader({ locationName, onProfilePress, onLocationPress }: LocationHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-6 pt-2 pb-4">
      <Pressable onPress={onLocationPress} className="flex-1 mr-4">
        <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-[2px] mb-0.5">
          Your Location
        </Text>
        <View className="flex-row items-center">
          <MapPin size={16} color="#E8294C" strokeWidth={2.5} />
          <Text className="text-textPrimary font-bold ml-1.5 text-base" numberOfLines={1}>
            {locationName}
          </Text>
        </View>
      </Pressable>
      
      <Pressable 
        onPress={onProfilePress}
        className="w-11 h-11 bg-surface border border-border rounded-2xl items-center justify-center overflow-hidden shadow-lg shadow-black/40"
      >
        <User size={22} color="#F5F5F7" />
      </Pressable>
    </View>
  );
}
