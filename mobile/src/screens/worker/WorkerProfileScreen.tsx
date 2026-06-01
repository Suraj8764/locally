import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { ChevronRight, Settings, LogOut, FileText, HelpCircle, User, MapPin, Phone, Mail, Building2, MessageCircle } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useWorker } from '../../hooks/useWorkers';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';

export function WorkerProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const { data: worker } = useWorker(user?.id);
  
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    displayName: worker?.displayName || '',
    phoneE164: worker?.phoneE164 || '',
    whatsappE164: worker?.whatsappE164 || '',
    localityLabel: worker?.localityLabel || '',
    areaCoverageKm: worker?.areaCoverageKm?.toString() || '',
    workingHoursLabel: worker?.workingHoursLabel || '',
    bankAccountNumber: '',
    bankIfsc: '',
    bankName: '',
  });

  const handleSave = async () => {
    Alert.alert('Success', 'Details updated successfully');
    setEditingSection(null);
  };

  return (
    <View className="flex-1 bg-background">
      <View className="pt-14 px-4 pb-6 bg-surface border-b border-border">
        <Text className="text-2xl font-extrabold text-white mb-6">Partner Profile</Text>
        <View className="flex-row items-center">
          <Avatar url={worker?.profileImage} name={worker?.displayName || 'Worker'} size={64} />
          <View className="ml-4 flex-1">
            <Text className="text-xl font-bold text-white mb-1">{worker?.displayName || 'Worker'}</Text>
            <Text className="text-accent text-sm font-bold">{worker?.categoryId?.toUpperCase()}</Text>
            <Text className="text-textSecondary mt-1 text-xs">{worker?.phoneE164}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <Text className="text-textSecondary font-bold uppercase tracking-wider text-xs mb-3 ml-2">
          Account Settings
        </Text>
        <View className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
          <Pressable 
            className="flex-row items-center p-4 border-b border-border"
            onPress={() => setEditingSection('personal')}
          >
            <FileText size={20} color="#8E8E93" />
            <Text className="text-white flex-1 ml-3 font-bold">Personal Details</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
          <Pressable 
            className="flex-row items-center p-4 border-b border-border"
            onPress={() => setEditingSection('service')}
          >
            <Settings size={20} color="#8E8E93" />
            <Text className="text-white flex-1 ml-3 font-bold">Service Preferences</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
          <Pressable 
            className="flex-row items-center p-4 border-b border-border"
            onPress={() => setEditingSection('bank')}
          >
            <Text className="text-xl w-5 items-center justify-center text-center">🏦</Text>
            <Text className="text-white flex-1 ml-3 font-bold">Bank Details</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
        </View>

        {editingSection === 'personal' && (
          <View className="bg-surface border border-border rounded-2xl p-4 mb-6">
            <Text className="text-white font-bold mb-4">Personal Details</Text>
            <View className="space-y-4">
              <View>
                <Text className="text-textSecondary text-sm mb-2">Display Name</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-white"
                  value={formData.displayName}
                  onChangeText={(text) => setFormData({ ...formData, displayName: text })}
                />
              </View>
              <View>
                <Text className="text-textSecondary text-sm mb-2">Phone Number</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-white"
                  value={formData.phoneE164}
                  onChangeText={(text) => setFormData({ ...formData, phoneE164: text })}
                  keyboardType="phone-pad"
                />
              </View>
              <View>
                <Text className="text-textSecondary text-sm mb-2">WhatsApp Number</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-white"
                  value={formData.whatsappE164}
                  onChangeText={(text) => setFormData({ ...formData, whatsappE164: text })}
                  keyboardType="phone-pad"
                />
              </View>
              <Button title="Save Changes" onPress={handleSave} />
              <Button title="Cancel" variant="ghost" onPress={() => setEditingSection(null)} />
            </View>
          </View>
        )}

        {editingSection === 'service' && (
          <View className="bg-surface border border-border rounded-2xl p-4 mb-6">
            <Text className="text-white font-bold mb-4">Service Preferences</Text>
            <View className="space-y-4">
              <View>
                <Text className="text-textSecondary text-sm mb-2">Area/Locality</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-white"
                  value={formData.localityLabel}
                  onChangeText={(text) => setFormData({ ...formData, localityLabel: text })}
                />
              </View>
              <View>
                <Text className="text-textSecondary text-sm mb-2">Area Coverage (km)</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-white"
                  value={formData.areaCoverageKm}
                  onChangeText={(text) => setFormData({ ...formData, areaCoverageKm: text })}
                  keyboardType="number-pad"
                />
              </View>
              <View>
                <Text className="text-textSecondary text-sm mb-2">Working Hours</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-white"
                  value={formData.workingHoursLabel}
                  onChangeText={(text) => setFormData({ ...formData, workingHoursLabel: text })}
                  placeholder="e.g., 9 AM - 6 PM"
                />
              </View>
              <Button title="Save Changes" onPress={handleSave} />
              <Button title="Cancel" variant="ghost" onPress={() => setEditingSection(null)} />
            </View>
          </View>
        )}

        {editingSection === 'bank' && (
          <View className="bg-surface border border-border rounded-2xl p-4 mb-6">
            <Text className="text-white font-bold mb-4">Bank Details</Text>
            <View className="space-y-4">
              <View>
                <Text className="text-textSecondary text-sm mb-2">Bank Name</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-white"
                  value={formData.bankName}
                  onChangeText={(text) => setFormData({ ...formData, bankName: text })}
                  placeholder="e.g., State Bank of India"
                />
              </View>
              <View>
                <Text className="text-textSecondary text-sm mb-2">Account Number</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-white"
                  value={formData.bankAccountNumber}
                  onChangeText={(text) => setFormData({ ...formData, bankAccountNumber: text })}
                  keyboardType="number-pad"
                  secureTextEntry
                />
              </View>
              <View>
                <Text className="text-textSecondary text-sm mb-2">IFSC Code</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-white"
                  value={formData.bankIfsc}
                  onChangeText={(text) => setFormData({ ...formData, bankIfsc: text })}
                  placeholder="e.g., SBIN0001234"
                  autoCapitalize="characters"
                />
              </View>
              <Button title="Save Bank Details" onPress={handleSave} />
              <Button title="Cancel" variant="ghost" onPress={() => setEditingSection(null)} />
            </View>
          </View>
        )}

        <Text className="text-textSecondary font-bold uppercase tracking-wider text-xs mb-3 ml-2">
          Support
        </Text>
        <View className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
          <Pressable 
            className="flex-row items-center p-4 border-b border-border"
            onPress={() => Alert.alert('Partner Support', 'Contact us at support@sebalink.com or call +91-XXXXXXXXXX')}
          >
            <HelpCircle size={20} color="#8E8E93" />
            <Text className="text-white flex-1 ml-3 font-bold">Partner Support</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
          <Pressable 
            className="flex-row items-center p-4"
            onPress={() => Alert.alert('Contact Options', 'Email: support@sebalink.com\nPhone: +91-XXXXXXXXXX\nWhatsApp: +91-XXXXXXXXXX')}
          >
            <MessageCircle size={20} color="#8E8E93" />
            <Text className="text-white flex-1 ml-3 font-bold">Contact Us</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
        </View>

        <Pressable 
          onPress={logout}
          className="bg-error/10 border border-error/30 flex-row items-center justify-center p-4 rounded-2xl mb-10"
        >
          <LogOut size={20} color="#FF453A" />
          <Text className="text-error font-bold ml-2">Log Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
