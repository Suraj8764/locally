import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';

export function OTPScreen({ navigation, route }: any) {
  const { phone, role } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  const { setToken, setRole, setUser } = useAuthStore();

  useEffect(() => {
    if (timer > 0) {
      const id = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [timer]);

  const handleVerify = async () => {
    if (code.length < 6) return;
    
    setError('');
    setLoading(true);
    
    try {
      const res = await authService.verifyOTP(phone, code, role);
      setToken(res.token);
      setRole(role);
      setUser(res.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
      setCode('');
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(60);
    setError('');
    try {
      await authService.sendOTP(phone);
      Alert.alert('OTP Sent', 'A new code has been sent to your phone.');
    } catch (err: any) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-background" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 px-6 pt-24 pb-10">
        <View className="mb-10">
          <Text className="text-3xl font-extrabold text-white mb-2">Verify Phone</Text>
          <Text className="text-textSecondary text-base">
            Code sent to <Text className="text-white font-bold">{phone}</Text>
          </Text>
        </View>

        <View className="bg-surface border border-border rounded-xl px-4 py-1 mb-2">
          <TextInput
            ref={inputRef}
            className="text-center text-3xl tracking-[12px] font-bold text-white py-3 h-16"
            placeholder="000000"
            placeholderTextColor="#8E8E93"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={(text) => {
              setCode(text);
              setError('');
              if (text.length === 6) {
                // Auto verify when 6 digits are entered
                // Needs a slight delay to allow state to update
                setTimeout(() => {}, 10);
              }
            }}
            autoFocus
          />
        </View>

        {error ? <Text className="text-error text-sm text-center mb-6">{error}</Text> : null}

        <View className="flex-1" />

        <View className="items-center mb-6">
          {timer > 0 ? (
            <Text className="text-textSecondary">Resend code in {timer}s</Text>
          ) : (
            <Button title="Resend Code" variant="ghost" onPress={handleResend} />
          )}
        </View>

        <Button 
          title="Verify & Continue" 
          onPress={handleVerify} 
          loading={loading}
          disabled={code.length < 6}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
