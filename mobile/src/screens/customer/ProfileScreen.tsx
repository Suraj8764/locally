import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, ActivityIndicator, Linking } from 'react-native';
import { ChevronRight, Bell, Globe, LogOut, HelpCircle, Phone, Heart, Briefcase, AlertTriangle, User, Trash2, Edit } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../../components/ui/Avatar';
import { api } from '../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EMERGENCY_CONTACTS = [
  { id: 'ambulance', name: 'Ambulance', icon: AlertTriangle, color: '#FF453A' },
  { id: 'doctor', name: 'Doctor', icon: User, color: '#0A84FF' },
  { id: 'pharmacy', name: 'Pharmacy', icon: Briefcase, color: '#30D158' },
  { id: 'electrician', name: 'Electrician', icon: Briefcase, color: '#FF9F0A' },
  { id: 'plumber', name: 'Plumber', icon: Briefcase, color: '#0B6E4F' },
  { id: 'mechanic', name: 'Mechanic', icon: Briefcase, color: '#BF5AF2' },
];

export function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const { t, i18n } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [favoriteWorkers, setFavoriteWorkers] = useState<any[]>([]);

  // Fetch bookings and favorite workers
  useEffect(() => {
    fetchUserData();
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage) {
        await i18n.changeLanguage(savedLanguage);
      }
    } catch (e) {
      console.error('Error loading saved language:', e);
    }
  };

  const changeLanguage = async (lng: string) => {
    try {
      await i18n.changeLanguage(lng);
      await AsyncStorage.setItem('appLanguage', lng);
    } catch (e) {
      console.error('Error changing language:', e);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings using the correct API method
      if (user?.id) {
        const userBookings = await api.bookings.getUserBookings(user.id);
        setBookings(userBookings || []);
      }
      
      // Fetch favorite workers (if API exists, otherwise empty)
      // TODO: Implement favorite workers API
      setFavoriteWorkers([]);
      
    } catch (e) {
      console.error('Failed to fetch user data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Calculate request counts
  const requestCounts = {
    pending: bookings.filter(b => b.status === 'pending').length,
    accepted: bookings.filter(b => b.status === 'accepted').length,
    completed: bookings.filter(b => b.status === 'completed' || b.status === 'cancelled_by_customer' || b.status === 'cancelled_by_worker').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
  };

  const handleMyRequests = (status: string) => {
    // Navigate to BookingsTab with filter
    navigation.navigate('BookingsTab' as never, { statusFilter: status });
  };

  const handleEmergencyContact = (contact: any) => {
    // Define emergency numbers for each service
    const emergencyNumbers: { [key: string]: string } = {
      ambulance: '102',
      doctor: '104',
      pharmacy: '', // No specific emergency number
      electrician: '', // No specific emergency number
      plumber: '', // No specific emergency number
      mechanic: '', // No specific emergency number
    };

    const phoneNumber = emergencyNumbers[contact.id];
    if (phoneNumber) {
      Alert.alert(
        'Emergency Call',
        `Calling ${contact.name} (${phoneNumber})...`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => {
            // Make actual call
            Linking.openURL(`tel:${phoneNumber}`);
          }}
        ]
      );
    } else {
      Alert.alert('Service Search', `Searching for nearby ${contact.name}...`);
      // Navigate to search for that service category
      navigation.navigate('Home' as never, { searchCategory: contact.id });
    }
  };

  const handleBookWorker = (worker: any) => {
    // Navigate to worker profile
    navigation.navigate('WorkerProfile' as never, { workerId: worker.id });
  };

  const handleBecomeWorker = () => {
    // Navigate to worker registration screen
    navigation.navigate('WorkerRegistration' as never);
  };

  const handleChangePhone = () => {
    Alert.alert('Change Phone Number', 'This feature is coming soon. For now, please contact support to change your phone number.');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            // TODO: Implement actual account deletion API call
            // await api.users.deleteAccount();
            Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
            logout();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
          }
        }}
      ]
    );
  };

  const handleSupportItem = (item: string) => {
    switch (item) {
      case 'Help Center':
        navigation.navigate('HelpCenter' as never);
        break;
      case 'Contact Support':
        Alert.alert('Contact Support', 'You can reach us at support@sebalink.com or call +91 XXXXX XXXXX');
        break;
      case 'Privacy Policy':
        Alert.alert('Privacy Policy', 'Privacy Policy content coming soon');
        break;
      case 'Terms & Conditions':
        Alert.alert('Terms & Conditions', 'Terms & Conditions content coming soon');
        break;
      case 'About App':
        Alert.alert('About App', 'SebaLink v1.0.0 - Your trusted hyperlocal service platform');
        break;
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="pt-14 px-6 pb-8 bg-surface border-b border-white/5">
        <Text className="text-3xl font-black text-white mb-6">Profile</Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Avatar url={user?.profileImage} name={user?.displayName || 'Customer'} size={72} />
            <View className="ml-5">
              <Text className="text-2xl font-black text-white">{user?.displayName || 'Customer'}</Text>
              <Text className="text-textSecondary font-bold text-sm tracking-tight">{user?.phoneE164}</Text>
            </View>
          </View>
          <Pressable className="bg-accent/20 border border-accent px-4 py-2 rounded-2xl">
            <Edit size={16} color="#E8294C" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#E8294C" />
            <Text className="text-textSecondary font-bold text-sm mt-3">Loading your data...</Text>
          </View>
        ) : (
          <>
        {/* My Requests Section */}
        <View className="mb-6">
          <Text className="text-textSecondary font-black uppercase tracking-[2px] text-[10px] mb-4 ml-1">
            My Requests
          </Text>
          <View className="bg-surface border border-border rounded-2xl overflow-hidden">
            <Pressable onPress={() => handleMyRequests('pending')} className="flex-row items-center p-4 border-b border-border">
              <View className="w-3 h-3 rounded-full bg-yellow-500 mr-3" />
              <View className="flex-1">
                <Text className="text-white font-bold">Pending Requests</Text>
                <Text className="text-textSecondary text-xs">{requestCounts.pending} request{requestCounts.pending !== 1 ? 's' : ''} waiting</Text>
              </View>
              <ChevronRight size={20} color="#8E8E93" />
            </Pressable>
            <Pressable onPress={() => handleMyRequests('accepted')} className="flex-row items-center p-4 border-b border-border">
              <View className="w-3 h-3 rounded-full bg-green-500 mr-3" />
              <View className="flex-1">
                <Text className="text-white font-bold">Accepted Requests</Text>
                <Text className="text-textSecondary text-xs">{requestCounts.accepted} request{requestCounts.accepted !== 1 ? 's' : ''} accepted</Text>
              </View>
              <ChevronRight size={20} color="#8E8E93" />
            </Pressable>
            <Pressable onPress={() => handleMyRequests('completed')} className="flex-row items-center p-4 border-b border-border">
              <View className="w-3 h-3 rounded-full bg-blue-500 mr-3" />
              <View className="flex-1">
                <Text className="text-white font-bold">Completed Requests</Text>
                <Text className="text-textSecondary text-xs">{requestCounts.completed} completed</Text>
              </View>
              <ChevronRight size={20} color="#8E8E93" />
            </Pressable>
            <Pressable onPress={() => handleMyRequests('rejected')} className="flex-row items-center p-4">
              <View className="w-3 h-3 rounded-full bg-red-500 mr-3" />
              <View className="flex-1">
                <Text className="text-white font-bold">Rejected Requests</Text>
                <Text className="text-textSecondary text-xs">{requestCounts.rejected} rejected</Text>
              </View>
              <ChevronRight size={20} color="#8E8E93" />
            </Pressable>
          </View>
        </View>

        {/* Emergency Contacts Section */}
        <View className="mb-6">
          <Text className="text-textSecondary font-black uppercase tracking-[2px] text-[10px] mb-4 ml-1">
            Emergency Quick Access
          </Text>
          <View className="grid grid-cols-3 gap-3">
            {EMERGENCY_CONTACTS.map((contact) => (
              <Pressable
                key={contact.id}
                onPress={() => handleEmergencyContact(contact)}
                className="bg-surface border border-border rounded-2xl p-4 items-center"
              >
                <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: `${contact.color}20` }}>
                  <contact.icon size={20} color={contact.color} />
                </View>
                <Text className="text-white font-bold text-xs text-center">{contact.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Favorite Workers Section */}
        <View className="mb-6">
          <Text className="text-textSecondary font-black uppercase tracking-[2px] text-[10px] mb-4 ml-1">
            Favorite Workers
          </Text>
          {favoriteWorkers.length > 0 ? (
            <View className="bg-surface border border-border rounded-2xl overflow-hidden">
              {favoriteWorkers.map((worker: any) => (
                <Pressable
                  key={worker.id}
                  onPress={() => handleBookWorker(worker)}
                  className="flex-row items-center p-4 border-b border-border last:border-b-0"
                >
                  <Heart size={16} color="#E8294C" fill="#E8294C" />
                  <View className="flex-1 ml-3">
                    <Text className="text-white font-bold">{worker.name}</Text>
                    <Text className="text-textSecondary text-xs">{worker.category}</Text>
                  </View>
                  <Pressable className="bg-accent/20 border border-accent px-3 py-1.5 rounded-xl">
                    <Text className="text-accent font-bold text-xs">Book Again</Text>
                  </Pressable>
                </Pressable>
              ))}
            </View>
          ) : (
            <View className="bg-surface border border-border rounded-2xl p-6 items-center">
              <Heart size={32} color="#8E8E93" />
              <Text className="text-textSecondary font-bold text-sm mt-2">No favorite workers yet</Text>
              <Text className="text-textSecondary text-xs mt-1">Save workers you like for quick access</Text>
            </View>
          )}
        </View>

        {/* Become a Service Provider Section */}
        <View className="mb-6">
          <View className="bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 rounded-2xl p-5">
            <View className="flex-row items-start">
              <View className="flex-1">
                <Text className="text-white font-black text-lg mb-1">Earn With Us</Text>
                <Text className="text-textSecondary text-sm mb-4">
                  Register as a Worker and receive customer requests from nearby users.
                </Text>
                <Pressable
                  onPress={handleBecomeWorker}
                  className="bg-accent px-4 py-2.5 rounded-xl self-start"
                >
                  <Text className="text-white font-black text-sm uppercase tracking-wider">Become a Worker</Text>
                </Pressable>
              </View>
              <Briefcase size={32} color="#E8294C" />
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <Text className="text-textSecondary font-black uppercase tracking-[2px] text-[10px] mb-4 ml-1">
          Preferences
        </Text>
        <View className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
          <View className="flex-row items-center p-4 border-b border-border">
            <Bell size={20} color="#8E8E93" />
            <Text className="text-white flex-1 ml-3 font-bold">Push Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ true: '#E8294C' }}
            />
          </View>
          
          <View className="flex-row items-center p-4">
            <Globe size={20} color="#8E8E93" />
            <Text className="text-white flex-1 ml-3 font-bold">Language</Text>
            <View className="flex-row gap-2">
              <Pressable onPress={() => changeLanguage('en')} className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-accent/20 border-accent border' : 'bg-background border border-border'}`}>
                <Text className={i18n.language === 'en' ? 'text-accent' : 'text-textSecondary'}>EN</Text>
              </Pressable>
              <Pressable onPress={() => changeLanguage('hi')} className={`px-2 py-1 rounded ${i18n.language === 'hi' ? 'bg-accent/20 border-accent border' : 'bg-background border border-border'}`}>
                <Text className={i18n.language === 'hi' ? 'text-accent' : 'text-textSecondary'}>HI</Text>
              </Pressable>
              <Pressable onPress={() => changeLanguage('or')} className={`px-2 py-1 rounded ${i18n.language === 'or' ? 'bg-accent/20 border-accent border' : 'bg-background border border-border'}`}>
                <Text className={i18n.language === 'or' ? 'text-accent' : 'text-textSecondary'}>OR</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Support & Legal Section */}
        <Text className="text-textSecondary font-black uppercase tracking-[2px] text-[10px] mb-4 ml-1">
          Support & Legal
        </Text>
        <View className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
          <Pressable onPress={() => handleSupportItem('Help Center')} className="flex-row items-center p-4 border-b border-border">
            <HelpCircle size={20} color="#8E8E93" />
            <Text className="text-white flex-1 ml-3 font-bold">Help Center</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
          <Pressable onPress={() => handleSupportItem('Contact Support')} className="flex-row items-center p-4 border-b border-border">
            <Phone size={20} color="#8E8E93" />
            <Text className="text-white flex-1 ml-3 font-bold">Contact Support</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
          <Pressable onPress={() => handleSupportItem('Privacy Policy')} className="flex-row items-center p-4 border-b border-border">
            <HelpCircle size={20} color="#8E8E93" />
            <Text className="text-white flex-1 ml-3 font-bold">Privacy Policy</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
          <Pressable onPress={() => handleSupportItem('Terms & Conditions')} className="flex-row items-center p-4 border-b border-border">
            <HelpCircle size={20} color="#8E8E93" />
            <Text className="text-white flex-1 ml-3 font-bold">Terms & Conditions</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
          <Pressable onPress={() => handleSupportItem('About App')} className="flex-row items-center p-4">
            <HelpCircle size={20} color="#8E8E93" />
            <Text className="text-white flex-1 ml-3 font-bold">About App</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
        </View>

        {/* Account Section */}
        <Text className="text-textSecondary font-black uppercase tracking-[2px] text-[10px] mb-4 ml-1">
          Account
        </Text>
        <View className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
          <Pressable onPress={handleChangePhone} className="flex-row items-center p-4 border-b border-border">
            <Phone size={20} color="#8E8E93" />
            <Text className="text-white flex-1 ml-3 font-bold">Change Phone Number</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
          <Pressable onPress={handleDeleteAccount} className="flex-row items-center p-4">
            <Trash2 size={20} color="#FF453A" />
            <Text className="text-error flex-1 ml-3 font-bold">Delete Account</Text>
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
          </>
        )}
      </ScrollView>
    </View>
  );
}
