import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { ChevronRight, Settings, LogOut, FileText, HelpCircle } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useWorker } from '../../hooks/useWorkers';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';

export function WorkerProfileScreen() {
  const { user, logout } = useAuthStore();
  const { data: worker } = useWorker(user?.id);

  return (
    <View className="flex-1 bg-background">
      <View className="pt-14 px-4 pb-6 bg-surface border-b border-border">
        <Text className="text-2xl font-extrabold text-white mb-6">Partner Profile</Text>
        <View className="flex-row items-center">
          <Avatar url={worker?.profileImage} name={worker?.displayName || 'Worker'} size={64} />
          <View className="ml-4 flex-1">
            <Text className="text-xl font-bold text-white mb-1">{worker?.displayName || 'Worker'}</Text>
            <Text className="text-accent text-sm font-bold">{worker?.categoryId?.toUpperCase()}</Text>
            <Text className="text-textSecondary mt-1 text-xs">{worker?.phoneE164}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <Text className="text-textSecondary font-bold uppercase tracking-wider text-xs mb-3 ml-2">
          Account Settings
        </Text>
        <View className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
          <Pressable className="flex-row items-center p-4 border-b border-border">
            <FileText size={20} color="#8E8E93" />
            <Text className="text-white flex-1 ml-3 font-bold">Personal Details</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
          <Pressable className="flex-row items-center p-4 border-b border-border">
            <Settings size={20} color="#8E8E93" />
            <Text className="text-white flex-1 ml-3 font-bold">Service Preferences</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
          <Pressable className="flex-row items-center p-4 border-b border-border">
            <Text className="text-xl w-5 items-center justify-center text-center">🏦</Text>
            <Text className="text-white flex-1 ml-3 font-bold">Bank Details</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
        </View>

        <Text className="text-textSecondary font-bold uppercase tracking-wider text-xs mb-3 ml-2">
          Support
        </Text>
        <View className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
          <Pressable className="flex-row items-center p-4 border-b border-border">
            <HelpCircle size={20} color="#8E8E93" />
            <Text className="text-white flex-1 ml-3 font-bold">Partner Support</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
        </View>

        <Pressable 
          onPress={logout}
          className="bg-error/10 border border-error/30 flex-row items-center justify-center p-4 rounded-2xl mb-10"
        >
          <LogOut size={20} color="#FF453A" />
          <Text className="text-error font-bold ml-2">Log Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
