import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { User, Briefcase } from 'lucide-react-native';

export function RoleSelectScreen({ navigation }: any) {
  return (
    <View className="flex-1 bg-background px-6 pt-20 pb-10">
      <View className="mb-10">
        <Text className="text-3xl font-extrabold text-white mb-2">Who are you?</Text>
        <Text className="text-textSecondary text-base">Select your role to continue</Text>
      </View>

      <View className="flex-1 gap-6">
        <Pressable 
          className="flex-1 bg-surface border border-border rounded-3xl p-6 items-center justify-center relative overflow-hidden"
          style={({ pressed }) => [pressed && { opacity: 0.8 }]}
          onPress={() => navigation.navigate('Login', { role: 'customer' })}
        >
          <View className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-10 -mt-10 blur-xl" />
          <View className="w-20 h-20 bg-accent/20 rounded-full items-center justify-center mb-6">
            <User size={36} color="#E8294C" />
          </View>
          <Text className="text-2xl font-bold text-white mb-2">Customer</Text>
          <Text className="text-textSecondary text-center px-4">I want to book local services and find trusted professionals</Text>
        </Pressable>

        <Pressable 
          className="flex-1 bg-surface border border-border rounded-3xl p-6 items-center justify-center relative overflow-hidden"
          style={({ pressed }) => [pressed && { opacity: 0.8 }]}
          onPress={() => navigation.navigate('Login', { role: 'worker' })}
        >
          <View className="absolute top-0 right-0 w-32 h-32 bg-accentSecondary/10 rounded-full -mr-10 -mt-10 blur-xl" />
          <View className="w-20 h-20 bg-accentSecondary/20 rounded-full items-center justify-center mb-6">
            <Briefcase size={36} color="#8B5CF6" />
          </View>
          <Text className="text-2xl font-bold text-white mb-2">Worker</Text>
          <Text className="text-textSecondary text-center px-4">I want to provide services and earn money</Text>
        </Pressable>
      </View>
    </View>
  );
}
