import React, { useEffect } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { MapPin, AlertTriangle } from 'lucide-react-native';
import { useUpdateBookingStatus } from '../../hooks/useBooking';
import { Booking } from '../../types';

interface PopupProps {
  booking: Booking | null;
  visible: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingRequestPopup({ booking, visible, onAccept, onReject }: PopupProps) {
  const { mutate: updateStatus } = useUpdateBookingStatus();
  const progress = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      progress.value = 1;
      progress.value = withTiming(0, { duration: 30000, easing: Easing.linear });
      
      const timeout = setTimeout(() => {
        handleReject();
      }, 30000);
      
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`
  }));

  const handleAccept = () => {
    if (booking) {
      updateStatus({ id: booking.id, status: 'accepted' });
      onAccept();
    }
  };

  const handleReject = () => {
    if (booking) {
      updateStatus({ id: booking.id, status: 'cancelled_by_worker' });
      onReject();
    }
  };

  if (!booking) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/60 justify-end p-4">
        <View className={`rounded-3xl border overflow-hidden ${
          booking.isEmergency ? 'bg-surface border-error border-2 shadow-lg shadow-error/50' : 'bg-surface border-border'
        }`}>
          {booking.isEmergency && (
            <View className="bg-error px-4 py-2 flex-row items-center justify-center">
              <AlertTriangle size={16} color="#FFF" />
              <Text className="text-white font-bold ml-2">EMERGENCY REQUEST</Text>
            </View>
          )}
          
          <View className="p-6">
            <View className="items-center mb-6">
              <Text className="text-accent text-3xl font-extrabold mb-1">
                ₹{booking.estimatedPrice || '149+'}
              </Text>
              <Text className="text-textSecondary text-sm">Estimated Earning</Text>
            </View>

            <View className="bg-background rounded-xl p-4 border border-border mb-6">
              <View className="flex-row justify-between mb-3 border-b border-border pb-3">
                <Text className="text-textSecondary">Service</Text>
                <Text className="text-white font-bold">{booking.categoryId.toUpperCase()}</Text>
              </View>
              <View className="flex-row justify-between mb-3 border-b border-border pb-3">
                <Text className="text-textSecondary">Distance</Text>
                <Text className="text-white font-bold">~2.5 km</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-textSecondary">Address</Text>
                <Text className="text-white font-bold flex-1 text-right ml-4" numberOfLines={2}>
                  {booking.address}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-4">
              <Pressable 
                onPress={handleReject}
                className="flex-1 py-4 items-center justify-center rounded-xl bg-background border border-border"
              >
                <Text className="text-textPrimary font-bold text-lg">Reject</Text>
              </Pressable>
              
              <Pressable 
                onPress={handleAccept}
                className={`flex-[2] py-4 items-center justify-center rounded-xl ${
                  booking.isEmergency ? 'bg-error' : 'bg-accent'
                }`}
              >
                <Text className="text-white font-bold text-lg">Accept Job</Text>
              </Pressable>
            </View>
          </View>
          
          <View className="h-2 bg-background w-full">
            <Animated.View 
              className={`h-full ${booking.isEmergency ? 'bg-error' : 'bg-accent'}`} 
              style={animatedStyle} 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
