import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export function Card({ children, className = '', style }: CardProps) {
  return (
    <View 
      className={`bg-surface rounded-2xl border border-border p-4 ${className}`}
      style={style}
    >
      {children}
    </View>
  );
}
