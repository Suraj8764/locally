import React from 'react';
import { Pressable, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false, 
  loading = false,
  icon,
  style,
  textStyle
}: ButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  let bgClass = '';
  let textClass = 'text-center font-bold text-[15px]';

  switch (variant) {
    case 'primary':
      bgClass = 'bg-accent';
      textClass += ' text-white';
      break;
    case 'secondary':
      bgClass = 'bg-surface border border-border';
      textClass += ' text-textPrimary';
      break;
    case 'danger':
      bgClass = 'bg-error/10 border border-error/20';
      textClass += ' text-error';
      break;
    case 'ghost':
      bgClass = 'bg-transparent';
      textClass += ' text-accent';
      break;
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center py-[14px] px-4 rounded-xl ${bgClass} ${
        disabled ? 'opacity-50' : ''
      }`}
      style={({ pressed }) => [style, pressed && !disabled && { opacity: 0.8 }]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#E8294C'} />
      ) : (
        <>
          {icon && <React.Fragment>{icon}</React.Fragment>}
          <Text className={`${textClass} ${icon ? 'ml-2' : ''}`} style={textStyle}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
