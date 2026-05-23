import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { X, MapPin, Navigation } from 'lucide-react-native';
import { AddressAutocomplete } from '../ui/AddressAutocomplete';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (address: string, coords: { lat: number; lng: number }) => void;
  onUseCurrentLocation: () => void;
}

import { SavedAddressItem } from '../profile/SavedAddressItem';

const DUMMY_SAVED_ADDRESSES = [
  { id: '1', label: 'Home', address: 'Sunset Blvd, Beverly Hills, CA', location: { lat: 34.0736, lng: -118.4004 } },
  { id: '2', label: 'Work', address: 'Infinite Loop, Cupertino, CA', location: { lat: 37.3318, lng: -122.0312 } },
];

export function LocationPickerModal({
  visible,
  onClose,
  onLocationSelect,
  onUseCurrentLocation
}: LocationPickerModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable className="flex-1" onPress={onClose} />

        <View className="bg-background rounded-t-[40px] border-t border-white/10 h-[85%] shadow-2xl shadow-black">
          <SafeAreaView className="flex-1">
            <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
              <Text className="text-white text-2xl font-black">Select Location</Text>
              <Pressable
                onPress={onClose}
                className="w-10 h-10 bg-surface rounded-full items-center justify-center"
              >
                <X size={20} color="#FFF" />
              </Pressable>
            </View>

            <ScrollView className="px-6 flex-1" showsVerticalScrollIndicator={false}>
              <Pressable
                onPress={() => {
                  onUseCurrentLocation();
                  onClose();
                }}
                className="flex-row items-center gap-4 bg-accent/10 p-5 rounded-[32px] mb-6 border border-accent/20"
              >
                <View className="w-10 h-10 bg-accent rounded-2xl items-center justify-center">
                  <Navigation size={20} color="#FFF" />
                </View>
                <View>
                  <Text className="text-white font-black">Use Current Location</Text>
                  <Text className="text-accent/70 text-[10px] font-bold uppercase tracking-widest">Fastest & most accurate</Text>
                </View>
              </Pressable>

              <View className="mb-8">
                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-[2px] mb-4 ml-1">Saved Addresses</Text>
                {DUMMY_SAVED_ADDRESSES.map(addr => (
                  <SavedAddressItem
                    key={addr.id}
                    label={addr.label}
                    address={addr.address}
                    onPress={() => {
                      onLocationSelect(addr.address, addr.location);
                      onClose();
                    }}
                  />
                ))}
              </View>

              <View className="h-[1px] bg-white/5 mb-8" />

              <AddressAutocomplete
                label="Search for an area"
                placeholder="Type your area, building or city..."
                onAddressSelect={(address, coords) => {
                  if (coords) {
                    onLocationSelect(address, { lat: coords.lat, lng: coords.lng });
                    onClose();
                  }
                }}
              />

              <View className="mt-10 items-center">
                <View className="w-12 h-1 bg-white/10 rounded-full mb-6" />
                <MapPin size={48} color="#13131A" />
                <Text className="text-textSecondary text-center mt-4 px-10 text-xs font-medium">
                  Changing your location will show you services and professionals available in that specific area.
                </Text>
              </View>
            </ScrollView>

          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}
