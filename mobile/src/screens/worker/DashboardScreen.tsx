import React, { useEffect } from 'react';
import { View, Text, ScrollView, Switch, Pressable } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useWorkerStore } from '../../store/workerStore';
import { socketService } from '../../services/socket';
import { api } from '../../api';
import { useWorker } from '../../hooks/useWorkers';
import { Card } from '../../components/ui/Card';
import { IndianRupee, Briefcase, CheckCircle2 } from 'lucide-react-native';

export function DashboardScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { isOnline, setOnline } = useWorkerStore();
  
  const { data: worker } = useWorker(user?.id);

  const toggleOnline = async () => {
    const newValue = !isOnline;
    setOnline(newValue);
    
    try {
      await api.workers.updateStatus(user!.id, newValue);
      if (newValue) {
        socketService.emitWorkerOnline(user!.id);
      } else {
        socketService.emitWorkerOffline(user!.id);
      }
    } catch (e) {
      // Revert on failure
      setOnline(!newValue);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="pt-14 px-5 pb-6 bg-surface border-b border-border rounded-b-3xl">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-textSecondary text-sm mb-1">Welcome back,</Text>
            <Text className="text-2xl font-extrabold text-white">{worker?.displayName || 'Partner'}</Text>
          </View>
          <View className="items-center">
            <Text className="text-textSecondary text-xs mb-2">Duty Status</Text>
            <View className={`flex-row items-center px-3 py-1 rounded-full border ${
              isOnline ? 'bg-onlineGreen/10 border-onlineGreen/30' : 'bg-surface border-border'
            }`}>
              <View className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-onlineGreen' : 'bg-textSecondary'}`} />
              <Text className={`font-bold ${isOnline ? 'text-onlineGreen' : 'text-textSecondary'}`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-background rounded-2xl p-4 flex-row items-center justify-between border border-border">
          <Text className="text-white font-bold text-base">Accepting New Jobs</Text>
          <Switch 
            value={isOnline} 
            onValueChange={toggleOnline} 
            trackColor={{ true: '#30D158' }}
          />
        </View>
      </View>

      <ScrollView className="flex-1 p-5">
        <Text className="text-white font-extrabold text-lg mb-4">Today's Summary</Text>
        
        <View className="flex-row justify-between gap-4 mb-6">
          <Card className="flex-1 items-center py-6 border-accent/30 bg-accent/5">
            <View className="w-12 h-12 rounded-full bg-accent/20 items-center justify-center mb-3">
              <IndianRupee size={24} color="#E8294C" />
            </View>
            <Text className="text-3xl font-extrabold text-white mb-1">₹0</Text>
            <Text className="text-textSecondary text-xs">Earnings</Text>
          </Card>
          
          <Card className="flex-1 items-center py-6">
            <View className="w-12 h-12 rounded-full bg-surface border border-border items-center justify-center mb-3">
              <CheckCircle2 size={24} color="#F5F5F7" />
            </View>
            <Text className="text-3xl font-extrabold text-white mb-1">0</Text>
            <Text className="text-textSecondary text-xs">Jobs Done</Text>
          </Card>
        </View>

        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white font-extrabold text-lg">Active Job</Text>
          <Pressable onPress={() => navigation.navigate('JobsTab')}>
            <Text className="text-accent font-bold">View All</Text>
          </Pressable>
        </View>

        <Card className="items-center justify-center py-10 border-dashed">
          <Briefcase size={32} color="#8E8E93" className="mb-3" />
          <Text className="text-white font-bold mb-1">No active jobs</Text>
          <Text className="text-textSecondary text-center px-6">
            {isOnline ? 'Stay online to receive new booking requests from customers nearby.' : 'Go online to start receiving jobs.'}
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}
