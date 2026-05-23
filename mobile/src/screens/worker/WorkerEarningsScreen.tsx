import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { ChevronLeft, TrendingUp, DollarSign, Briefcase, Star, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

export function WorkerEarningsScreen({ navigation }: any) {
  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="pt-14 px-6 pb-8 bg-surface border-b border-white/5">
        <Pressable onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mb-6">
          <ChevronLeft size={20} color="#FFF" />
        </Pressable>
        <Text className="text-textSecondary text-[10px] font-black uppercase tracking-[2px] mb-2">Total Earnings</Text>
        <Text className="text-white text-5xl font-black">₹12,450</Text>
        <View className="flex-row items-center gap-2 mt-4 bg-onlineGreen/10 self-start px-3 py-1 rounded-full border border-onlineGreen/20">
           <TrendingUp size={12} color="#30D158" />
           <Text className="text-onlineGreen font-bold text-[10px]">+12% from last week</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-4 mb-8">
           <View className="flex-1 min-w-[45%] bg-surface border border-white/5 p-6 rounded-[32px]">
              <View className="w-10 h-10 bg-accent/10 rounded-2xl items-center justify-center mb-4">
                 <Briefcase size={20} color="#E8294C" />
              </View>
              <Text className="text-white text-2xl font-black">48</Text>
              <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest">Jobs Done</Text>
           </View>
           
           <View className="flex-1 min-w-[45%] bg-surface border border-white/5 p-6 rounded-[32px]">
              <View className="w-10 h-10 bg-yellow-500/10 rounded-2xl items-center justify-center mb-4">
                 <Star size={20} color="#FFD60A" />
              </View>
              <Text className="text-white text-2xl font-black">4.9</Text>
              <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest">Avg Rating</Text>
           </View>
           
           <View className="flex-1 min-w-[45%] bg-surface border border-white/5 p-6 rounded-[32px]">
              <View className="w-10 h-10 bg-blue-500/10 rounded-2xl items-center justify-center mb-4">
                 <Clock size={20} color="#0A84FF" />
              </View>
              <Text className="text-white text-2xl font-black">15m</Text>
              <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest">Response Time</Text>
           </View>
           
           <View className="flex-1 min-w-[45%] bg-surface border border-white/5 p-6 rounded-[32px]">
              <View className="w-10 h-10 bg-onlineGreen/10 rounded-2xl items-center justify-center mb-4">
                 <DollarSign size={20} color="#30D158" />
              </View>
              <Text className="text-white text-2xl font-black">₹450</Text>
              <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest">Avg per job</Text>
           </View>
        </View>

        {/* Recent Transactions */}
        <View className="mb-10">
           <Text className="text-white text-xl font-black mb-6">Recent Earnings</Text>
           {[1, 2, 3, 4].map((item, i) => (
             <Animated.View 
               key={i} 
               entering={FadeInDown.delay(i * 100)}
               className="bg-surface border border-white/5 p-5 rounded-[24px] mb-3 flex-row items-center"
             >
                <View className="w-10 h-10 bg-background rounded-xl items-center justify-center mr-4">
                   <Text className="text-lg">⚡</Text>
                </View>
                <View className="flex-1">
                   <Text className="text-white font-bold">Electrician Service</Text>
                   <Text className="text-textSecondary text-[10px] font-bold uppercase">Yesterday, 4:20 PM</Text>
                </View>
                <Text className="text-onlineGreen font-black text-base">+₹650</Text>
             </Animated.View>
           ))}
        </View>
      </ScrollView>
    </View>
  );
}
