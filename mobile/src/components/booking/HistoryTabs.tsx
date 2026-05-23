import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface HistoryTabsProps {
  activeTab: 'active' | 'past';
  onTabChange: (tab: 'active' | 'past') => void;
}

export function HistoryTabs({ activeTab, onTabChange }: HistoryTabsProps) {
  return (
    <View className="flex-row bg-surface border border-white/5 p-1.5 rounded-[24px] mb-6">
      <Pressable 
        onPress={() => onTabChange('active')}
        className={`flex-1 py-3 items-center rounded-[20px] ${activeTab === 'active' ? 'bg-background' : ''}`}
      >
        {activeTab === 'active' && (
          <LinearGradient
            colors={['#E8294C', '#FF453A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="absolute inset-0 rounded-[20px] opacity-10"
          />
        )}
        <Text className={`font-black uppercase tracking-widest text-xs ${activeTab === 'active' ? 'text-accent' : 'text-textSecondary'}`}>
          Active
        </Text>
      </Pressable>

      <Pressable 
        onPress={() => onTabChange('past')}
        className={`flex-1 py-3 items-center rounded-[20px] ${activeTab === 'past' ? 'bg-background' : ''}`}
      >
        {activeTab === 'past' && (
          <LinearGradient
            colors={['#E8294C', '#FF453A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="absolute inset-0 rounded-[20px] opacity-10"
          />
        )}
        <Text className={`font-black uppercase tracking-widest text-xs ${activeTab === 'past' ? 'text-accent' : 'text-textSecondary'}`}>
          History
        </Text>
      </Pressable>
    </View>
  );
}
