import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Star, X, CheckCircle2 } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/ui/Avatar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

const FEEDBACK_TAGS = ['Professional', 'Punctual', 'Great Quality', 'Friendly', 'Reasonable Price'];

export function RatingScreen({ navigation, route }: any) {
  const { booking } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSubmitted(true);
    // Simulate API call
    setTimeout(() => {
      navigation.navigate('Home');
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-10">
        <Animated.View entering={FadeInUp} className="items-center">
           <View className="w-24 h-24 bg-onlineGreen/10 rounded-full items-center justify-center mb-8 border border-onlineGreen/20">
              <CheckCircle2 size={48} color="#30D158" />
           </View>
           <Text className="text-white text-3xl font-black text-center mb-4">Thank You!</Text>
           <Text className="text-textSecondary text-center text-base">Your feedback helps us maintain a high-quality community.</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="pt-14 px-6 pb-6 bg-surface border-b border-white/5 flex-row items-center justify-between">
         <Text className="text-white text-2xl font-black">Rate Service</Text>
         <Pressable onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/5 rounded-full items-center justify-center">
            <X size={20} color="#FFF" />
         </Pressable>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 pt-10" showsVerticalScrollIndicator={false}>
           <View className="items-center mb-10">
              <Avatar url={booking.workerImage || undefined} name={booking.workerName || 'Professional'} size={80} />
              <Text className="text-white text-xl font-black mt-4">{booking.workerName || 'Professional'}</Text>
              <Text className="text-textSecondary text-xs uppercase font-bold tracking-widest mt-1">{booking.categoryId}</Text>
           </View>

           <Text className="text-textSecondary text-center text-[10px] font-black uppercase tracking-[2px] mb-6">How was your experience?</Text>
           
           <View className="flex-row justify-center gap-4 mb-10">
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable 
                  key={star} 
                  onPress={() => {
                    setRating(star);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                >
                  <Star 
                    size={40} 
                    color={star <= rating ? '#FFD60A' : '#1C1C1E'} 
                    fill={star <= rating ? '#FFD60A' : 'transparent'} 
                  />
                </Pressable>
              ))}
           </View>

           <View className="flex-row flex-wrap justify-center gap-2 mb-10">
              {FEEDBACK_TAGS.map(tag => (
                <Pressable 
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedTags.includes(tag) ? 'bg-accent border-accent' : 'bg-surface border-white/10'
                  }`}
                >
                  <Text className={`text-xs font-bold ${selectedTags.includes(tag) ? 'text-white' : 'text-textSecondary'}`}>
                    {tag}
                  </Text>
                </Pressable>
              ))}
           </View>

           <View className="bg-surface border border-white/5 rounded-[32px] p-6 mb-20">
              <Text className="text-textSecondary text-[10px] font-black uppercase tracking-[2px] mb-4">Write a comment</Text>
              <TextInput 
                className="text-white text-base py-2 min-h-[100px]"
                placeholder="Share your experience (optional)"
                placeholderTextColor="#8E8E93"
                multiline
                value={comment}
                onChangeText={setComment}
              />
           </View>
        </ScrollView>

        <View className="px-6 pb-10">
           <Pressable 
             onPress={handleSubmit}
             disabled={rating === 0}
             className={`h-16 rounded-3xl items-center justify-center shadow-2xl ${
               rating === 0 ? 'bg-surface opacity-50' : ''
             }`}
           >
              <LinearGradient
                colors={rating === 0 ? ['#1C1C1E', '#1C1C1E'] : ['#E8294C', '#FF453A']}
                className="absolute inset-0 rounded-3xl"
              />
              <Text className="text-white font-black text-lg uppercase tracking-widest">Submit Review</Text>
           </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
