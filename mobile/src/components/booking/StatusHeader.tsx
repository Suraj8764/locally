import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { Radar, Truck, Wrench, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface StatusHeaderProps {
  status: string;
}

export function StatusHeader({ status }: StatusHeaderProps) {
  const pulseScale = useSharedValue(1);
  const rotateValue = useSharedValue(0);

  useEffect(() => {
    if (status === 'pending') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
          withTiming(1, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1) })
        ),
        -1,
        true
      );
      rotateValue.value = withRepeat(
        withTiming(360, { duration: 4000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [status]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: interpolateStatus(status),
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateValue.value}deg` }],
  }));

  const getStatusIcon = () => {
    switch (status) {
      case 'pending': return <Radar size={40} color="#E8294C" />;
      case 'on_the_way': return <Truck size={40} color="#0A84FF" />;
      case 'started': return <Wrench size={40} color="#FF9F0A" />;
      case 'completed': return <CheckCircle2 size={40} color="#30D158" />;
      default: return <Radar size={40} color="#E8294C" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending': return "Finding the best professional...";
      case 'accepted': return "Professional assigned!";
      case 'on_the_way': return "Professional is on the way";
      case 'started': return "Service is in progress";
      case 'completed': return "Service completed successfully";
      case 'cancelled_by_customer':
      case 'cancelled_by_worker': return "Booking cancelled";
      default: return "Processing your request...";
    }
  };

  return (
    <View className="items-center py-10">
      <View className="relative items-center justify-center w-32 h-32 mb-6">
        {status === 'pending' && (
          <>
            <Animated.View 
              style={pulseStyle}
              className="absolute w-24 h-24 rounded-full bg-accent/20 border border-accent/30" 
            />
            <Animated.View 
              style={[rotateStyle]}
              className="absolute w-32 h-32 rounded-full border border-dashed border-accent/20" 
            />
          </>
        )}
        <View className="w-20 h-20 bg-surface border border-white/5 rounded-[24px] items-center justify-center shadow-2xl shadow-black/50">
          {getStatusIcon()}
        </View>
      </View>
      
      <Text className="text-white text-xl font-black text-center px-10 leading-7">
        {getStatusText()}
      </Text>
      
      {status === 'pending' && (
        <Text className="text-textSecondary text-xs mt-2 uppercase font-bold tracking-[2px]">
          Searching within 5km radius
        </Text>
      )}
    </View>
  );
}

function interpolateStatus(status: string) {
  return status === 'pending' ? 1 : 0;
}
