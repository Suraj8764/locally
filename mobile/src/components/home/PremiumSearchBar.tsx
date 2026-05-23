import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PremiumSearchBarProps {
  placeholder?: string;
  onFilterPress?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
  onClear?: () => void;
}

export function PremiumSearchBar({ 
  placeholder, 
  onFilterPress, 
  value = '', 
  onChangeText,
  onClear 
}: PremiumSearchBarProps) {
  return (
    <View className="px-6 mb-6">
      <LinearGradient
        colors={['rgba(232, 41, 76, 0.08)', 'rgba(139, 92, 246, 0.08)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-row items-center bg-surface border border-border/50 h-14 rounded-2xl px-4"
      >
        <Search size={20} color="#8E8E93" />
        <TextInput
          className="flex-1 ml-3 text-textPrimary text-base font-medium h-full pt-1"
          placeholder={placeholder || "Search services (plumber, electrician...)"}
          placeholderTextColor="#8E8E93"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <Pressable 
            onPress={onClear}
            className="w-8 h-8 items-center justify-center bg-white/5 rounded-lg mr-2"
          >
            <X size={16} color="#8E8E93" />
          </Pressable>
        )}
        <Pressable 
          onPress={onFilterPress}
          className="w-8 h-8 items-center justify-center bg-background/50 rounded-lg"
        >
          <SlidersHorizontal size={18} color="#F5F5F7" />
        </Pressable>
      </LinearGradient>
    </View>
  );
}

import { Text } from 'react-native';
export default PremiumSearchBar;
