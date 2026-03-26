import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../src/constants/theme';
import { useAuthStore } from '../src/store/authStore';
import { useProfileStore } from '../src/store/profileStore';
import { useClientsStore } from '../src/store/clientsStore';
import { useJobsStore } from '../src/store/jobsStore';
import { usePaymentsStore } from '../src/store/paymentsStore';
import { useGameStore } from '../src/store/gameStore';
import { CelebrationProvider } from '../src/components/CelebrationProvider';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

export default function RootLayout() {
  const { isLoggedIn, isLoading: authLoading, user, initialize } = useAuthStore();
  const isOnboarded = useProfileStore((s) => s.isOnboarded);
  const [ready, setReady] = useState(false);
  const lastUserId = useRef<string | null>(null);
  const router = useRouter();
  const segments = useSegments();

  // Initialize Supabase auth session
  useEffect(() => {
    initialize();
  }, []);

  // When auth finishes loading, mark ready
  useEffect(() => {
    if (!authLoading) setReady(true);
  }, [authLoading]);

  // Sync from cloud when user logs in
  useEffect(() => {
    if (!user?.id || user.id === lastUserId.current) return;
    lastUserId.current = user.id;

    // Pull cloud data into local stores
    Promise.all([
      useProfileStore.getState().syncFromCloud(),
      useClientsStore.getState().syncFromCloud(),
      useJobsStore.getState().syncFromCloud(),
      usePaymentsStore.getState().syncFromCloud(),
      useGameStore.getState().syncFromCloud(),
    ]).catch(console.error);
  }, [user?.id]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.onerror = (message, source, lineno, colno, error) => {
        console.error('[HustleHub]', message, error);
        return false;
      };
    }
  }, []);

  // Route guard
  useEffect(() => {
    if (!ready) return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!isLoggedIn) {
      if (!inAuth) router.replace('/(auth)/login');
    } else if (!isOnboarded) {
      if (!inOnboarding) router.replace('/onboarding');
    } else {
      if (inAuth || inOnboarding) router.replace('/(tabs)');
    }
  }, [ready, isLoggedIn, isOnboarded, segments]);

  return (
    <ErrorBoundary>
      {!ready ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <StatusBar style="dark" />
        </View>
      ) : (
        <CelebrationProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.bg },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" />
          </Stack>
        </CelebrationProvider>
      )}
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
