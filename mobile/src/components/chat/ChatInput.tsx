import React, { useState } from 'react';
import { View, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Send, Image as ImageIcon, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ChatInputProps {
  onSend: (message: string) => void;
  onType: (isTyping: boolean) => void;
}

export function ChatInput({ onSend, onType }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
      onType(false);
    }
  };

  return (
    <View className="px-6 pb-8 pt-4 bg-background/80 backdrop-blur-xl border-t border-white/5">
      <View className="flex-row items-center gap-3">
        <Pressable className="w-11 h-11 bg-surface border border-white/10 rounded-2xl items-center justify-center">
          <Plus size={20} color="#8E8E93" />
        </Pressable>
        
        <View className="flex-1 bg-surface border border-white/10 rounded-2xl px-4 py-2 flex-row items-center">
          <TextInput
            className="flex-1 text-white text-base py-2 max-h-32"
            placeholder="Type a message..."
            placeholderTextColor="#8E8E93"
            multiline
            value={message}
            onChangeText={(text) => {
              setMessage(text);
              onType(text.length > 0);
            }}
          />
          <Pressable onPress={() => {}} className="ml-2">
            <ImageIcon size={20} color="#8E8E93" />
          </Pressable>
        </View>

        <Pressable onPress={handleSend} disabled={!message.trim()}>
          <LinearGradient
            colors={message.trim() ? ['#E8294C', '#FF453A'] : ['#1C1C1E', '#1C1C1E']}
            className="w-11 h-11 rounded-2xl items-center justify-center shadow-lg"
          >
            <Send size={20} color={message.trim() ? '#FFF' : '#3A3A3C'} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}
