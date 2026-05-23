import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { AlertTriangle, MapPin } from 'lucide-react-native';
import { useLocation } from '../../hooks/useLocation';
import { api } from '../../api';

export function EmergencyScreen({ navigation }: any) {
  const { coords } = useLocation();
  const [requesting, setRequesting] = useState(false);
  const pulse1 = useSharedValue(1);
  const pulse2 = useSharedValue(1);

  useEffect(() => {
    pulse1.value = withRepeat(
      withTiming(1.5, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      true
    );
    pulse2.value = withDelay(
      500,
      withRepeat(
        withTiming(1.5, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: pulse1.value }],
    opacity: 1 - (pulse1.value - 1) * 2,
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: pulse2.value }],
    opacity: 1 - (pulse2.value - 1) * 2,
  }));

  const handleEmergencyRequest = async (categoryId: string) => {
    if (!coords) return;
    setRequesting(true);
    try {
      await api.leads.create({
        categoryId,
        requirement: 'EMERGENCY - Send nearest available immediately',
        lat: coords.lat,
        lng: coords.lng,
      });
      // In real app, navigate to a searching screen
      alert('Emergency request sent to nearest workers. Please hold on.');
      navigation.goBack();
    } catch (e) {
      alert('Failed to send request');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <View className="flex-1 bg-error/10 pt-20 px-6 items-center">
      <View className="w-16 h-16 rounded-full bg-error/20 items-center justify-center mb-6">
        <AlertTriangle size={32} color="#FF453A" />
      </View>
      <Text className="text-3xl font-extrabold text-error mb-2">Emergency SOS</Text>
      <Text className="text-error/80 text-center mb-10 leading-5">
        Priority dispatch. Nearest available worker will arrive in &lt;15 mins.
      </Text>

      <View className="w-64 h-64 items-center justify-center relative mb-12">
        <Animated.View 
          className="absolute w-40 h-40 rounded-full bg-error/30"
          style={animatedStyle1}
        />
        <Animated.View 
          className="absolute w-40 h-40 rounded-full bg-error/30"
          style={animatedStyle2}
        />
        <View className="w-40 h-40 rounded-full bg-error items-center justify-center z-10 shadow-xl shadow-error">
          <Text className="text-white font-extrabold text-2xl tracking-widest">SOS</Text>
        </View>
      </View>

      <View className="w-full bg-surface border border-border p-5 rounded-3xl">
        <Text className="text-white font-bold mb-4 text-center">What do you need immediately?</Text>
        
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {['Electrician', 'Plumber', 'Mechanic', 'Doctor'].map(type => (
            <Pressable 
              key={type}
              onPress={() => handleEmergencyRequest(type.toLowerCase())}
              disabled={requesting}
              className="bg-background border border-error/30 py-3 w-[48%] rounded-xl items-center"
            >
              <Text className="text-error font-bold">{type}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable onPress={() => navigation.goBack()} className="mt-8 py-4 px-8">
        <Text className="text-textSecondary font-bold">Cancel</Text>
      </Pressable>
    </View>
  );
}
