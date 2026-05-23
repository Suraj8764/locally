import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useUserBookings } from '../../hooks/useBooking';
import { useAuthStore } from '../../store/authStore';
import { useSocketEvent } from '../../hooks/useSocket';
import { EmptyState } from '../../components/ui/EmptyState';
import { BookingHistoryCard } from '../../components/booking/BookingHistoryCard';
import { HistoryTabs } from '../../components/booking/HistoryTabs';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';

export function BookingsScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const { data: bookings = [], isLoading, refetch, isRefetching } = useUserBookings(user?.id);

  // Listen for status changes to update the list in real-time
  useSocketEvent('booking:status', () => {
    refetch();
  });

  const filteredBookings = bookings.filter(b => {
    const isPast = b.status === 'completed' || b.status.startsWith('cancelled');
    return activeTab === 'past' ? isPast : !isPast;
  });

  return (
    <View className="flex-1 bg-background">
      {/* Top Glow */}
      <View className="absolute top-0 left-0 right-0 h-64 opacity-20">
        <LinearGradient colors={['#E8294C', 'transparent']} className="flex-1" />
      </View>

      <View className="flex-1 pt-14">
        <View className="px-6 mb-8">
           <Text className="text-white text-3xl font-black tracking-tight mb-1">Your Bookings</Text>
           <Text className="text-textSecondary text-xs uppercase font-bold tracking-widest">
             Track and manage your service requests
           </Text>
        </View>

        <View className="px-6">
           <HistoryTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </View>

        <ScrollView 
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={isRefetching} 
              onRefresh={refetch} 
              tintColor="#E8294C" 
            />
          }
        >
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <View key={i} className="mb-4 bg-surface rounded-[32px] h-40 border border-white/5 animate-pulse" />
            ))
          ) : filteredBookings.length === 0 ? (
            <Animated.View entering={FadeInUp.delay(200)} className="mt-10">
              <EmptyState 
                title={activeTab === 'active' ? "No Active Bookings" : "No Past Bookings"}
                description={activeTab === 'active' ? "You don't have any pending requests. Need help with something?" : "Your service history will appear here once you complete a booking."}
                actionLabel={activeTab === 'active' ? "Find a Professional" : undefined}
                onAction={() => navigation.navigate('Home')}
              />
            </Animated.View>
          ) : (
            filteredBookings.map((b, index) => (
              <BookingHistoryCard 
                key={b.id} 
                booking={b} 
                index={index}
                onPress={() => navigation.navigate('BookingStatus', { bookingId: b.id })}
              />
            ))
          )}
          <View className="h-20" />
        </ScrollView>
      </View>
    </View>
  );
}

