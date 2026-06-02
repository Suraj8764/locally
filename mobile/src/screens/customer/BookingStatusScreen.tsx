import React, { useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { ChevronLeft, CheckCircle2, Bell } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { LinearGradient } from 'expo-linear-gradient';

export function BookingStatusScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const { bookingId } = route.params;

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => api.bookings.getById(bookingId),
  });

  if (isLoading || !booking) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#E8294C" size="large" />
      </View>
    );
  }

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
        <Text className="text-white text-lg font-black">{t('bookingConfirmed')}</Text>
        <View className="w-12" />
      </View>

      <View className="flex-1 px-6 items-center justify-center">
        {/* Success Icon */}
        <View className="w-32 h-32 bg-onlineGreen/10 border border-onlineGreen/30 rounded-full items-center justify-center mb-8">
          <CheckCircle2 size={64} color="#30D158" />
        </View>

        {/* Success Message */}
        <Text className="text-white text-3xl font-black tracking-tight mb-3 text-center">
          {t('bookingConfirmed')}!
        </Text>
        <Text className="text-textSecondary text-base text-center mb-8 max-w-xs">
          {t('bookingSent')}
        </Text>

        {/* Worker Notification Indicator */}
        <View className="bg-surface border border-white/5 rounded-2xl p-5 mb-8 w-full">
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 bg-accent/10 rounded-full items-center justify-center">
              <Bell size={24} color="#E8294C" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base mb-1">
                {t('workerNotified')}
              </Text>
              <Text className="text-textSecondary text-sm">
                {t('workerNotifiedDesc')}
              </Text>
            </View>
          </View>
        </View>

        {/* Booking ID */}
        <View className="bg-surface/50 border border-white/5 rounded-xl px-6 py-3">
          <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-1">
            {t('bookingId')}
          </Text>
          <Text className="text-white font-black text-lg">
            #{booking.id.slice(-6).toUpperCase()}
          </Text>
        </View>

        {/* Back to Home Button */}
        <Pressable 
          onPress={() => navigation.navigate('HomeTab')}
          className="mt-12 w-full"
        >
          <LinearGradient
            colors={['#E8294C', '#FF453A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="h-14 rounded-2xl items-center justify-center shadow-xl shadow-accent/40"
          >
            <Text className="text-white font-black text-base uppercase tracking-[3px]">
              {t('backToHome')}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

