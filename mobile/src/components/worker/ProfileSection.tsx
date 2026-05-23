import React from 'react';
import { View, Text } from 'react-native';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ProfileSection({ title, children, className = '' }: ProfileSectionProps) {
  return (
    <View className={`mb-8 ${className}`}>
      <Text className="text-textPrimary font-black text-xl tracking-tight mb-4">{title}</Text>
      <View>
        {children}
      </View>
    </View>
  );
}
