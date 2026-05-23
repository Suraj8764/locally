import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Briefcase, IndianRupee, Bell, User } from 'lucide-react-native';
import { COLORS } from '../constants';

import { DashboardScreen } from '../screens/worker/DashboardScreen';
import { JobsScreen } from '../screens/worker/JobsScreen';
import { EarningsScreen } from '../screens/worker/EarningsScreen';
import { NotificationsScreen } from '../screens/worker/NotificationsScreen';
import { WorkerProfileScreen } from '../screens/worker/WorkerProfileScreen';

const Tab = createBottomTabNavigator();

export function WorkerTabs() {
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
        name="DashboardTab" 
        component={DashboardScreen} 
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="JobsTab" 
        component={JobsScreen} 
        options={{
          tabBarLabel: 'Jobs',
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="EarningsTab" 
        component={EarningsScreen} 
        options={{
          tabBarLabel: 'Earnings',
          tabBarIcon: ({ color, size }) => <IndianRupee color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="NotificationsTab" 
        component={NotificationsScreen} 
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={WorkerProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }} 
      />
    </Tab.Navigator>
  );
}
