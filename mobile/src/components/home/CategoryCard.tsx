import React from 'react';
import { Text, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CategoryCardProps {
  id: string;
  name: string;
  icon: string;
  color: string[];
  onPress?: () => void;
}

export function CategoryCard({ name, icon, color, onPress }: CategoryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="items-center mr-5"
    >
      <View className="mb-2">
        <LinearGradient
          colors={color as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-16 h-16 rounded-2xl items-center justify-center shadow-lg shadow-black/40"
          style={{ shadowColor: color[0], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
        >
          <Text className="text-3xl">{icon}</Text>
        </LinearGradient>
      </View>
      <Text className="text-textPrimary text-[12px] font-bold text-center" numberOfLines={1}>
        {name}
      </Text>
    </Pressable>
  );
}
