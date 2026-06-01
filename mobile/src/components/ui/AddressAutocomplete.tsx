import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { MapPin, X } from 'lucide-react-native';
import { GOOGLE_MAPS_API_KEY } from '../../constants';

interface AddressAutocompleteProps {
  onAddressSelect: (address: string, coords?: { lat: number; lng: number }) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export function AddressAutocomplete({ 
  onAddressSelect, 
  placeholder = "Search location...", 
  label, 
  error 
}: AddressAutocompleteProps) {
  const [manualAddress, setManualAddress] = useState('');

  const handleManualSubmit = () => {
    if (manualAddress.trim()) {
      onAddressSelect(manualAddress);
    }
  };

  // If no Google Maps API key, show manual text input
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <View className="mb-5">
        {label && (
          <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">
            {label}
          </Text>
        )}
        <View className="relative">
          <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <MapPin size={18} color="#E8294C" />
          </View>
          <TextInput
            className="bg-surface border border-white/10 rounded-2xl h-14 pl-12 pr-10 text-white"
            placeholder={placeholder}
            placeholderTextColor="#8E8E93"
            value={manualAddress}
            onChangeText={setManualAddress}
            onSubmitEditing={handleManualSubmit}
          />
          {manualAddress.length > 0 && (
            <Pressable
              onPress={() => setManualAddress('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
            >
              <X size={16} color="#8E8E93" />
            </Pressable>
          )}
        </View>
        {error && (
          <Text className="text-error text-[10px] font-bold mt-1.5 ml-1">
            {error}
          </Text>
        )}
      </View>
    );
  }

  // Use Google Places Autocomplete if API key is available
  return (
    <View className="mb-5 z-50">
      {label && (
        <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">
          {label}
        </Text>
      )}
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        onPress={(data, details = null) => {
          onAddressSelect(data.description, details?.geometry?.location);
        }}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: 'en',
        }}
        fetchDetails={true}
        styles={styles}
        enablePoweredByContainer={false}
        renderLeftButton={() => (
          <View className="pl-4 justify-center">
            <MapPin size={18} color="#E8294C" />
          </View>
        )}
      />
      {error && (
        <Text className="text-error text-[10px] font-bold mt-1.5 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
  },
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
    paddingLeft: 10,
  },
  listView: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  row: {
    backgroundColor: 'transparent',
    padding: 16,
    height: 56,
    flexDirection: 'row',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  description: {
    color: '#F5F5F7',
    fontSize: 14,
  },
});
