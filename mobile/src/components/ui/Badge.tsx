import React from 'react';
import { View, Text, ViewStyle } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', icon, style }: BadgeProps) {
  let bgClass = '';
  let textClass = 'text-[11px] font-bold';

  switch (variant) {
    case 'default':
      bgClass = 'bg-border';
      textClass += ' text-textPrimary';
      break;
    case 'success':
      bgClass = 'bg-onlineGreen/10';
      textClass += ' text-onlineGreen';
      break;
    case 'warning':
      bgClass = 'bg-warning/10';
      textClass += ' text-warning';
      break;
    case 'error':
      bgClass = 'bg-error/10';
      textClass += ' text-error';
      break;
    case 'outline':
      bgClass = 'bg-transparent border border-border';
      textClass += ' text-textSecondary';
      break;
  }

  return (
    <View 
      className={`flex-row items-center px-2 py-1 rounded-full ${bgClass}`}
      style={style}
    >
      {icon && <View className="mr-1">{icon}</View>}
      <Text className={textClass}>{label}</Text>
    </View>
  );
}
