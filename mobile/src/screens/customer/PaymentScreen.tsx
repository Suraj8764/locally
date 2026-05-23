import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Image } from 'react-native';
import { ChevronLeft, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PaymentSelector } from '../../components/booking/PaymentSelector';
import { paymentService } from '../../services/PaymentService';
import { PaymentMethod } from '../../types';

export function PaymentScreen({ navigation, route }: any) {
  const { bookingId, amount = 149, categoryId = 'service', isEmergency = false } = route?.params || {};
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const basePrice = amount;
  const emergencyFee = isEmergency ? 150 : 0;
  const totalPrice = basePrice + emergencyFee;

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const success = await paymentService.initiatePayment({
        amount: totalPrice,
        currency: 'INR',
        bookingId: bookingId,
      });

      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          // Redirect to booking status screen
          navigation.replace('BookingStatus', { bookingId });
        }, 1500);
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during payment.');
    } finally {
      if (!isSuccess) setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <View className="flex-1 bg-[#0A0A0F] items-center justify-center px-6">
        <LinearGradient
          colors={['rgba(48, 209, 88, 0.1)', 'transparent']}
          className="absolute inset-0"
        />
        <View className="w-24 h-24 bg-onlineGreen/10 border border-onlineGreen/30 rounded-full items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 size={48} color="#30D158" />
        </View>
        <Text className="text-white text-3xl font-black tracking-tight mb-2">Payment Successful</Text>
        <Text className="text-textSecondary text-sm text-center mb-8">
          Your booking is confirmed! Redirecting to tracking screen...
        </Text>
        <ActivityIndicator size="small" color="#30D158" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0A0A0F] relative">
      {/* Background Glow */}
      <View className="absolute top-0 left-0 right-0 h-64 opacity-20">
        <LinearGradient colors={['#E8294C', 'transparent']} className="flex-1" />
      </View>

      {/* Header */}
      <View className="pt-14 px-6 pb-4 flex-row items-center justify-between z-10">
        <Pressable 
          onPress={() => navigation.goBack()}
          className="w-12 h-12 bg-surface border border-white/5 rounded-2xl items-center justify-center active:bg-white/10"
        >
          <ChevronLeft size={24} color="#FFF" />
        </Pressable>
        <Text className="text-white text-lg font-black uppercase tracking-wider">Payment Details</Text>
        <View className="w-12" />
      </View>

      <View className="flex-1 px-6 pt-4">
        {/* Bill Summary */}
        <View className="bg-surface border border-white/5 p-6 rounded-[32px] mb-8">
          <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-[2px] mb-4">Bill Details</Text>
          
          <View className="flex-row justify-between mb-3">
             <Text className="text-textPrimary text-sm font-semibold capitalize">{categoryId} Fee</Text>
             <Text className="text-white font-bold text-sm">₹{basePrice}</Text>
          </View>

          {isEmergency && (
             <View className="flex-row justify-between mb-3">
               <Text className="text-error text-sm font-semibold">SOS Emergency Fee</Text>
               <Text className="text-error font-bold text-sm">+ ₹{emergencyFee}</Text>
             </View>
          )}

          <View className="h-[1px] bg-white/5 my-4" />

          <View className="flex-row justify-between items-baseline">
             <Text className="text-white font-black text-base">Total Amount</Text>
             <Text className="text-accent font-black text-2xl">₹{totalPrice}</Text>
          </View>
        </View>

        {/* Secure badge */}
        <View className="flex-row items-center gap-3 bg-surface/50 border border-white/5 px-5 py-3 rounded-2xl mb-8">
          <ShieldCheck size={18} color="#30D158" />
          <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-wider">
            100% Encrypted & Secure Gateway
          </Text>
        </View>

        {/* Payment Selector */}
        <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-[2px] mb-4 ml-2">Choose Payment Option</Text>
        <PaymentSelector 
          selected={selectedMethod}
          onSelect={setSelectedMethod}
        />
      </View>

      {/* Action Footer */}
      <View className="p-6 pb-10">
        <Pressable 
          onPress={handlePay}
          disabled={isProcessing}
        >
          <LinearGradient
            colors={['#E8294C', '#FF453A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="h-16 rounded-[24px] items-center justify-center shadow-xl shadow-accent/40 flex-row gap-3"
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text className="text-white font-black text-base uppercase tracking-[3px]">
                Pay ₹{totalPrice}
              </Text>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

export default PaymentScreen;
