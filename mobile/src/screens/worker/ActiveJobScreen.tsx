import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Linking } from 'react-native';
import { ChevronLeft, Phone, MessageCircle, MapPin, Navigation, Play, CheckCircle2, Info } from 'lucide-react-native';
import { useSocket } from '../../hooks/useSocket';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/ui/Avatar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

import { useLocationTracking } from '../../hooks/useLocationTracking';

export function ActiveJobScreen({ navigation, route }: any) {
  const { booking } = route.params;
  const { user } = useAuthStore();
  const socket = useSocket();
  const [status, setStatus] = useState(booking.status || 'accepted');

  // Start tracking when on the way
  useLocationTracking(status === 'on_the_way', booking.id, booking.customerId);

  const updateStatus = (newStatus: string) => {
    setStatus(newStatus);
    if (socket) {
      socket.emit('booking:status-update', {
        bookingId: booking.id,
        customerId: booking.customerId,
        status: newStatus,
      });
    }
  };

  const handleAction = () => {
    if (status === 'accepted') {
      updateStatus('on_the_way');
    } else if (status === 'on_the_way') {
      updateStatus('started');
    } else if (status === 'started') {
      updateStatus('completed');
      navigation.navigate('WorkerLeads');
    }
  };

  const getActionButtonConfig = () => {
    switch (status) {
      case 'accepted': return { label: 'Start Navigation', icon: <Navigation size={20} color="#FFF" />, colors: ['#0A84FF', '#007AFF'] };
      case 'on_the_way': return { label: 'Start Job', icon: <Play size={20} color="#FFF" />, colors: ['#30D158', '#28CD41'] };
      case 'started': return { label: 'Complete Job', icon: <CheckCircle2 size={20} color="#FFF" />, colors: ['#E8294C', '#FF453A'] };
      default: return { label: 'Done', icon: null, colors: ['#1C1C1E', '#1C1C1E'] };
    }
  };

  const config = getActionButtonConfig();

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="pt-14 px-6 pb-6 bg-surface border-b border-white/5">
        <View className="flex-row items-center justify-between mb-6">
           <Pressable onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/5 rounded-full items-center justify-center">
             <ChevronLeft size={20} color="#FFF" />
           </Pressable>
           <View className="bg-accent/10 px-4 py-1.5 rounded-full border border-accent/20">
              <Text className="text-accent font-black text-[10px] uppercase tracking-widest">{status.replace('_', ' ')}</Text>
           </View>
           <Pressable className="w-10 h-10 bg-white/5 rounded-full items-center justify-center">
             <Info size={20} color="#FFF" />
           </Pressable>
        </View>

        <View className="flex-row items-center">
           <Avatar url={booking.customerImage || undefined} name={booking.customerName || 'Customer'} size={60} />
           <View className="ml-4 flex-1">
              <Text className="text-white text-2xl font-black">{booking.customerName || 'Customer'}</Text>
              <Text className="text-textSecondary font-bold text-xs uppercase tracking-widest mt-1">Service: {booking.categoryId}</Text>
           </View>
           <View className="flex-row gap-3">
              <Pressable 
                onPress={() => Linking.openURL(`tel:${booking.customerPhone || '1234567890'}`)}
                className="w-12 h-12 bg-onlineGreen/10 border border-onlineGreen/20 rounded-2xl items-center justify-center"
              >
                <Phone size={20} color="#30D158" />
              </Pressable>
              <Pressable 
                onPress={() => navigation.navigate('Chat', { bookingId: booking.id, recipientName: booking.customerName, recipientImage: undefined })}
                className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl items-center justify-center"
              >
                <MessageCircle size={20} color="#E8294C" />
              </Pressable>
           </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Address Card */}
        <Animated.View entering={FadeInUp.delay(100)} className="bg-surface border border-white/5 rounded-[32px] p-6 mb-6">
           <Text className="text-textSecondary text-[10px] font-black uppercase tracking-[2px] mb-4">Service Address</Text>
           <View className="flex-row items-start gap-4">
              <View className="w-10 h-10 bg-background rounded-2xl items-center justify-center">
                 <MapPin size={20} color="#E8294C" />
              </View>
              <View className="flex-1">
                 <Text className="text-white font-bold text-base leading-6">{booking.address || 'Loading address...'}</Text>
                 <Pressable className="mt-3 bg-white/5 self-start px-4 py-2 rounded-xl">
                    <Text className="text-white text-[10px] font-bold uppercase tracking-widest">Open in Maps</Text>
                 </Pressable>
              </View>
           </View>
        </Animated.View>

        {/* Issue Description */}
        <Animated.View entering={FadeInUp.delay(200)} className="bg-surface border border-white/5 rounded-[32px] p-6 mb-20">
           <Text className="text-textSecondary text-[10px] font-black uppercase tracking-[2px] mb-4">Issue Details</Text>
           <Text className="text-white font-medium leading-6 mb-4">
             {booking.problemDescription || 'No description provided.'}
           </Text>
           {booking.imageUri && (
             <Image 
               source={{ uri: booking.imageUri }} 
               className="w-full h-48 rounded-2xl bg-background"
               resizeMode="cover"
             />
           )}
        </Animated.View>
      </ScrollView>

      {/* Floating Action Bar */}
      <View className="absolute bottom-10 left-6 right-6">
         <Pressable onPress={handleAction}>
            <LinearGradient
              colors={config.colors as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-16 rounded-3xl flex-row items-center justify-center gap-3 shadow-2xl shadow-black"
            >
               {config.icon}
               <Text className="text-white font-black text-lg uppercase tracking-widest">{config.label}</Text>
            </LinearGradient>
         </Pressable>
      </View>
    </View>
  );
}
