import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Grid, Calendar, AlertTriangle, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants';

import { HomeScreen } from '../screens/customer/HomeScreen';
import { CategoriesScreen } from '../screens/customer/CategoriesScreen';
import { BookingsScreen } from '../screens/customer/BookingsScreen';
import { EmergencyScreen } from '../screens/customer/EmergencyScreen';
import { ProfileScreen } from '../screens/customer/ProfileScreen';

const Tab = createBottomTabNavigator();

export function CustomerTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
        },
        tabBarActiveTintColor: COLORS.accentPrimary,
        tabBarInactiveTintColor: COLORS.textSecondary,
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{
          tabBarLabel: t('home'),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="CategoriesTab" 
        component={CategoriesScreen} 
        options={{
          tabBarLabel: t('categories'),
          tabBarIcon: ({ color, size }) => <Grid color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="BookingsTab" 
        component={BookingsScreen} 
        options={{
          tabBarLabel: t('bookings'),
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="EmergencyTab" 
        component={EmergencyScreen} 
        options={{
          tabBarLabel: t('emergency'),
          tabBarIcon: ({ color, size }) => <AlertTriangle color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: t('profile'),
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }} 
      />
    </Tab.Navigator>
  );
}
