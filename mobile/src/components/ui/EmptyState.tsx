import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({ icon, title, description, actionLabel, onAction, style }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-6" style={style}>
      {icon && <View className="mb-4 opacity-80">{icon}</View>}
      <Text className="text-textPrimary text-lg font-bold mb-2 text-center">{title}</Text>
      <Text className="text-textSecondary text-sm text-center mb-6 leading-5">{description}</Text>
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="secondary" />
      )}
    </View>
  );
}
