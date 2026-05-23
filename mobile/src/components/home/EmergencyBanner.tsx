import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertTriangle, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface EmergencyBannerProps {
  onPress?: () => void;
}

export function EmergencyBanner({ onPress }: EmergencyBannerProps) {
  return (
    <View className="px-6 mb-8">
      <Pressable onPress={onPress}>
        <LinearGradient
          colors={['#FF453A', '#E8294C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="rounded-3xl p-5 flex-row items-center justify-between shadow-xl shadow-error/40"
        >
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center mr-4">
              <AlertTriangle size={26} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-black text-xl tracking-tight">SOS EMERGENCY</Text>
              <Text className="text-white/80 text-xs font-medium uppercase tracking-wider">
                Help arrives in under 15 mins
              </Text>
            </View>
          </View>
          <View className="bg-white/20 p-2 rounded-full">
            <ChevronRight size={20} color="#FFFFFF" strokeWidth={3} />
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );
}
