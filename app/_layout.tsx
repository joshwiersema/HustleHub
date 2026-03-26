import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../src/constants/theme';
import { useAuthStore } from '../src/store/authStore';
import { useProfileStore } from '../src/store/profileStore';
import { CelebrationProvider } from '../src/components/CelebrationProvider';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

export default function RootLayout() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isOnboarded = useProfileStore((s) => s.isOnboarded);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.onerror = (message, source, lineno, colno, error) => {
        console.error('[HustleHub] Global error:', message, source, lineno, colno, error);
        return false;
      };
      window.onunhandledrejection = (event: PromiseRejectionEvent) => {
        console.error('[HustleHub] Unhandled rejection:', event.reason);
      };
    }
  }, []);

  useEffect(() => {
    let authDone = false;
    let profileDone = false;
    const checkDone = () => {
      if (authDone && profileDone) setHydrated(true);
    };

    const unsubAuth = useAuthStore.persist.onFinishHydration(() => {
      authDone = true;
      checkDone();
    });
    const unsubProfile = useProfileStore.persist.onFinishHydration(() => {
      profileDone = true;
      checkDone();
    });

    if (useAuthStore.persist.hasHydrated()) { authDone = true; }
    if (useProfileStore.persist.hasHydrated()) { profileDone = true; }
    checkDone();

    return () => { unsubAuth(); unsubProfile(); };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!isLoggedIn) {
      // Not logged in → show auth screens
      if (!inAuth) {
        router.replace('/(auth)/login');
      }
    } else if (!isOnboarded) {
      // Logged in but not onboarded → show onboarding
      if (!inOnboarding) {
        router.replace('/onboarding');
      }
    } else {
      // Logged in and onboarded → show main app
      if (inAuth || inOnboarding) {
        router.replace('/(tabs)');
      }
    }
  }, [hydrated, isLoggedIn, isOnboarded, segments]);

  return (
    <ErrorBoundary>
      {!hydrated ? (
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
