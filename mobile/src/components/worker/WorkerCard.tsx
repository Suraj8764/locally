import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { Phone, MessageCircle, Star, MapPin, Clock, ShieldCheck, Briefcase } from 'lucide-react-native';
import { Worker } from '../../types';
import { Avatar } from '../ui/Avatar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface WorkerCardProps {
  worker: Worker;
  index?: number;
  onPress?: () => void;
  onBook?: () => void;
}

export function WorkerCard({ worker, index = 0, onPress, onBook }: WorkerCardProps) {
  const handleCall = () => {
    const phone = worker?.phoneE164 || (worker as any)?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleWhatsApp = () => {
    const whatsapp = worker?.whatsappE164 || worker?.phoneE164 || (worker as any)?.phone;
    if (whatsapp) {
      Linking.openURL(`https://wa.me/${whatsapp.replace('+', '')}`);
    }
  };

  const displayName = worker?.displayName || 'Service Expert';
  const profileImage = worker?.profileImage || (worker as any)?.image || undefined;
  const ratingAvg = worker?.ratingAvg !== undefined && worker?.ratingAvg !== null ? worker.ratingAvg : 5.0;
  const ratingCount = worker?.ratingCount ?? 0;
  const completedJobs = worker?.completedJobs ?? 0;
  const distanceKm = worker?.distanceKm;
  const startingPrice = worker?.estimatedStartingPrice || (worker as any)?.hourlyRate || 149;
  const responseTimeMins = worker?.responseTimeMins || 20;

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(500)}
      className="mb-4"
    >
      <Pressable 
        onPress={onPress}
        className="active:opacity-95"
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
          className="rounded-3xl border border-white/10 overflow-hidden"
        >
          <View className="p-4">
            <View className="flex-row gap-4">
              {/* Profile Image & Status */}
              <View>
                <View className="p-[2px] rounded-2xl border border-accent/20">
                  <Avatar url={profileImage} name={displayName} size={72} />
                </View>
                {worker?.isOnline && (
                  <View className="absolute -bottom-1 -right-1 bg-background rounded-full p-[3px]">
                    <View className="w-3.5 h-3.5 rounded-full bg-onlineGreen shadow-sm shadow-onlineGreen" />
                  </View>
                )}
              </View>
              
              {/* Worker Info */}
              <View className="flex-1">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center gap-1.5 flex-wrap">
                      <Text className="text-textPrimary font-black text-lg" numberOfLines={1}>
                        {displayName}
                      </Text>
                      {worker?.isVerified && (
                        <ShieldCheck size={16} color="#30D158" fill="rgba(48, 209, 88, 0.1)" />
                      )}
                    </View>
                    <Text className="text-textSecondary text-xs font-bold uppercase tracking-wider">
                      {worker?.profession || worker?.categoryId || 'Service Professional'}
                    </Text>
                  </View>
                  
                  {worker?.isOnline && (
                    <View className="bg-onlineGreen/10 border border-onlineGreen/30 px-2 py-1 rounded-lg">
                      <Text className="text-onlineGreen text-[8px] font-black uppercase">Available Now</Text>
                    </View>
                  )}
                </View>

                {/* Stats Row */}
                <View className="flex-row items-center mt-3 gap-x-4 flex-wrap gap-y-1">
                  <View className="flex-row items-center gap-1">
                    <Star size={14} color="#FF9F0A" fill="#FF9F0A" />
                    <Text className="text-textPrimary font-bold text-sm">{ratingAvg.toFixed(1)}</Text>
                    <Text className="text-textSecondary text-[10px]">({ratingCount})</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Briefcase size={12} color="#8E8E93" />
                    <Text className="text-textSecondary text-xs font-medium">{completedJobs} Jobs</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <MapPin size={12} color="#E8294C" />
                    <Text className="text-textSecondary text-xs font-medium">
                      {distanceKm ? `${distanceKm.toFixed(1)}km` : 'Nearby'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Bottom Info Bar */}
            <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-white/5">
              <View>
                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-wider">Starting from</Text>
                <Text className="text-accent font-black text-lg">₹{startingPrice}</Text>
              </View>
              
              <View className="flex-row items-center gap-2">
                <Clock size={12} color="#8E8E93" />
                <Text className="text-textSecondary text-xs font-medium">
                   Arrives in <Text className="text-textPrimary font-bold">{responseTimeMins}m</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row p-3 pt-0 gap-3">
             <View className="flex-row gap-2 mr-auto">
                <Pressable 
                  onPress={handleCall}
                  className="w-11 h-11 bg-surface border border-white/5 rounded-2xl items-center justify-center active:bg-white/10"
                >
                  <Phone size={20} color="#F5F5F7" />
                </Pressable>
                <Pressable 
                  onPress={handleWhatsApp}
                  className="w-11 h-11 bg-onlineGreen/10 border border-onlineGreen/20 rounded-2xl items-center justify-center active:bg-onlineGreen/20"
                >
                  <MessageCircle size={20} color="#30D158" />
                </Pressable>
             </View>

             <Pressable 
              onPress={onBook || onPress}
              className="flex-1"
             >
              <LinearGradient
                colors={['#E8294C', '#FF453A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-11 rounded-2xl items-center justify-center shadow-lg shadow-accent/20"
              >
                <Text className="text-white font-black text-sm uppercase tracking-widest">Book Now</Text>
              </LinearGradient>
             </Pressable>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

