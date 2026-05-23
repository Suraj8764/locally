import './global.css';
import './src/i18n';
import React from 'react';
import { Platform, View, StyleSheet, useWindowDimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';

const queryClient = new QueryClient();

import { useRealtimeBooking } from './src/hooks/useRealtimeBooking';
import { useNotifications } from './src/hooks/useNotifications';

function AppContent() {
  useRealtimeBooking();
  useNotifications();
  return <RootNavigator />;
}

export default function App() {
  const { width } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === 'web' && width > 768;

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <View style={isDesktopWeb ? styles.webShell : styles.nativeShell}>
            <View style={isDesktopWeb ? styles.webPhoneFrame : styles.nativeFrame}>
              <AppContent />
            </View>
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  nativeShell: {
    flex: 1,
  },
  nativeFrame: {
    flex: 1,
  },
  webShell: {
    flex: 1,
    backgroundColor: '#E8ECF3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  webPhoneFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    maxHeight: 920,
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#D5DCE8',
    backgroundColor: '#FFFFFF',
    // boxShadow is valid in React Native Web
    boxShadow: '0px 12px 40px rgba(16, 24, 40, 0.12)',
  },
});
