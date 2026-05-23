import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CustomerTabs } from './CustomerTabs';
import { WorkerListScreen } from '../screens/customer/WorkerListScreen';
import { WorkerProfileScreen } from '../screens/customer/WorkerProfileScreen';
import { BookingSheet } from '../screens/customer/BookingSheet';
import { BookingStatusScreen } from '../screens/customer/BookingStatusScreen';
import { EmergencyScreen } from '../screens/customer/EmergencyScreen';
import { ChatScreen } from '../screens/customer/ChatScreen';
import { RatingScreen } from '../screens/customer/RatingScreen';
import { PaymentScreen } from '../screens/customer/PaymentScreen';

const Stack = createNativeStackNavigator();

export function CustomerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
      <Stack.Screen name="WorkerList" component={WorkerListScreen} />
      <Stack.Screen name="WorkerProfile" component={WorkerProfileScreen} />
      <Stack.Screen name="BookingSheet" component={BookingSheet} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="BookingStatus" component={BookingStatusScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Rating" component={RatingScreen} options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="Emergency" component={EmergencyScreen} options={{ presentation: 'fullScreenModal' }} />
    </Stack.Navigator>
  );
}

