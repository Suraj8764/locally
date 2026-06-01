import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, Dimensions, NativeScrollEvent, NativeSyntheticEvent, Pressable, SafeAreaView, StatusBar } from 'react-native';
import { ChevronRight, ArrowRight, Search, MapPin, AlertTriangle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Find Trusted Workers Near You',
    description: 'Instantly connect with verified professionals in your area.',
    icon: Search
  },
  {
    id: '2',
    title: 'Book Instantly & Track Realtime',
    description: 'Schedule services and track workers live on the map.',
    icon: MapPin
  },
  {
    id: '3',
    title: 'Emergency Help in Minutes',
    description: 'Use SOS to get priority assistance immediately.',
    icon: AlertTriangle
  }
];

export function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
      if (onboardingCompleted === 'true') {
        navigation.replace('RoleSelect');
      }
    } catch (e) {
      console.error('Error checking onboarding status:', e);
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ 
        index: nextIndex, 
        animated: true 
      });
    }
  };

  const skipOnboarding = () => {
    setCurrentIndex(slides.length - 1);
    flatListRef.current?.scrollToIndex({ 
      index: slides.length - 1, 
      animated: true 
    });
  };

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      navigation.replace('RoleSelect');
    } catch (e) {
      console.error('Error saving onboarding status:', e);
      navigation.replace('RoleSelect');
    }
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#050816' }}>
      <StatusBar barStyle="light-content" backgroundColor="#050816" />
      
      <View className="flex-1" style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 }}>
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ width }} className="items-center justify-center">
              {/* Icon Container with Glassmorphism and Glow */}
              <View 
                className="items-center justify-center rounded-full mb-8"
                style={{ 
                  width: 160, 
                  height: 160,
                  backgroundColor: 'rgba(255, 45, 85, 0.1)',
                  borderWidth: 2,
                  borderColor: 'rgba(255, 45, 85, 0.3)',
                  shadowColor: '#FF2D55',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                  elevation: 10,
                }}
              >
                <item.icon size={80} color="#FF2D55" />
              </View>

              {/* Title */}
              <Text 
                className="text-white font-bold text-center mb-4 leading-[36px]"
                style={{ 
                  fontSize: 28,
                  maxWidth: width * 0.8,
                }}
              >
                {item.title}
              </Text>

              {/* Description */}
              <Text 
                className="text-gray-400 text-center leading-[24px]"
                style={{ 
                  fontSize: 16,
                  maxWidth: width * 0.85,
                }}
              >
                {item.description}
              </Text>
            </View>
          )}
        />

        {/* Pagination Dots */}
        <View className="flex-row justify-center gap-3 mb-8 mt-8">
          {slides.map((_, idx) => (
            <View 
              key={idx} 
              style={{
                width: currentIndex === idx ? 32 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: currentIndex === idx ? '#FF2D55' : 'rgba(255, 255, 255, 0.2)',
              }}
            />
          ))}
        </View>

        {/* Buttons */}
        <View className="gap-4">
          {isLastSlide ? (
            <Pressable
              onPress={finishOnboarding}
              className="bg-[#FF2D55] rounded-2xl py-4 px-6 items-center flex-row justify-center"
              style={{
                shadowColor: '#FF2D55',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Text className="text-white font-bold text-base uppercase tracking-wider">
                Get Started
              </Text>
              <ArrowRight size={20} color="#FFFFFF" className="ml-2" />
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={nextSlide}
                className="bg-[#FF2D55] rounded-2xl py-4 px-6 items-center flex-row justify-center"
                style={{
                  shadowColor: '#FF2D55',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <Text className="text-white font-bold text-base uppercase tracking-wider">
                  Next
                </Text>
                <ChevronRight size={20} color="#FFFFFF" className="ml-2" />
              </Pressable>

              <Pressable
                onPress={skipOnboarding}
                className="py-3 px-6 items-center"
              >
                <Text className="text-gray-400 font-semibold text-sm uppercase tracking-wider">
                  Skip
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
