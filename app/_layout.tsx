import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../src/constants/theme';
import { useProfileStore } from '../src/store/profileStore';
import { CelebrationProvider } from '../src/components/CelebrationProvider';

export default function RootLayout() {
  const isOnboarded = useProfileStore((s) => s.isOnboarded);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Subscribe to Zustand persist hydration completion
    const unsub = useProfileStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    // If already hydrated (e.g., sync persist or fast async)
    if (useProfileStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  // Handle auth-style routing guard
  useEffect(() => {
    if (!hydrated) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!isOnboarded && !inOnboarding) {
      router.replace('/onboarding');
    } else if (isOnboarded && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [hydrated, isOnboarded, segments]);

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <CelebrationProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
      </Stack>
    </CelebrationProvider>
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
