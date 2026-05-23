import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';

interface AddressAutocompleteProps {
  onAddressSelect: (address: string, coords?: { lat: number; lng: number }) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export function AddressAutocomplete({ 
  onAddressSelect, 
  placeholder = "Enter your service address...", 
  label, 
  error 
}: AddressAutocompleteProps) {
  const [val, setVal] = useState('');

  const handleChange = (text: string) => {
    setVal(text);
    onAddressSelect(text, { lat: 21.05, lng: 86.49 });
  };

  return (
    <View className="mb-5 z-50">
      {label && (
        <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">
          {label}
        </Text>
      )}
      <View 
        style={styles.textInputContainer}
        className="flex-row items-center bg-[#13131A] px-4"
      >
        <MapPin size={18} color="#E8294C" />
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#8E8E93"
          value={val}
          onChangeText={handleChange}
          className="flex-1 ml-3 text-white text-base"
        />
      </View>
      {error && (
        <Text className="text-error text-[10px] font-bold mt-1.5 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  textInputContainer: {
    backgroundColor: '#13131A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    overflow: 'hidden',
    height: 56,
  },
  textInput: {
    backgroundColor: 'transparent',
    color: '#F5F5F7',
    fontSize: 16,
    height: 54,
  },
});

export default AddressAutocomplete;
