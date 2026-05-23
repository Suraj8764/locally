import React from 'react';
import { View, Text, Image, ViewStyle } from 'react-native';

interface AvatarProps {
  url?: string;
  name: string;
  size?: number;
  style?: ViewStyle;
}

export function Avatar({ url, name, size = 48, style }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View 
      className="bg-border items-center justify-center overflow-hidden"
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
    >
      {url ? (
        <Image source={{ uri: url }} className="w-full h-full" resizeMode="cover" />
      ) : (
        <Text className="text-textSecondary font-bold" style={{ fontSize: size * 0.4 }}>
          {initials}
        </Text>
      )}
    </View>
  );
}
