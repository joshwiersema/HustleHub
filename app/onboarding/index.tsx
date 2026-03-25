import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from '../../src/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonSlide = useRef(new Animated.Value(60)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
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
      ]),
      Animated.parallel([
        Animated.timing(buttonSlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(buttonFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Icon mark */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="trending-up" size={48} color={Colors.primary} />
            </View>
          </Animated.View>

          {/* Title and tagline */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.titleRow}>
              <Text style={styles.titleHustle}>Hustle</Text>
              <Text style={styles.titleHub}>Hub</Text>
            </View>
            <View style={styles.titleUnderline}>
              <LinearGradient
                colors={[...Colors.gradientPrimary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.underlineGradient}
              />
            </View>
            <Text style={styles.tagline}>
              Run your business. Track your growth.
            </Text>

            <View style={styles.featurePills}>
              <View style={styles.pill}>
                <Ionicons name="briefcase-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.pillText}>Track Jobs</Text>
              </View>
              <View style={styles.pill}>
                <Ionicons name="wallet-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.pillText}>Earn More</Text>
              </View>
              <View style={styles.pill}>
                <Ionicons name="trending-up-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.pillText}>Level Up</Text>
              </View>
            </View>
          </Animated.View>

          {/* Get Started Button */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: buttonFade,
                transform: [{ translateY: buttonSlide }],
              },
            ]}
          >
            <Pressable
              onPress={() => router.push('/onboarding/pick-hustle')}
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
                <Text style={styles.buttonText}>Get Started</Text>
                <Ionicons
                  name="arrow-forward"
                  size={22}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </Pressable>

            <Text style={styles.footerText}>
              Built for teen entrepreneurs
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  iconContainer: {
    marginBottom: Spacing.xxxl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.huge,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleHustle: {
    fontSize: FontSize.mega,
    fontWeight: FontWeight.black,
    color: Colors.text,
    letterSpacing: -1,
  },
  titleHub: {
    fontSize: FontSize.mega,
    fontWeight: FontWeight.black,
    color: Colors.primary,
    letterSpacing: -1,
  },
  titleUnderline: {
    width: 80,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  underlineGradient: {
    flex: 1,
  },
  tagline: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  featurePills: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  pillText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  buttonWrapper: {
    width: '100%',
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
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.lg,
  },
});
