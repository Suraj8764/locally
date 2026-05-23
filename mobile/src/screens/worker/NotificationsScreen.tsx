import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { EmptyState } from '../../components/ui/EmptyState';

export function NotificationsScreen() {
  return (
    <View className="flex-1 bg-background">
      <View className="pt-14 px-5 pb-4 border-b border-border bg-surface">
        <Text className="text-2xl font-extrabold text-white">Notifications</Text>
      </View>

      <ScrollView className="flex-1 p-5">
        <EmptyState 
          title="All Caught Up" 
          description="You don't have any new notifications."
        />
      </ScrollView>
    </View>
  );
}
