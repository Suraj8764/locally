import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Button } from '../../components/ui/Button';
import { api } from '../../api';
import { requestAndGetCurrentLocation } from '../../location';
import { useAuthStore } from '../../store/authStore';

export function WorkerRegistrationScreen({ navigation }: any) {
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [formData, setFormData] = useState({
    displayName: '',
    phoneE164: user?.phoneE164 || '',
    whatsappE164: '',
    categoryId: '',
    languages: [] as string[],
    experienceYears: '',
    localityLabel: '',
    areaCoverageKm: '5',
    workingHoursLabel: '',
    emergencyAvailable: false,
    profession: '',
    description: '',
    skills: '',
    estimatedStartingPrice: '',
    responseTimeMins: '',
  });
  
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadCategories();
    loadLocation();
  }, []);

  const loadCategories = async () => {
    try {
      setFetchingCategories(true);
      const cats = await api.categories.list();
      setCategories(cats);
    } catch (e) {
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setFetchingCategories(false);
    }
  };

  const loadLocation = async () => {
    try {
      const res = await requestAndGetCurrentLocation();
      if (res.status === 'granted' && res.coords) {
        setLocation(res.coords);
      }
    } catch (e) {
      console.error('Failed to get location:', e);
    }
  };

  const handleRegister = async () => {
    if (!formData.displayName || !formData.categoryId) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const worker = await api.workers.register({
        displayName: formData.displayName,
        phoneE164: formData.phoneE164,
        whatsappE164: formData.whatsappE164 || undefined,
        categoryId: formData.categoryId,
        languages: formData.languages,
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
        localityLabel: formData.localityLabel,
        areaCoverageKm: formData.areaCoverageKm ? parseInt(formData.areaCoverageKm) : undefined,
        location: location || undefined,
        workingHoursLabel: formData.workingHoursLabel,
        emergencyAvailable: formData.emergencyAvailable,
        profession: formData.profession,
        description: formData.description,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : undefined,
        estimatedStartingPrice: formData.estimatedStartingPrice ? parseInt(formData.estimatedStartingPrice) : undefined,
        responseTimeMins: formData.responseTimeMins ? parseInt(formData.responseTimeMins) : undefined,
      });

      Alert.alert('Success', 'Worker registration successful!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to register worker');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCategories) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#0B6E4F" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-background" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1 px-6 pt-24 pb-10">
        <View className="mb-6">
          <Text className="text-3xl font-extrabold text-white mb-2">Worker Registration</Text>
          <Text className="text-textSecondary text-base">
            Create your profile to start receiving job requests
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-textPrimary font-semibold mb-2">Full Name *</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-white"
              placeholder="Enter your full name"
              placeholderTextColor="#8E8E93"
              value={formData.displayName}
              onChangeText={(text) => setFormData({ ...formData, displayName: text })}
            />
          </View>

          <View>
            <Text className="text-textPrimary font-semibold mb-2">Phone Number *</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-white"
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor="#8E8E93"
              value={formData.phoneE164}
              onChangeText={(text) => setFormData({ ...formData, phoneE164: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View>
            <Text className="text-textPrimary font-semibold mb-2">WhatsApp Number</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-white"
              placeholder="+91 XXXXX XXXXX (optional)"
              placeholderTextColor="#8E8E93"
              value={formData.whatsappE164}
              onChangeText={(text) => setFormData({ ...formData, whatsappE164: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View>
            <Text className="text-textPrimary font-semibold mb-2">Service Category *</Text>
            <View className="flex-row flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  title={cat.label}
                  variant={formData.categoryId === cat.id ? 'primary' : 'ghost'}
                  onPress={() => setFormData({ ...formData, categoryId: cat.id })}
                />
              ))}
            </View>
          </View>

          <View>
            <Text className="text-textPrimary font-semibold mb-2">Profession</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-white"
              placeholder="e.g., Plumber, Electrician"
              placeholderTextColor="#8E8E93"
              value={formData.profession}
              onChangeText={(text) => setFormData({ ...formData, profession: text })}
            />
          </View>

          <View>
            <Text className="text-textPrimary font-semibold mb-2">Experience (Years)</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-white"
              placeholder="Years of experience"
              placeholderTextColor="#8E8E93"
              value={formData.experienceYears}
              onChangeText={(text) => setFormData({ ...formData, experienceYears: text })}
              keyboardType="number-pad"
            />
          </View>

          <View>
            <Text className="text-textPrimary font-semibold mb-2">Area/Locality</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-white"
              placeholder="e.g., Patia, Bhubaneswar"
              placeholderTextColor="#8E8E93"
              value={formData.localityLabel}
              onChangeText={(text) => setFormData({ ...formData, localityLabel: text })}
            />
          </View>

          <View>
            <Text className="text-textPrimary font-semibold mb-2">Area Coverage (km)</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-white"
              placeholder="Default: 5km"
              placeholderTextColor="#8E8E93"
              value={formData.areaCoverageKm}
              onChangeText={(text) => setFormData({ ...formData, areaCoverageKm: text })}
              keyboardType="number-pad"
            />
          </View>

          <View>
            <Text className="text-textPrimary font-semibold mb-2">Working Hours</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-white"
              placeholder="e.g., 9 AM - 6 PM"
              placeholderTextColor="#8E8E93"
              value={formData.workingHoursLabel}
              onChangeText={(text) => setFormData({ ...formData, workingHoursLabel: text })}
            />
          </View>

          <View>
            <Text className="text-textPrimary font-semibold mb-2">Skills (comma separated)</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-white"
              placeholder="e.g., pipe repair, installation"
              placeholderTextColor="#8E8E93"
              value={formData.skills}
              onChangeText={(text) => setFormData({ ...formData, skills: text })}
            />
          </View>

          <View>
            <Text className="text-textPrimary font-semibold mb-2">Description</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-white"
              placeholder="Describe your services..."
              placeholderTextColor="#8E8E93"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
            />
          </View>

          <View>
            <Text className="text-textPrimary font-semibold mb-2">Estimated Starting Price (₹)</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-white"
              placeholder="Starting price for your service"
              placeholderTextColor="#8E8E93"
              value={formData.estimatedStartingPrice}
              onChangeText={(text) => setFormData({ ...formData, estimatedStartingPrice: text })}
              keyboardType="number-pad"
            />
          </View>

          <View>
            <Text className="text-textPrimary font-semibold mb-2">Average Response Time (minutes)</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-white"
              placeholder="e.g., 30"
              placeholderTextColor="#8E8E93"
              value={formData.responseTimeMins}
              onChangeText={(text) => setFormData({ ...formData, responseTimeMins: text })}
              keyboardType="number-pad"
            />
          </View>

          <View className="flex-row items-center">
            <Button
              title="Emergency Service Available"
              variant={formData.emergencyAvailable ? 'primary' : 'ghost'}
              onPress={() => setFormData({ ...formData, emergencyAvailable: !formData.emergencyAvailable })}
            />
          </View>

          <View className="pt-4">
            <Button
              title="Register as Worker"
              onPress={handleRegister}
              loading={loading}
              disabled={!formData.displayName || !formData.categoryId}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
