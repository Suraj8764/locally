import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Home, Briefcase, MapPin, Trash2 } from 'lucide-react-native';

interface SavedAddressItemProps {
  label: string;
  address: string;
  onPress: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
}

export function SavedAddressItem({ label, address, onPress, onDelete, showDelete }: SavedAddressItemProps) {
  const getIcon = () => {
    switch (label.toLowerCase()) {
      case 'home': return <Home size={18} color="#E8294C" />;
      case 'work': return <Briefcase size={18} color="#0A84FF" />;
      default: return <MapPin size={18} color="#8E8E93" />;
    }
  };

  return (
    <Pressable 
      onPress={onPress}
      className="flex-row items-center gap-4 bg-surface border border-white/5 p-4 rounded-3xl mb-3"
    >
      <View className="w-10 h-10 bg-background rounded-2xl items-center justify-center">
        {getIcon()}
      </View>
      <View className="flex-1">
        <Text className="text-white font-black text-sm">{label}</Text>
        <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-wider" numberOfLines={1}>
          {address}
        </Text>
      </View>
      {showDelete && onDelete && (
        <Pressable onPress={onDelete} className="p-2">
          <Trash2 size={16} color="#FF453A" opacity={0.5} />
        </Pressable>
      )}
    </Pressable>
  );
}
