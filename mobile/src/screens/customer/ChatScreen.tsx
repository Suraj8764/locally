import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { ChevronLeft, Phone, Info } from 'lucide-react-native';
import { useSocket, useSocketEvent } from '../../hooks/useSocket';
import { useAuthStore } from '../../store/authStore';
import { ChatInput } from '../../components/chat/ChatInput';
import { Avatar } from '../../components/ui/Avatar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

export function ChatScreen({ navigation, route }: any) {
  const { bookingId, recipientName, recipientImage } = route.params;
  const { user } = useAuthStore();
  const socket = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (socket) {
      socket.emit('chat:join', { bookingId });
    }
  }, [socket, bookingId]);

  useSocketEvent('chat:message', (message: any) => {
    if (message.bookingId === bookingId) {
      setMessages(prev => [...prev, message]);
    }
  });

  useSocketEvent('chat:typing', (data: any) => {
    if (data.userId !== user?.id) {
      setIsTyping(data.isTyping);
    }
  });

  const sendMessage = (content: string) => {
    if (socket) {
      socket.emit('chat:message', { bookingId, content });
    }
  };

  const handleTyping = (typing: boolean) => {
    if (socket) {
      socket.emit('chat:typing', { bookingId, isTyping: typing });
    }
  };

  const renderMessage = ({ item, index }: { item: any, index: number }) => {
    const isMe = item.senderId === user?.id;
    const showAvatar = index === 0 || messages[index - 1].senderId !== item.senderId;

    return (
      <Animated.View 
        entering={FadeInUp.delay(50)}
        className={`mb-4 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}
      >
        {!isMe && (
          <View className="w-8 h-8 mr-2 justify-end">
            {showAvatar && <Avatar url={recipientImage} name={recipientName} size={28} />}
          </View>
        )}
        <View 
          className={`max-w-[75%] p-4 rounded-3xl ${
            isMe ? 'bg-accent rounded-tr-none' : 'bg-surface border border-white/5 rounded-tl-none'
          }`}
        >
          <Text className={`text-sm ${isMe ? 'text-white font-medium' : 'text-textPrimary'}`}>
            {item.content}
          </Text>
          <Text className={`text-[9px] mt-1 ${isMe ? 'text-white/60' : 'text-textSecondary'} font-bold uppercase`}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="pt-14 px-6 pb-4 flex-row items-center border-b border-white/5 bg-surface/50 backdrop-blur-xl">
        <Pressable onPress={() => navigation.goBack()} className="mr-4">
          <ChevronLeft size={24} color="#FFF" />
        </Pressable>
        <Avatar url={recipientImage} name={recipientName} size={40} />
        <View className="flex-1 ml-3">
          <Text className="text-white font-black text-base">{recipientName}</Text>
          <Text className="text-onlineGreen text-[10px] font-bold uppercase tracking-widest">
            {isTyping ? 'typing...' : 'Online'}
          </Text>
        </View>
        <View className="flex-row gap-4">
           <Pressable className="w-10 h-10 bg-white/5 rounded-full items-center justify-center">
             <Phone size={18} color="#FFF" />
           </Pressable>
           <Pressable className="w-10 h-10 bg-white/5 rounded-full items-center justify-center">
             <Info size={18} color="#FFF" />
           </Pressable>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        className="flex-1 px-6 pt-6"
        contentContainerStyle={{ paddingBottom: 20 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ChatInput onSend={sendMessage} onType={handleTyping} />
      </KeyboardAvoidingView>
    </View>
  );
}
