import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Plus, User, Phone, MapPin, CheckCircle2, XCircle } from 'lucide-react-native';
import { api } from '../../api';
import { useAuthStore } from '../../store/authStore';

export function AdminPanelScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phoneE164: '',
    whatsappE164: '',
    categoryId: '',
    localityLabel: '',
    areaCoverageKm: '5',
    status: 'available' as 'available' | 'busy' | 'offline',
  });
  
  // Admin phone number - only this number can access Admin Panel
  const ADMIN_PHONE = '+919999999999'; // Replace with your actual admin number
  const { user } = useAuthStore();
  const isAdmin = user?.phoneE164 === ADMIN_PHONE;

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You do not have permission to access this panel');
      navigation.goBack();
    }
  }, [isAdmin, navigation]);

  const categories = [
    { id: 'electrician', name: 'Electrician' },
    { id: 'plumber', name: 'Plumber' },
    { id: 'mechanic', name: 'Mechanic' },
    { id: 'carpenter', name: 'Carpenter' },
    { id: 'ac_repair', name: 'AC Repair' },
    { id: 'doctor', name: 'Doctor/Clinic' },
    { id: 'pharmacy', name: 'Pharmacy' },
  ];

  const handleSubmit = async () => {
    if (!formData.displayName || !formData.phoneE164 || !formData.categoryId || !formData.localityLabel) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const worker = await api.workers.register({
        displayName: formData.displayName,
        phoneE164: formData.phoneE164,
        whatsappE164: formData.whatsappE164 || formData.phoneE164,
        categoryId: formData.categoryId,
        localityLabel: formData.localityLabel,
        areaCoverageKm: parseFloat(formData.areaCoverageKm),
        adminPhone: user?.phoneE164, // Use authenticated user's phone for verification
      });
      
      // Update worker status separately using the worker ID
      if (formData.status !== 'offline' && worker.id) {
        await api.workers.updateStatus(worker.id, formData.status);
      }
      
      Alert.alert('Success', 'Worker added successfully');
      setFormData({
        displayName: '',
        phoneE164: '',
        whatsappE164: '',
        categoryId: '',
        localityLabel: '',
        areaCoverageKm: '5',
        status: 'available' as 'available' | 'busy' | 'offline',
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to add worker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.subtitle}>Add Worker Manually</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Worker Name *</Text>
          <View style={styles.inputContainer}>
            <User size={20} color="#6D7786" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.displayName}
              onChangeText={(text) => setFormData({ ...formData, displayName: text })}
              placeholder="Enter worker name"
              placeholderTextColor="#8B94A3"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <View style={styles.inputContainer}>
            <Phone size={20} color="#6D7786" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.phoneE164}
              onChangeText={(text) => setFormData({ ...formData, phoneE164: text })}
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor="#8B94A3"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>WhatsApp Number</Text>
          <View style={styles.inputContainer}>
            <Phone size={20} color="#6D7786" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.whatsappE164}
              onChangeText={(text) => setFormData({ ...formData, whatsappE164: text })}
              placeholder="+91 XXXXX XXXXX (optional)"
              placeholderTextColor="#8B94A3"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setFormData({ ...formData, categoryId: cat.id })}
                style={[
                  styles.categoryChip,
                  formData.categoryId === cat.id && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    formData.categoryId === cat.id && styles.categoryTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Area/Locality *</Text>
          <View style={styles.inputContainer}>
            <MapPin size={20} color="#6D7786" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.localityLabel}
              onChangeText={(text) => setFormData({ ...formData, localityLabel: text })}
              placeholder="e.g., Bhadrak Town, Station Area"
              placeholderTextColor="#8B94A3"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Area Coverage (km)</Text>
          <TextInput
            style={styles.input}
            value={formData.areaCoverageKm}
            onChangeText={(text) => setFormData({ ...formData, areaCoverageKm: text })}
            placeholder="5"
            placeholderTextColor="#8B94A3"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusContainer}>
            {['available', 'busy', 'offline'].map((status) => (
              <Pressable
                key={status}
                onPress={() => setFormData({ ...formData, status: status as 'available' | 'busy' | 'offline' })}
                style={[
                  styles.statusChip,
                  formData.status === status && styles.statusChipActive,
                ]}
              >
                <CheckCircle2
                  size={16}
                  color={formData.status === status ? '#0B6E4F' : '#6D7786'}
                  style={styles.statusIcon}
                />
                <Text
                  style={[
                    styles.statusText,
                    formData.status === status && styles.statusTextActive,
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
            loading && styles.submitButtonDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.submitButtonContent}>
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Add Worker</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Phase 1 Strategy</Text>
        <Text style={styles.infoText}>
          • Manually add 80-100 workers before launch{'\n'}
          • Focus on supply first, then demand{'\n'}
          • Verify phone numbers yourself{'\n'}
          • Target: 100 workers in Bhadrak
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#0B0D10',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9AA3B2',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B0D10',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E6EE',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0B0D10',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E6EE',
  },
  categoryChipActive: {
    backgroundColor: '#0B6E4F',
    borderColor: '#0B6E4F',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D7786',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statusChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E6EE',
    gap: 8,
  },
  statusChipActive: {
    backgroundColor: '#0B6E4F',
    borderColor: '#0B6E4F',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D7786',
  },
  statusTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#0B6E4F',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonPressed: {
    opacity: 0.8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoBox: {
    margin: 20,
    padding: 16,
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFB366',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8294C',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6D7786',
    lineHeight: 22,
  },
});
