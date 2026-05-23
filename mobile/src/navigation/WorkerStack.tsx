import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WorkerLeadsScreen } from '../screens/worker/WorkerLeadsScreen';
import { ActiveJobScreen } from '../screens/worker/ActiveJobScreen';
import { WorkerEarningsScreen } from '../screens/worker/WorkerEarningsScreen';
import { EditWorkerProfileScreen } from '../screens/worker/EditWorkerProfileScreen';
import { ChatScreen } from '../screens/customer/ChatScreen';

const Stack = createNativeStackNavigator();

export function WorkerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A0F' },
      }}
    >
      <Stack.Screen name="WorkerLeads" component={WorkerLeadsScreen} />
      <Stack.Screen name="ActiveJob" component={ActiveJobScreen} />
      <Stack.Screen name="WorkerEarnings" component={WorkerEarningsScreen} />
      <Stack.Screen name="EditProfile" component={EditWorkerProfileScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
