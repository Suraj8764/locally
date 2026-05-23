import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { socketService } from '../services/socket';

// Stacks/Tabs (To be created)
import { AuthStack } from './AuthStack';
import { CustomerStack } from './CustomerStack';
import { WorkerStack } from './WorkerStack';

const Stack = createNativeStackNavigator();

import { IncomingLeadModal } from '../components/worker/IncomingLeadModal';

export function RootNavigator() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const { isAuthenticated, role, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }
  }, [isAuthenticated]);

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : role === 'customer' ? (
          <Stack.Screen name="Customer" component={CustomerStack} />
        ) : (
          <Stack.Screen name="Worker" component={WorkerStack} />
        )}
      </Stack.Navigator>
      <IncomingLeadModal />
    </NavigationContainer>
  );
}


