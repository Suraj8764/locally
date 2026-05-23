import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Banknote, CreditCard, Smartphone } from 'lucide-react-native';
import { PaymentMethod } from '../../types';
import { COLORS } from '../../constants';

interface PaymentSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

const methods = [
  { id: 'cash' as PaymentMethod, label: 'Cash on Delivery', icon: Banknote },
  { id: 'upi' as PaymentMethod, label: 'UPI App', icon: Smartphone },
  { id: 'razorpay' as PaymentMethod, label: 'Card / Netbanking', icon: CreditCard },
];

export function PaymentSelector({ selected, onSelect }: PaymentSelectorProps) {
  return (
    <View className="gap-3">
      {methods.map((method) => {
        const isSelected = selected === method.id;
        const Icon = method.icon;
        
        return (
          <Pressable
            key={method.id}
            onPress={() => onSelect(method.id)}
            className={`flex-row items-center p-4 rounded-xl border ${
              isSelected ? 'border-accent bg-accent/10' : 'border-border bg-surface'
            }`}
          >
            <View className="w-10 h-10 rounded-full bg-background items-center justify-center mr-3">
              <Icon size={20} color={isSelected ? COLORS.accentPrimary : COLORS.textSecondary} />
            </View>
            <Text className={`flex-1 font-bold ${
              isSelected ? 'text-accent' : 'text-textPrimary'
            }`}>
              {method.label}
            </Text>
            <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
              isSelected ? 'border-accent' : 'border-textSecondary'
            }`}>
              {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-accent" />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
