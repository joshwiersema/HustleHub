import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from '../../src/constants/theme';
import { HUSTLE_TYPES } from '../../src/types';
import { useProfileStore } from '../../src/store/profileStore';

export default function ReadyScreen() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const markOnboarded = useProfileStore((s) => s.markOnboarded);

  const hustleInfo = HUSTLE_TYPES.find((h) => h.id === profile?.hustleType);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLaunch = () => {
    markOnboarded();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Success icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={40} color={Colors.primary} />
          </View>

          <Text style={styles.title}>You're all set!</Text>

          {/* Profile summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Ionicons name="person-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.summaryText}>{profile?.name || 'Your Name'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="storefront-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.summaryText}>{profile?.businessName || 'Your Business'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name={(hustleInfo?.icon || 'briefcase') as any} size={18} color={Colors.primary} />
              <Text style={[styles.summaryText, { color: Colors.primary }]}>{hustleInfo?.name || 'Your Hustle'}</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            Your dashboard is ready. Track jobs, manage clients, log earnings, and grow your business.
          </Text>
        </Animated.View>

        {/* Launch button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Pressable
            onPress={handleLaunch}
            style={({ pressed }) => [
              styles.buttonWrapper,
              pressed && styles.buttonPressed,
            ]}
          >
            <LinearGradient
              colors={[...Colors.gradientPrimary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Let's Go</Text>
              <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  card: {
    alignItems: 'center',
    marginBottom: Spacing.huge,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryBg,
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.black,
    color: Colors.text,
    marginBottom: Spacing.xxl,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xxl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  summaryText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
  },
  buttonWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  buttonText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
});
