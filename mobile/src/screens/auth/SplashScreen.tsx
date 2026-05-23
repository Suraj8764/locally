import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withSequence,
  withDelay
} from 'react-native-reanimated';

export function SplashScreen({ navigation }: any) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: 800 });

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Animated.View style={animatedStyle} className="items-center">
        <View className="w-24 h-24 rounded-3xl bg-accent/20 border-2 border-accent/40 items-center justify-center mb-4">
          <Text className="text-4xl">🚀</Text>
        </View>
        <Text className="text-4xl font-extrabold text-white tracking-wider">Locally</Text>
        <Text className="text-accent mt-2 font-bold tracking-widest uppercase text-xs">Fast & Trusted</Text>
      </Animated.View>
    </View>
  );
}
