
import React from 'react';
import { View, StyleSheet, Alert, Pressable, Text } from 'react-native';
import { useCreateBooking } from '../../hooks/useBooking';
import { useLocation } from '../../hooks/useLocation';
import { BookingForm } from '../../components/booking/BookingForm';
import { X } from 'lucide-react-native';

export function BookingSheet({ navigation, route }: any) {
  const { workerId, categoryId, basePrice } = route?.params || {};
  const { coords } = useLocation();
  const { mutate: createBooking, isPending } = useCreateBooking();

  const handleBookingSubmit = (data: any) => {
    createBooking(
      {
        workerId,
        categoryId,
        address: data.address,
        problemDescription: data.problemDescription,
        location: coords || { lat: 0, lng: 0 },
        isEmergency: data.isEmergency,
        scheduledAtMs: data.date.getTime() + (data.time.getTime() % (24 * 60 * 60 * 1000)),
        imageUri: data.imageUri,
      },
      {
        onSuccess: (booking) => {
          navigation.goBack();
          navigation.navigate('BookingStatus', { 
            bookingId: booking.id,
            status: 'pending'
          });
        },
        onError: () => {
          Alert.alert('Error', 'Failed to create booking. Try again.');
        }
      }
    );
  };


  return (
    <View className="flex-1 bg-black/85 justify-end relative">
      {/* Dimmed backdrop area (tap to close) */}
      <Pressable 
        className="absolute inset-0"
        onPress={() => navigation.goBack()}
      />

      {/* Premium Hyperlocal Custom Bottom Sheet Dialog */}
      <View 
        style={{ height: '90%' }}
        className="w-full bg-[#0A0A0F] rounded-t-[44px] border-t border-white/10 pt-4 pb-8 relative shadow-2xl shadow-black"
      >
        {/* Mock Grab Handle indicator */}
        <View className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />

        {/* Floating Close Button */}
        <Pressable 
          onPress={() => navigation.goBack()}
          className="absolute top-6 right-6 w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/5 z-20 active:bg-white/10"
        >
          <X size={20} color="#8E8E93" />
        </Pressable>

        <View className="flex-1">
          <BookingForm 
            onSubmit={handleBookingSubmit}
            basePrice={basePrice || 149}
            isSubmitting={isPending}
          />
        </View>
      </View>
    </View>
  );
}

export default BookingSheet;
