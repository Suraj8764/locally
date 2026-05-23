import React from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { ChevronRight, Settings, Bell, Globe, LogOut, HelpCircle } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../../components/ui/Avatar';
import { SavedAddressItem } from '../../components/profile/SavedAddressItem';

const DUMMY_SAVED_ADDRESSES = [
  { id: '1', label: 'Home', address: 'Sunset Blvd, Beverly Hills, CA' },
  { id: '2', label: 'Work', address: 'Infinite Loop, Cupertino, CA' },
];

export function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <View className="flex-1 bg-background">
      <View className="pt-14 px-6 pb-8 bg-surface border-b border-white/5">
        <Text className="text-3xl font-black text-white mb-8">Profile</Text>
        <View className="flex-row items-center">
          <Avatar url={user?.profileImage} name={user?.displayName || 'Customer'} size={72} />
          <View className="ml-5">
            <Text className="text-2xl font-black text-white">{user?.displayName || 'Customer'}</Text>
            <Text className="text-textSecondary font-bold text-sm tracking-tight">{user?.phoneE164}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <Text className="text-textSecondary font-black uppercase tracking-[2px] text-[10px] mb-5 ml-1">
            Saved Addresses
          </Text>
          {DUMMY_SAVED_ADDRESSES.map(addr => (
            <SavedAddressItem 
              key={addr.id}
              label={addr.label}
              address={addr.address}
              onPress={() => {}}
              showDelete
              onDelete={() => {}}
            />
          ))}
          <Pressable className="bg-surface border border-white/5 border-dashed p-5 rounded-[32px] items-center">
             <Text className="text-accent font-black uppercase tracking-widest text-[10px]">+ Add New Address</Text>
          </Pressable>
        </View>

        <Text className="text-textSecondary font-black uppercase tracking-[2px] text-[10px] mb-5 ml-1">
          Preferences
        </Text>
        <View className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
          <View className="flex-row items-center p-4 border-b border-border">
            <Bell size={20} color="#8E8E93" />
            <Text className="text-white flex-1 ml-3 font-bold">Push Notifications</Text>
            <Switch value={true} trackColor={{ true: '#E8294C' }} />
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

        <Text className="text-textSecondary font-bold uppercase tracking-wider text-xs mb-3 ml-2">
          Support & Legal
        </Text>
        <View className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
          <Pressable className="flex-row items-center p-4 border-b border-border">
            <HelpCircle size={20} color="#8E8E93" />
            <Text className="text-white flex-1 ml-3 font-bold">Help Center</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </Pressable>
          <Pressable className="flex-row items-center p-4">
            <Settings size={20} color="#8E8E93" />
            <Text className="text-white flex-1 ml-3 font-bold">Terms & Privacy</Text>
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
