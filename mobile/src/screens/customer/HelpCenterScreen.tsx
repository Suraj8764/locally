import React from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { ChevronRight, Phone, Mail, MessageCircle, ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export function HelpCenterScreen({ navigation }: any) {
  const { t } = useTranslation();

  const helpTopics = [
    {
      id: 'booking',
      title: 'How to Book a Service',
      description: 'Learn how to find and book workers for your needs',
      icon: '📋',
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      description: 'Understand our payment options and security',
      icon: '💳',
    },
    {
      id: 'cancellation',
      title: 'Cancellation Policy',
      description: 'How to cancel bookings and refund process',
      icon: '❌',
    },
    {
      id: 'safety',
      title: 'Safety Guidelines',
      description: 'Tips for safe interactions with workers',
      icon: '🛡️',
    },
    {
      id: 'worker',
      title: 'Become a Worker',
      description: 'Register as a service provider and earn money',
      icon: '👷',
    },
    {
      id: 'emergency',
      title: 'Emergency Services',
      description: 'Quick access to emergency contacts',
      icon: '🚨',
    },
  ];

  const contactOptions = [
    {
      id: 'phone',
      title: 'Call Support',
      description: '+91 XXXXX XXXXX',
      icon: Phone,
      action: () => Linking.openURL('tel:+91XXXXXXXXXX'),
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Support',
      description: 'Chat with us on WhatsApp',
      icon: MessageCircle,
      action: () => Linking.openURL('https://wa.me/91XXXXXXXXXX'),
    },
    {
      id: 'email',
      title: 'Email Support',
      description: 'support@sebalink.com',
      icon: Mail,
      action: () => Linking.openURL('mailto:support@sebalink.com'),
    },
  ];

  const handleTopicPress = (topic: any) => {
    // TODO: Navigate to detailed help topic screen
    console.log('Topic pressed:', topic.id);
  };

  return (
    <View className="flex-1 bg-background">
      <View className="pt-14 px-6 pb-6 bg-surface border-b border-white/5">
        <View className="flex-row items-center">
          <Pressable onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-4">
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>
          <Text className="text-2xl font-black text-white">Help Center</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View className="bg-surface border border-border rounded-2xl p-4 mb-6">
          <Text className="text-textSecondary text-sm">Search for help...</Text>
        </View>

        {/* Help Topics */}
        <Text className="text-textSecondary font-black uppercase tracking-[2px] text-[10px] mb-4 ml-1">
          Popular Topics
        </Text>
        <View className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
          {helpTopics.map((topic, index) => (
            <Pressable
              key={topic.id}
              onPress={() => handleTopicPress(topic)}
              className={`flex-row items-center p-4 ${index !== helpTopics.length - 1 ? 'border-b border-border' : ''}`}
            >
              <Text className="text-2xl mr-4">{topic.icon}</Text>
              <View className="flex-1">
                <Text className="text-white font-bold">{topic.title}</Text>
                <Text className="text-textSecondary text-xs mt-1">{topic.description}</Text>
              </View>
              <ChevronRight size={20} color="#8E8E93" />
            </Pressable>
          ))}
        </View>

        {/* Contact Options */}
        <Text className="text-textSecondary font-black uppercase tracking-[2px] text-[10px] mb-4 ml-1">
          Contact Us
        </Text>
        <View className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
          {contactOptions.map((option, index) => (
            <Pressable
              key={option.id}
              onPress={option.action}
              className={`flex-row items-center p-4 ${index !== contactOptions.length - 1 ? 'border-b border-border' : ''}`}
            >
              <View className="w-10 h-10 rounded-full bg-accent/20 items-center justify-center mr-4">
                <option.icon size={20} color="#E8294C" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold">{option.title}</Text>
                <Text className="text-textSecondary text-xs mt-1">{option.description}</Text>
              </View>
              <ChevronRight size={20} color="#8E8E93" />
            </Pressable>
          ))}
        </View>

        {/* FAQ Section */}
        <Text className="text-textSecondary font-black uppercase tracking-[2px] text-[10px] mb-4 ml-1">
          FAQ
        </Text>
        <View className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
          <Pressable className="flex-row items-center p-4 border-b border-border">
            <View className="flex-1">
              <Text className="text-white font-bold">How do I book a worker?</Text>
              <Text className="text-textSecondary text-xs mt-1">Search for a service, select a worker, and click "Book Now"</Text>
            </View>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
          <Pressable className="flex-row items-center p-4 border-b border-border">
            <View className="flex-1">
              <Text className="text-white font-bold">How do I cancel a booking?</Text>
              <Text className="text-textSecondary text-xs mt-1">Go to Bookings tab, select the booking, and tap Cancel</Text>
            </View>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
          <Pressable className="flex-row items-center p-4">
            <View className="flex-1">
              <Text className="text-white font-bold">Is my payment information safe?</Text>
              <Text className="text-textSecondary text-xs mt-1">Yes, we use secure payment gateways and encryption</Text>
            </View>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
        </View>

        {/* App Info */}
        <View className="bg-surface border border-border rounded-2xl p-6 items-center mb-6">
          <Text className="text-white font-black text-lg mb-2">SebaLink</Text>
          <Text className="text-textSecondary text-sm mb-1">Version 1.0.0</Text>
          <Text className="text-textSecondary text-xs">Your trusted hyperlocal service platform</Text>
        </View>
      </ScrollView>
    </View>
  );
}
