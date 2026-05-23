import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/auth';

export function LoginScreen({ navigation, route }: any) {
  const role = route.params?.role || 'customer';
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit number');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const phoneE164 = `+91${cleanPhone.slice(-10)}`;
      await authService.sendOTP(phoneE164);
      navigation.navigate('OTP', { phone: phoneE164, role });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-background" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 px-6 pt-24 pb-10">
        <View className="mb-10">
          <Text className="text-3xl font-extrabold text-white mb-2">Enter your phone</Text>
          <Text className="text-textSecondary text-base">
            We will send you a 6-digit verification code.
          </Text>
        </View>

        <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-1 mb-2">
          <Text className="text-lg font-bold text-textPrimary mr-3 border-r border-border pr-3 py-3">
            🇮🇳 +91
          </Text>
          <TextInput
            className="flex-1 text-lg font-bold text-white py-3 h-14"
            placeholder="99999 99999"
            placeholderTextColor="#8E8E93"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setError('');
            }}
            autoFocus
          />
        </View>

        {error ? <Text className="text-error text-sm mb-6 pl-1">{error}</Text> : null}

        <View className="flex-1" />

        <Button 
          title="Send Code" 
          onPress={handleSendOTP} 
          loading={loading}
          disabled={phone.length < 10}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
