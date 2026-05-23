import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronRight, Calendar, MapPin, Star } from 'lucide-react-native';
import { Avatar } from '../ui/Avatar';
import { format } from 'date-fns';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface BookingHistoryCardProps {
  booking: any;
  onPress: () => void;
  index: number;
}

export function BookingHistoryCard({ booking, onPress, index }: BookingHistoryCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': return { label: 'Completed', color: '#30D158', bg: 'bg-onlineGreen/10' };
      case 'pending': return { label: 'Awaiting Pro', color: '#FF9F0A', bg: 'bg-warning/10' };
      case 'accepted': return { label: 'Pro Assigned', color: '#0A84FF', bg: 'bg-blue-500/10' };
      case 'on_the_way': return { label: 'On The Way', color: '#0A84FF', bg: 'bg-blue-500/10' };
      case 'started': return { label: 'In Progress', color: '#FF9F0A', bg: 'bg-warning/10' };
      default: return { label: 'Cancelled', color: '#FF453A', bg: 'bg-error/10' };
    }
  };

  const config = getStatusConfig(booking.status);

  return (
    <Animated.View entering={FadeInRight.delay(index * 100)}>
      <Pressable 
        onPress={onPress}
        className="bg-surface border border-white/5 rounded-[32px] p-5 mb-4 shadow-xl shadow-black/20"
      >
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-row items-center gap-3">
             <View className="w-10 h-10 bg-background rounded-2xl items-center justify-center">
                <Text className="text-lg">🔧</Text>
             </View>
             <View>
                <Text className="text-white font-black text-lg capitalize">{booking.categoryId}</Text>
                <View className="flex-row items-center gap-1">
                   <Calendar size={10} color="#8E8E93" />
                   <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest">
                     {format(new Date(booking.createdAtMs), 'MMM dd, hh:mm a')}
                   </Text>
                </View>
             </View>
          </View>
          <View className={`${config.bg} px-3 py-1.5 rounded-full border border-white/5`}>
            <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: config.color }}>
              {config.label}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-3 mb-4">
           <Avatar 
             url={booking.worker?.profileImage} 
             name={booking.worker?.displayName || '?'} 
             size={32} 
           />
           <View className="flex-1">
              <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-wider">Professional</Text>
              <Text className="text-white font-bold text-sm">
                {booking.worker?.displayName || 'Searching for best match...'}
              </Text>
           </View>
           <View className="items-end">
              <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-wider">Total</Text>
              <Text className="text-accent font-black text-lg">₹{booking.finalPrice || booking.estimatedPrice || '---'}</Text>
           </View>
        </View>

        <View className="h-[1px] bg-white/5 mb-4" />

        <View className="flex-row items-center justify-between">
           <View className="flex-row items-center gap-2 flex-1 mr-4">
              <MapPin size={14} color="#8E8E93" />
              <Text className="text-textSecondary text-xs" numberOfLines={1}>{booking.address}</Text>
           </View>
           <ChevronRight size={16} color="#8E8E93" />
        </View>
      </Pressable>
    </Animated.View>
  );
}
