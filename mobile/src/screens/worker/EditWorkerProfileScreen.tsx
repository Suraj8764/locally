import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { ChevronLeft, Camera, Plus, X, Save } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/ui/Avatar';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInUp } from 'react-native-reanimated';

export function EditWorkerProfileScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [bio, setBio] = useState('Experienced electrician with 5+ years of experience in residential and commercial wiring.');
  const [hourlyRate, setHourlyRate] = useState('450');
  const [skills, setSkills] = useState(['House Wiring', 'Circuit Repair', 'AC Installation']);
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSave = () => {
    // Simulate API call
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="pt-14 px-6 pb-6 bg-surface border-b border-white/5 flex-row items-center justify-between">
         <Pressable onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/5 rounded-full items-center justify-center">
            <ChevronLeft size={20} color="#FFF" />
         </Pressable>
         <Text className="text-white text-xl font-black">Edit Profile</Text>
         <Pressable onPress={handleSave} className="bg-accent/10 px-4 py-2 rounded-xl border border-accent/20">
            <Text className="text-accent font-black text-xs uppercase tracking-widest">Save</Text>
         </Pressable>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 pt-10" showsVerticalScrollIndicator={false}>
           <View className="items-center mb-10">
              <View>
                 <Avatar url={user?.profileImage} name={user?.displayName || 'Pro'} size={100} />
                 <Pressable className="absolute bottom-0 right-0 w-10 h-10 bg-accent rounded-full items-center justify-center border-4 border-background">
                    <Camera size={16} color="#FFF" />
                 </Pressable>
              </View>
              <Text className="text-textSecondary text-[10px] font-black uppercase tracking-[2px] mt-4">Change Profile Photo</Text>
           </View>

           <Animated.View entering={FadeInUp.delay(100)} className="mb-8">
              <Text className="text-textSecondary text-[10px] font-black uppercase tracking-[2px] mb-4 ml-1">About Me / Bio</Text>
              <View className="bg-surface border border-white/5 rounded-[32px] p-6">
                 <TextInput 
                   className="text-white text-base py-2 min-h-[120px]"
                   placeholder="Describe your expertise..."
                   placeholderTextColor="#8E8E93"
                   multiline
                   value={bio}
                   onChangeText={setBio}
                 />
              </View>
           </Animated.View>

           <Animated.View entering={FadeInUp.delay(200)} className="mb-8">
              <Text className="text-textSecondary text-[10px] font-black uppercase tracking-[2px] mb-4 ml-1">Hourly Rate (₹)</Text>
              <View className="bg-surface border border-white/5 rounded-3xl px-6 py-4">
                 <TextInput 
                   className="text-white text-xl font-black py-2"
                   placeholder="e.g. 500"
                   placeholderTextColor="#8E8E93"
                   keyboardType="numeric"
                   value={hourlyRate}
                   onChangeText={setHourlyRate}
                 />
              </View>
           </Animated.View>

           <Animated.View entering={FadeInUp.delay(300)} className="mb-20">
              <Text className="text-textSecondary text-[10px] font-black uppercase tracking-[2px] mb-4 ml-1">Specialized Skills</Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                 {skills.map(skill => (
                   <View key={skill} className="bg-surface border border-white/5 px-4 py-2 rounded-full flex-row items-center gap-2">
                      <Text className="text-white text-xs font-bold">{skill}</Text>
                      <Pressable onPress={() => removeSkill(skill)}>
                         <X size={14} color="#8E8E93" />
                      </Pressable>
                   </View>
                 ))}
              </View>
              <View className="flex-row gap-2">
                 <View className="flex-1 bg-surface border border-white/5 rounded-2xl px-4 py-2">
                    <TextInput 
                      className="text-white text-sm py-1"
                      placeholder="Add a skill..."
                      placeholderTextColor="#8E8E93"
                      value={newSkill}
                      onChangeText={setNewSkill}
                    />
                 </View>
                 <Pressable 
                   onPress={addSkill}
                   className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl items-center justify-center"
                 >
                    <Plus size={20} color="#E8294C" />
                 </Pressable>
              </View>
           </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
