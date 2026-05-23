import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Find Trusted Workers\nNear You',
    description: 'Instantly connect with verified professionals in your locality for any service you need.',
    icon: '🔍'
  },
  {
    id: '2',
    title: 'Book Instantly &\nTrack Realtime',
    description: 'No more waiting. Book a service and track the professional right to your doorstep.',
    icon: '⚡'
  },
  {
    id: '3',
    title: 'Emergency Help\nin Minutes',
    description: 'Stuck in an emergency? Use our SOS feature to get priority help immediately.',
    icon: '🚨'
  }
];

export function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    setCurrentIndex(Math.round(x / width));
  };

  const onNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('RoleSelect');
    }
  };

  return (
    <View className="flex-1 bg-background pb-10 pt-20">
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
          <View style={{ width }} className="items-center px-8">
            <View className="w-64 h-64 bg-surface rounded-full items-center justify-center border-4 border-border mb-10">
              <Text className="text-[100px]">{item.icon}</Text>
            </View>
            <Text className="text-3xl font-bold text-white text-center mb-4 leading-[40px]">
              {item.title}
            </Text>
            <Text className="text-base text-textSecondary text-center leading-[24px] px-4">
              {item.description}
            </Text>
          </View>
        )}
      />

      <View className="px-8 mt-10">
        <View className="flex-row justify-center gap-2 mb-8">
          {slides.map((_, idx) => (
            <View 
              key={idx} 
              className={`h-2 rounded-full ${currentIndex === idx ? 'w-8 bg-accent' : 'w-2 bg-border'}`}
            />
          ))}
        </View>

        <Button 
          title={currentIndex === slides.length - 1 ? "Get Started" : "Next"} 
          onPress={onNext} 
        />
        {currentIndex < slides.length - 1 && (
          <Button 
            title="Skip" 
            variant="ghost" 
            onPress={() => navigation.replace('RoleSelect')} 
            style={{ marginTop: 12 }}
          />
        )}
      </View>
    </View>
  );
}
