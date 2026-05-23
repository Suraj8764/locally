import React from 'react';
import { View, Text } from 'react-native';
import { Star } from 'lucide-react-native';
import { Avatar } from '../ui/Avatar';

interface ReviewCardProps {
  name: string;
  rating: number;
  date: string;
  comment: string;
}

export function ReviewCard({ name, rating, date, comment }: ReviewCardProps) {
  return (
    <View className="bg-surface border border-white/5 p-4 rounded-3xl mb-3">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center gap-3">
          <Avatar name={name} size={32} />
          <View>
            <Text className="text-textPrimary font-bold text-sm">{name}</Text>
            <Text className="text-textSecondary text-[10px]">{date}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1 bg-background px-2 py-1 rounded-lg">
          <Star size={12} color="#FF9F0A" fill="#FF9F0A" />
          <Text className="text-white font-bold text-xs">{rating}</Text>
        </View>
      </View>
      <Text className="text-textSecondary text-xs leading-5">{comment}</Text>
    </View>
  );
}
