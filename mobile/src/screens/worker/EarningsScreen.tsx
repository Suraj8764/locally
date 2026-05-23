import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';

export function EarningsScreen() {
  return (
    <View className="flex-1 bg-background">
      <View className="pt-14 px-5 pb-6 bg-surface border-b border-border rounded-b-3xl">
        <Text className="text-textSecondary text-sm mb-1 text-center">Total Earnings</Text>
        <Text className="text-5xl font-extrabold text-white text-center">₹0</Text>
        
        <View className="flex-row justify-center gap-4 mt-6">
          <View className="items-center">
            <Text className="text-white font-bold text-lg">0</Text>
            <Text className="text-textSecondary text-xs">Jobs</Text>
          </View>
          <View className="w-[1px] bg-border h-full" />
          <View className="items-center">
            <Text className="text-white font-bold text-lg">0h</Text>
            <Text className="text-textSecondary text-xs">Online</Text>
          </View>
          <View className="w-[1px] bg-border h-full" />
          <View className="items-center">
            <Text className="text-white font-bold text-lg">0%</Text>
            <Text className="text-textSecondary text-xs">Acceptance</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-5">
        <Text className="text-white font-bold text-lg mb-4">Transaction History</Text>
        <EmptyState 
          title="No Earnings Yet" 
          description="Complete your first job to start seeing your earnings here."
        />
      </ScrollView>
    </View>
  );
}
