import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
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

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const emojiFloat = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(60)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Fade in and scale the emoji illustration
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Slide up the text
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Slide in the button
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

    // Floating emoji loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(emojiFloat, {
          toValue: -12,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(emojiFloat, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background grid pattern */}
      <View style={styles.gridOverlay}>
        {Array.from({ length: 12 }).map((_, row) => (
          <View key={row} style={styles.gridRow}>
            {Array.from({ length: 8 }).map((_, col) => (
              <View key={col} style={styles.gridCell} />
            ))}
          </View>
        ))}
      </View>

      {/* Radial glow effects */}
      <View style={styles.glowGreen} />
      <View style={styles.glowPurple} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Animated Emoji Illustration */}
          <Animated.View
            style={[
              styles.illustrationContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: emojiFloat },
                ],
              },
            ]}
          >
            <View style={styles.emojiCircle}>
              <LinearGradient
                colors={[Colors.primaryBg, 'rgba(124, 77, 255, 0.12)']}
                style={styles.emojiGradientBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={styles.mainEmoji}>🚀</Text>
            </View>
            <View style={styles.orbitEmojis}>
              <Text style={[styles.orbitEmoji, styles.orbitTopLeft]}>💰</Text>
              <Text style={[styles.orbitEmoji, styles.orbitTopRight]}>⚡</Text>
              <Text style={[styles.orbitEmoji, styles.orbitBottomLeft]}>🌟</Text>
              <Text style={[styles.orbitEmoji, styles.orbitBottomRight]}>💪</Text>
              <Text style={[styles.orbitEmoji, styles.orbitLeft]}>🔥</Text>
              <Text style={[styles.orbitEmoji, styles.orbitRight]}>📈</Text>
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
                colors={[...Colors.gradientHero]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.underlineGradient}
              />
            </View>
            <Text style={styles.tagline}>Turn your hustle into a business</Text>

            <View style={styles.featurePills}>
              <View style={styles.pill}>
                <Text style={styles.pillEmoji}>📊</Text>
                <Text style={styles.pillText}>Track Jobs</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillEmoji}>💵</Text>
                <Text style={styles.pillText}>Earn More</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillEmoji}>🏆</Text>
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
                colors={[...Colors.gradientGreen]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Get Started</Text>
                <Ionicons
                  name="arrow-forward"
                  size={22}
                  color={Colors.textInverse}
                />
              </LinearGradient>
            </Pressable>

            <Text style={styles.footerText}>
              Built for teen entrepreneurs 🎯
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
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
    flexDirection: 'column',
  },
  gridRow: {
    flexDirection: 'row',
    flex: 1,
  },
  gridCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: Colors.text,
  },
  glowGreen: {
    position: 'absolute',
    top: '15%',
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.primaryBg,
    opacity: 0.6,
  },
  glowPurple: {
    position: 'absolute',
    bottom: '20%',
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.secondaryBg,
    opacity: 0.6,
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
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    marginBottom: Spacing.xxxl,
  },
  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
    overflow: 'hidden',
  },
  emojiGradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  mainEmoji: {
    fontSize: 56,
  },
  orbitEmojis: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitEmoji: {
    position: 'absolute',
    fontSize: 28,
  },
  orbitTopLeft: {
    top: 5,
    left: 10,
  },
  orbitTopRight: {
    top: 5,
    right: 10,
  },
  orbitBottomLeft: {
    bottom: 5,
    left: 10,
  },
  orbitBottomRight: {
    bottom: 5,
    right: 10,
  },
  orbitLeft: {
    left: -5,
    top: '45%',
  },
  orbitRight: {
    right: -5,
    top: '45%',
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
  pillEmoji: {
    fontSize: 14,
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
    color: Colors.textInverse,
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.lg,
  },
});
