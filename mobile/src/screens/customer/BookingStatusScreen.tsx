import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Linking } from 'react-native';
import { ChevronLeft, Phone, MessageCircle, MapPin, Calendar, CreditCard, Share2, Star } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';
import { useSocketEvent } from '../../hooks/useSocket';
import { useBookingStore } from '../../store/bookingStore';
import { BookingTimeline } from '../../components/booking/BookingTimeline';
import { StatusHeader } from '../../components/booking/StatusHeader';
import { Avatar } from '../../components/ui/Avatar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Platform } from 'react-native';
import { useWorkerTracking } from '../../hooks/useWorkerTracking';
import { LiveTrackingMap } from '../../components/booking/LiveTrackingMap';
import { Booking } from '../../types';

export function BookingStatusScreen({ navigation, route }: any) {
  const { bookingId } = route.params;
  const { activeBooking, updateBookingStatus, setActiveBooking } = useBookingStore();
  const workerLocation = useWorkerTracking(bookingId);

  const { data: booking, isLoading } = useQuery<Booking>({
    queryKey: ['booking', bookingId],
    queryFn: () => api.bookings.getById(bookingId),
    enabled: !activeBooking,
  });

  useEffect(() => {
    if (booking && !activeBooking) {
      setActiveBooking(booking);
    }
  }, [booking, activeBooking, setActiveBooking]);

  useSocketEvent('booking:status', (updatedBooking: any) => {
    if (updatedBooking.id === bookingId) {
      updateBookingStatus(updatedBooking.status);
    }
  });

  const currentBooking = (activeBooking || booking) as Booking;

  if (isLoading || !currentBooking) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#E8294C" size="large" />
      </View>
    );
  }

  const isAssigned = currentBooking.workerId && currentBooking.status !== 'pending' && !currentBooking.status.startsWith('cancelled');
  const showMap = Platform.OS !== 'web' && currentBooking.status === 'on_the_way' && workerLocation;

  return (
    <View className="flex-1 bg-background">
      {/* Top Glow */}
      <View className="absolute top-0 left-0 right-0 h-64 opacity-20">
        <LinearGradient colors={['#E8294C', 'transparent']} className="flex-1" />
      </View>

      <View className="pt-14 px-6 pb-4 flex-row items-center justify-between z-10">
        <Pressable 
          onPress={() => navigation.goBack()}
          className="w-12 h-12 bg-surface/50 border border-white/10 rounded-2xl items-center justify-center"
        >
          <ChevronLeft size={24} color="#FFF" />
        </Pressable>
        <Text className="text-white text-lg font-black">Booking #{currentBooking.id.slice(-6).toUpperCase()}</Text>
        <Pressable className="w-12 h-12 bg-surface/50 border border-white/10 rounded-2xl items-center justify-center">
          <Share2 size={20} color="#FFF" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <StatusHeader status={currentBooking.status} />

        {showMap ? (
          <LiveTrackingMap 
            workerLocation={workerLocation} 
            customerLocation={currentBooking.location} 
            workerName={currentBooking.worker?.displayName} 
            workerImage={currentBooking.worker?.profileImage}
          />
        ) : (
          <View className="mb-8">
             <View className="bg-surface border border-white/5 rounded-[32px] p-6 shadow-2xl shadow-black/50">
                <BookingTimeline status={currentBooking.status} />
             </View>
          </View>
        )}

        {isAssigned && (
          <View className="mb-8">
            <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-[2px] mb-4 ml-2">Assigned Professional</Text>
            <View className="bg-surface border border-white/5 rounded-[32px] p-5">
              <View className="flex-row items-center gap-4 mb-5">
                <Avatar url={currentBooking.worker?.profileImage} name={currentBooking.worker?.displayName || 'Worker'} size={56} />
                <View className="flex-1">
                   <Text className="text-white font-black text-lg">{currentBooking.worker?.displayName || 'Finding...'}</Text>
                   <Text className="text-accent text-[10px] font-bold uppercase tracking-widest">{currentBooking.categoryId}</Text>
                </View>
                <View className="items-end">
                   <View className="flex-row items-center gap-1">
                      <Star size={12} color="#FF9F0A" fill="#FF9F0A" />
                      <Text className="text-white font-bold text-xs">4.9</Text>
                   </View>
                   <Text className="text-textSecondary text-[10px]">Top Rated</Text>
                </View>
              </View>
              
              <View className="flex-row gap-3">
                <Pressable 
                  onPress={() => Linking.openURL(`tel:${currentBooking.worker?.phoneE164}`)}
                  className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl items-center justify-center flex-row gap-2"
                >
                  <Phone size={18} color="#FFF" />
                  <Text className="text-white font-bold">Call</Text>
                </Pressable>
                <Pressable 
                  onPress={() => navigation.navigate('Chat', {
                    bookingId: currentBooking.id,
                    recipientName: currentBooking.worker?.displayName || 'Professional',
                    recipientImage: currentBooking.worker?.profileImage,
                  })}
                  className="flex-1 h-14 bg-onlineGreen/10 border border-onlineGreen/20 rounded-2xl items-center justify-center flex-row gap-2"
                >
                  <MessageCircle size={18} color="#30D158" />
                  <Text className="text-onlineGreen font-bold">Chat</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        <View className="mb-10">
          <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-[2px] mb-4 ml-2">Job Details</Text>
          <View className="bg-surface border border-white/5 rounded-[32px] p-6">
            <View className="flex-row items-center gap-4 mb-5 pb-5 border-b border-white/5">
              <View className="w-10 h-10 bg-background rounded-xl items-center justify-center">
                <MapPin size={20} color="#E8294C" />
              </View>
              <View className="flex-1">
                 <Text className="text-textSecondary text-[10px] font-bold uppercase mb-0.5">Address</Text>
                 <Text className="text-white font-bold text-sm" numberOfLines={1}>{currentBooking.address}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-4 mb-5 pb-5 border-b border-white/5">
              <View className="w-10 h-10 bg-background rounded-xl items-center justify-center">
                <Calendar size={20} color="#0A84FF" />
              </View>
              <View className="flex-1">
                 <Text className="text-textSecondary text-[10px] font-bold uppercase mb-0.5">Scheduled</Text>
                 <Text className="text-white font-bold text-sm">
                   {new Date(currentBooking.createdAtMs).toLocaleDateString()} at {new Date(currentBooking.createdAtMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 bg-background rounded-xl items-center justify-center">
                <CreditCard size={20} color="#30D158" />
              </View>
              <View className="flex-1">
                 <Text className="text-textSecondary text-[10px] font-bold uppercase mb-0.5">Payment</Text>
                 <Text className="text-white font-bold text-sm">UPI - Paid</Text>
              </View>
              <Text className="text-accent font-black text-xl">₹{currentBooking.estimatedPrice || 149}</Text>
            </View>
          </View>
        </View>


        {!currentBooking.status.startsWith('cancelled') && currentBooking.status !== 'completed' && (
          <Pressable className="mb-20">
             <Text className="text-error/50 font-bold text-xs text-center uppercase tracking-widest">Cancel Booking</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

