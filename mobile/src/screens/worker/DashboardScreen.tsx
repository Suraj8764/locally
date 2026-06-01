import React, { useEffect, useState } from 'react';
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
  const [isToggling, setIsToggling] = useState(false);
  const [workerStatus, setWorkerStatus] = useState<'available' | 'busy' | 'offline'>('offline');

  const toggleStatus = async (newStatus: 'available' | 'busy' | 'offline') => {
    if (isToggling) return;
    
    setIsToggling(true);
    setWorkerStatus(newStatus);
    setOnline(newStatus !== 'offline');
    
    try {
      if (!user?.id) {
        console.error('Worker ID not available');
        setWorkerStatus(workerStatus);
        setOnline(!newStatus);
        setIsToggling(false);
        return;
      }
      
      // If it's a mock worker ID, just update local state without API call
      if (user.id.startsWith('mock_')) {
        console.log('Mock worker - updating local status to:', newStatus);
        if (newStatus !== 'offline') {
          socketService.emitWorkerOnline(user.id);
        } else {
          socketService.emitWorkerOffline(user.id);
        }
        setIsToggling(false);
        return;
      }
      
      await api.workers.updateStatus(user.id, newStatus);
      if (newStatus !== 'offline') {
        socketService.emitWorkerOnline(user.id);
      } else {
        socketService.emitWorkerOffline(user.id);
      }
    } catch (e) {
      console.error('Failed to update worker status:', e);
      // Revert on failure
      setWorkerStatus(workerStatus);
      setOnline(!newStatus);
    } finally {
      setIsToggling(false);
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
              workerStatus === 'available' ? 'bg-onlineGreen/10 border-onlineGreen/30' : 
              workerStatus === 'busy' ? 'bg-yellow-500/10 border-yellow-500/30' : 
              'bg-surface border-border'
            }`}>
              <View className={`w-2 h-2 rounded-full mr-2 ${
                workerStatus === 'available' ? 'bg-onlineGreen' : 
                workerStatus === 'busy' ? 'bg-yellow-500' : 
                'bg-textSecondary'
              }`} />
              <Text className={`font-bold ${
                workerStatus === 'available' ? 'text-onlineGreen' : 
                workerStatus === 'busy' ? 'text-yellow-500' : 
                'text-textSecondary'
              }`}>
                {workerStatus.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-background rounded-2xl p-4 border border-border mb-4">
          <Text className="text-white font-bold text-base mb-3">Set Your Status</Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => toggleStatus('available')}
              disabled={isToggling}
              className={`flex-1 py-3 px-4 rounded-xl border ${
                workerStatus === 'available' 
                  ? 'bg-onlineGreen border-onlineGreen' 
                  : 'bg-surface border-border'
              }`}
            >
              <Text className={`text-center font-bold ${
                workerStatus === 'available' ? 'text-white' : 'text-textSecondary'
              }`}>Available</Text>
            </Pressable>
            <Pressable
              onPress={() => toggleStatus('busy')}
              disabled={isToggling}
              className={`flex-1 py-3 px-4 rounded-xl border ${
                workerStatus === 'busy' 
                  ? 'bg-yellow-500 border-yellow-500' 
                  : 'bg-surface border-border'
              }`}
            >
              <Text className={`text-center font-bold ${
                workerStatus === 'busy' ? 'text-white' : 'text-textSecondary'
              }`}>Busy</Text>
            </Pressable>
            <Pressable
              onPress={() => toggleStatus('offline')}
              disabled={isToggling}
              className={`flex-1 py-3 px-4 rounded-xl border ${
                workerStatus === 'offline' 
                  ? 'bg-surface border-border' 
                  : 'bg-surface border-border'
              }`}
            >
              <Text className={`text-center font-bold ${
                workerStatus === 'offline' ? 'text-textSecondary' : 'text-textSecondary'
              }`}>Offline</Text>
            </Pressable>
          </View>
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
