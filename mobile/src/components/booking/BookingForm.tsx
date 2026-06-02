import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Platform, ScrollView, Image as RNImage } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Clock, Camera, AlertTriangle, MapPin, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { FormInput } from '../ui/FormInput';
import { AddressAutocomplete } from '../ui/AddressAutocomplete';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const bookingSchema = z.object({
  address: z.string().min(10, 'Address must be at least 10 characters'),
  problemDescription: z.string().min(5, 'Please describe the problem'),
  date: z.date().min(new Date(), 'Date cannot be in the past'),
  time: z.date(),
  isEmergency: z.boolean(),
  imageUri: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  basePrice?: number;
  isSubmitting?: boolean;
}

export function BookingForm({ onSubmit, basePrice = 199, isSubmitting }: BookingFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      address: '',
      problemDescription: '',
      date: new Date(),
      time: new Date(),
      isEmergency: false,
    },
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Array<{ id: string; label: string; address: string }>>([]);

  const watchDate = watch('date');
  const watchTime = watch('time');
  const watchEmergency = watch('isEmergency');
  const watchImage = watch('imageUri');

  const totalPrice = watchEmergency ? basePrice + 150 : basePrice;

  // Load saved addresses from AsyncStorage
  useEffect(() => {
    loadSavedAddresses();
  }, []);

  const loadSavedAddresses = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedAddresses');
      if (saved) {
        setSavedAddresses(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load saved addresses:', e);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setValue('imageUri', result.assets[0].uri);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="px-6 pb-20">
      <View className="mb-6 mt-2">
         <Text className="text-white text-2xl font-black tracking-tight mb-1">{t('bookService')}</Text>
         <Text className="text-textSecondary text-xs">{t('fillDetails')}</Text>
      </View>

      <View className="mb-6">
        <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-[2px] mb-3 ml-1">{t('quickSelect')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
          {savedAddresses.length > 0 ? (
            savedAddresses.map((addr: { id: string; label: string; address: string }) => (
              <Pressable 
                key={addr.id}
                onPress={() => setValue('address', addr.address)}
                className="mr-3 bg-surface border border-white/5 px-5 py-3 rounded-2xl flex-row items-center gap-2"
              >
                <Text className="text-white font-bold text-xs">{addr.label}</Text>
              </Pressable>
            ))
          ) : (
            <Text className="text-textSecondary text-xs">No saved addresses</Text>
          )}
        </ScrollView>
      </View>

      <AddressAutocomplete 
        label={t('serviceLocation')}
        placeholder={t('searchLocation')}
        onAddressSelect={(address) => setValue('address', address)}
        error={errors.address?.message}
      />

      <FormInput<BookingFormData> 
        name="problemDescription"
        control={control}
        label={t('whatsIssue')}
        placeholder={t('describeProblem')}
        error={errors.problemDescription?.message}
        multiline
        numberOfLines={3}
        className="h-24"
      />

      <View className="flex-row gap-4 mb-6">
        {Platform.OS === 'web' ? (
          <>
            <View className="flex-1 bg-surface border border-white/10 rounded-2xl p-4">
              <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-2">{t('date')}</Text>
              <input
                type="date"
                value={watchDate && !isNaN(watchDate.getTime()) ? format(watchDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setValue('date', new Date(e.target.value))}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="text-textPrimary font-bold bg-transparent w-full"
                style={{ color: '#F5F5F7', fontSize: 16, padding: 8 }}
              />
            </View>

            <View className="flex-1 bg-surface border border-white/10 rounded-2xl p-4">
              <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-2">{t('time')}</Text>
              <input
                type="time"
                value={watchTime && !isNaN(watchTime.getTime()) ? format(watchTime, 'HH:mm') : '12:00'}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newTime = new Date();
                  newTime.setHours(parseInt(hours || '12'), parseInt(minutes || '0'));
                  setValue('time', newTime);
                }}
                className="text-textPrimary font-bold bg-transparent w-full"
                style={{ color: '#F5F5F7', fontSize: 16, padding: 8 }}
              />
            </View>
          </>
        ) : (
          <>
            <Pressable 
              onPress={() => setShowDatePicker(true)}
              className="flex-1 bg-surface border border-white/10 rounded-2xl p-4 items-center justify-center"
            >
              <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-1.5 self-start">{t('date')}</Text>
              <View className="flex-row items-center gap-2 w-full justify-center">
                <Calendar size={16} color="#E8294C" />
                <Text className="text-textPrimary font-bold text-center">{format(watchDate, 'MMM dd, yyyy')}</Text>
              </View>
            </Pressable>

            <Pressable 
              onPress={() => setShowTimePicker(true)}
              className="flex-1 bg-surface border border-white/10 rounded-2xl p-4 items-center justify-center"
            >
              <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-1.5 self-start">{t('time')}</Text>
              <View className="flex-row items-center gap-2 w-full justify-center">
                <Clock size={16} color="#E8294C" />
                <Text className="text-textPrimary font-bold text-center">{format(watchTime, 'hh:mm a')}</Text>
              </View>
            </Pressable>
          </>
        )}
      </View>

      {Platform.OS !== 'web' && showDatePicker && (
        <DateTimePicker
          value={watchDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setValue('date', selectedDate);
          }}
          minimumDate={new Date()}
        />
      )}

      {Platform.OS !== 'web' && showTimePicker && (
        <DateTimePicker
          value={watchTime}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) setValue('time', selectedTime);
          }}
        />
      )}

      <ProfileSection title={t('photosOptional')} className="mb-6">
        {watchImage ? (
          <View className="relative w-full h-48 rounded-3xl overflow-hidden border border-white/10">
            <RNImage source={{ uri: watchImage }} className="w-full h-full" />
            <Pressable 
              onPress={() => setValue('imageUri', undefined)}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full items-center justify-center"
            >
              <X size={18} color="#FFF" />
            </Pressable>
          </View>
        ) : (
          <Pressable 
            onPress={pickImage}
            className="bg-surface border border-white/10 border-dashed rounded-3xl h-32 items-center justify-center"
          >
            <View className="w-12 h-12 bg-background rounded-full items-center justify-center mb-2">
               <Camera size={24} color="#8E8E93" />
            </View>
            <Text className="text-textSecondary text-xs font-bold uppercase tracking-widest">{t('tapUpload')}</Text>
          </Pressable>
        )}
      </ProfileSection>

      <Pressable 
        onPress={() => setValue('isEmergency', !watchEmergency)}
        className={`p-5 rounded-3xl flex-row items-center justify-between border ${
          watchEmergency ? 'bg-error/10 border-error/50 shadow-lg shadow-error/20' : 'bg-surface border-white/5'
        } mb-8`}
      >
        <View className="flex-row items-center flex-1 pr-4">
          <View className={`w-10 h-10 rounded-2xl items-center justify-center ${watchEmergency ? 'bg-error/20' : 'bg-background'}`}>
            <AlertTriangle size={20} color={watchEmergency ? "#FF453A" : "#8E8E93"} />
          </View>
          <View className="ml-4">
            <Text className={`font-black uppercase tracking-tight text-sm ${watchEmergency ? 'text-error' : 'text-white'}`}>
              {t('emergencySOS')}
            </Text>
            <Text className={`text-[10px] font-bold ${watchEmergency ? 'text-error/80' : 'text-textSecondary'}`}>
              {t('emergencyDesc')}
            </Text>
          </View>
        </View>
        <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
          watchEmergency ? 'border-error bg-error' : 'border-white/10 bg-transparent'
        }`}>
          {watchEmergency && <Text className="text-white text-[10px] font-black">✓</Text>}
        </View>
      </Pressable>

      <Pressable 
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        <LinearGradient
          colors={['#E8294C', '#FF453A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="h-16 rounded-[24px] items-center justify-center shadow-xl shadow-accent/40"
        >
          <Text className="text-white font-black text-base uppercase tracking-[3px]">
            {isSubmitting ? t('confirming') : t('confirmBooking')}
          </Text>
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}

// Re-using ProfileSection component
import { ProfileSection } from '../worker/ProfileSection';
