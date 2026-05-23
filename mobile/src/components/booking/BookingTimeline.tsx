import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle2, Clock, Truck, Wrench, Flag, XCircle } from 'lucide-react-native';
import { BookingStatus } from '../../types';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface TimelineProps {
  status: BookingStatus;
}

const steps = [
  { id: 'pending', label: 'Booking Request Sent', desc: 'Awaiting professional confirmation', icon: Clock },
  { id: 'accepted', label: 'Professional Assigned', desc: 'Your request has been accepted', icon: CheckCircle2 },
  { id: 'on_the_way', label: 'On The Way', desc: 'Professional is heading to your location', icon: Truck },
  { id: 'started', label: 'Work Started', desc: 'Service is currently in progress', icon: Wrench },
  { id: 'completed', label: 'Booking Completed', desc: 'Service finished and paid', icon: Flag },
];

export function BookingTimeline({ status }: TimelineProps) {
  const isCancelled = status.startsWith('cancelled');
  
  if (isCancelled) {
    return (
      <View className="bg-error/5 p-6 rounded-3xl border border-error/10 flex-row items-center gap-4">
        <View className="w-12 h-12 bg-error/10 rounded-2xl items-center justify-center">
          <XCircle size={24} color="#FF453A" />
        </View>
        <View className="flex-1">
          <Text className="text-error font-black text-lg">Booking Cancelled</Text>
          <Text className="text-error/70 text-xs font-bold uppercase tracking-widest mt-0.5">
            {status === 'cancelled_by_customer' ? 'Cancelled by you' : 'Cancelled by professional'}
          </Text>
        </View>
      </View>
    );
  }

  const currentIndex = steps.findIndex(s => s.id === status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <View className="px-2">
      {steps.map((step, index) => {
        const isActive = index <= activeIndex;
        const isCurrent = index === activeIndex;
        const isLast = index === steps.length - 1;
        const Icon = step.icon;

        return (
          <View key={step.id} className="flex-row">
            <View className="items-center mr-5">
              <View className={`w-10 h-10 rounded-2xl items-center justify-center ${
                isCurrent ? 'bg-accent shadow-lg shadow-accent/40' : 
                isActive ? 'bg-surface border border-accent/30' : 'bg-surface border border-white/5'
              }`}>
                <Icon size={18} color={isActive ? '#FFF' : '#8E8E93'} strokeWidth={isCurrent ? 3 : 2} />
              </View>
              {!isLast && (
                <View className={`w-[2px] h-12 ${
                  index < activeIndex ? 'bg-accent' : 'bg-white/5'
                }`} />
              )}
            </View>
            <View className="justify-center h-10 flex-1">
              <Animated.View entering={FadeInRight.delay(index * 100)}>
                <Text className={`font-black text-sm ${isActive ? 'text-white' : 'text-textSecondary'}`}>
                  {step.label}
                </Text>
                {isActive && (
                  <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-wider mt-0.5">
                    {step.desc}
                  </Text>
                )}
              </Animated.View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

