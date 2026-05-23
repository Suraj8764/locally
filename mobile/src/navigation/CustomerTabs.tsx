import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Grid, Calendar, AlertTriangle, User } from 'lucide-react-native';
import { COLORS } from '../constants';

import { HomeScreen } from '../screens/customer/HomeScreen';
import { CategoriesScreen } from '../screens/customer/CategoriesScreen';
import { BookingsScreen } from '../screens/customer/BookingsScreen';
import { EmergencyScreen } from '../screens/customer/EmergencyScreen';
import { ProfileScreen } from '../screens/customer/ProfileScreen';

const Tab = createBottomTabNavigator();

export function CustomerTabs() {
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
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="CategoriesTab" 
        component={CategoriesScreen} 
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color, size }) => <Grid color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="BookingsTab" 
        component={BookingsScreen} 
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="EmergencyTab" 
        component={EmergencyScreen} 
        options={{
          tabBarLabel: 'SOS',
          tabBarIcon: ({ color, size }) => <AlertTriangle color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }} 
      />
    </Tab.Navigator>
  );
}
