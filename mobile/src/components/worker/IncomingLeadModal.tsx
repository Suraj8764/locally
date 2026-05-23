import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { useBookingStore } from '../../store/bookingStore';
import { socketService } from '../../services/socket';
import { MapPin, Clock, X, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, withRepeat, withSequence, withTiming, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { useNavigation } from '@react-navigation/native';

export function IncomingLeadModal() {
  const navigation = useNavigation<any>();
  const { pendingRequests, removePendingRequest } = useBookingStore();
  const currentLead = pendingRequests[0];
  const [timer, setTimer] = useState(60);

  const pulse = useSharedValue(1);

  useEffect(() => {
    if (currentLead) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );

      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            removePendingRequest(currentLead.bookingId);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentLead]);

  if (!currentLead) return null;

  const handleAccept = () => {
    socketService.emitBookingAccept({
      bookingId: currentLead.bookingId,
      workerId: 'current-worker-id', // This should come from authStore
      customerId: currentLead.customerId,
    });
    removePendingRequest(currentLead.bookingId);
    navigation.navigate('ActiveJob', { booking: currentLead });
  };

  const handleDecline = () => {
    removePendingRequest(currentLead.bookingId);
  };

  return (
    <Modal transparent visible={!!currentLead} animationType="fade">
      <View className="flex-1 bg-background/80 backdrop-blur-md justify-center px-6">
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          className="bg-surface border border-white/10 rounded-[40px] p-8 shadow-2xl shadow-black"
        >
          {/* Pulse Header */}
          <View className="items-center mb-8">
            <Animated.View
              style={useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }))}
              className="w-24 h-24 bg-accent/20 rounded-full items-center justify-center border border-accent/30"
            >
              <LinearGradient
                colors={['#E8294C', '#FF453A']}
                className="w-16 h-16 rounded-[24px] items-center justify-center shadow-lg shadow-accent"
              >
                <Clock size={32} color="#FFF" />
              </LinearGradient>
            </Animated.View>
            <Text className="text-accent font-black text-xs uppercase tracking-[4px] mt-6">New Service Lead</Text>
            <Text className="text-white text-3xl font-black text-center mt-2 capitalize">{currentLead.categoryId}</Text>
          </View>

          {/* Details */}
          <View className="bg-background/50 rounded-3xl p-6 mb-8 border border-white/5">
            <View className="flex-row items-center gap-4 mb-4">
              <View className="w-10 h-10 bg-white/5 rounded-2xl items-center justify-center">
                <MapPin size={20} color="#8E8E93" />
              </View>
              <View className="flex-1">
                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest">Location</Text>
                <Text className="text-white font-bold text-sm" numberOfLines={1}>Approx. 2.4 km away</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 bg-white/5 rounded-2xl items-center justify-center">
                <Text className="text-lg">💰</Text>
              </View>
              <View className="flex-1">
                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest">Estimated Earning</Text>
                <Text className="text-onlineGreen font-black text-xl">₹450 - ₹600</Text>
              </View>
            </View>
          </View>

          {/* Timer Bar */}
          <View className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-8">
            <View
              className="h-full bg-accent"
              style={{ width: `${(timer / 60) * 100}%` }}
            />
          </View>

          {/* Actions */}
          <View className="flex-row gap-4">
            <Pressable
              onPress={handleDecline}
              className="flex-1 h-16 bg-white/5 border border-white/10 rounded-3xl items-center justify-center"
            >
              <X size={24} color="#8E8E93" />
            </Pressable>

            <Pressable
              onPress={handleAccept}
              className="flex-[3]"
            >
              <LinearGradient
                colors={['#30D158', '#28CD41']}
                className="h-16 rounded-3xl items-center justify-center flex-row gap-3 shadow-lg shadow-onlineGreen/20"
              >
                <Check size={24} color="#FFF" />
                <Text className="text-white font-black text-lg uppercase tracking-widest">Accept Job</Text>
              </LinearGradient>
            </Pressable>
          </View>

          <Text className="text-textSecondary text-center mt-6 text-[10px] font-bold uppercase tracking-widest">
            Expiring in {timer} seconds
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}
