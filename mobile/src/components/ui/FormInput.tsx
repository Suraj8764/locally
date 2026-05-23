import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';

interface FormInputProps<T extends FieldValues> extends TextInputProps {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  error?: string;
  className?: string;
}

export function FormInput<T extends FieldValues>({ 
  name, 
  control, 
  label, 
  error, 
  className = '', 
  ...props 
}: FormInputProps<T>) {
  return (
    <View className={`mb-5 ${className}`}>
      {label && (
        <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">
          {label}
        </Text>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className={`bg-surface border ${error ? 'border-error/50' : 'border-white/10'} rounded-2xl px-4 py-1 shadow-sm`}>
            <TextInput
              className="text-textPrimary text-base py-3"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholderTextColor="#8E8E93"
              {...props}
            />
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
