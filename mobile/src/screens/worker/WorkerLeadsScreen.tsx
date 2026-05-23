import React from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useBookingStore } from '../../store/bookingStore';
import { MapPin, Clock, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

export function WorkerLeadsScreen() {
  const { pendingRequests } = useBookingStore();

  return (
    <View className="flex-1 bg-background">
      <View className="pt-14 px-6 pb-6 bg-surface border-b border-white/5">
        <Text className="text-3xl font-black text-white">Available Leads</Text>
        <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mt-1">
          {pendingRequests.length} matching jobs in your area
        </Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
      >
        {pendingRequests.length === 0 ? (
          <View className="flex-1 items-center justify-center mt-20">
             <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-6 border border-white/5">
                <Clock size={32} color="#8E8E93" />
             </View>
             <Text className="text-white font-black text-lg">No active leads</Text>
             <Text className="text-textSecondary text-center mt-2 px-10 text-sm">
                We'll notify you as soon as a customer requests a service in your area. Keep your status 'Online' to receive leads.
             </Text>
          </View>
        ) : (
          pendingRequests.map((lead, index) => (
            <Animated.View 
              key={lead.bookingId} 
              entering={FadeInDown.delay(index * 100)}
            >
              <Pressable className="bg-surface border border-white/5 p-5 rounded-[32px] mb-4 flex-row items-center">
                 <View className="w-12 h-12 bg-background rounded-2xl items-center justify-center mr-4">
                    <Text className="text-xl">🔧</Text>
                 </View>
                 <View className="flex-1">
                    <Text className="text-white font-black text-base capitalize">{lead.categoryId}</Text>
                    <View className="flex-row items-center gap-1 mt-1">
                       <MapPin size={12} color="#8E8E93" />
                       <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest">
                         2.4 km away
                       </Text>
                    </View>
                 </View>
                 <View className="items-end mr-4">
                    <Text className="text-onlineGreen font-black text-lg">₹500</Text>
                    <Text className="text-textSecondary text-[10px] font-bold uppercase">Estimated</Text>
                 </View>
                 <ChevronRight size={18} color="#8E8E93" />
              </Pressable>
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Floating Online Status */}
      <View className="absolute bottom-10 left-6 right-6">
         <LinearGradient
           colors={['#13131A', '#0A0A0F']}
           className="p-5 rounded-[32px] border border-white/10 flex-row items-center justify-between shadow-2xl"
         >
            <View className="flex-row items-center gap-3">
               <View className="w-3 h-3 bg-onlineGreen rounded-full animate-pulse" />
               <View>
                  <Text className="text-white font-black text-xs uppercase tracking-widest">Status: Online</Text>
                  <Text className="text-textSecondary text-[10px] font-bold uppercase">Receiving realtime leads</Text>
               </View>
            </View>
            <Pressable className="bg-white/5 px-4 py-2 rounded-xl">
               <Text className="text-white font-bold text-[10px] uppercase">Go Offline</Text>
            </Pressable>
         </LinearGradient>
      </View>
    </View>
  );
}
