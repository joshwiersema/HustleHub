import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadows,
} from '../../src/constants/theme';
import { HustleType, HUSTLE_TYPES, UserProfile } from '../../src/types';
import { useProfileStore } from '../../src/store/profileStore';

const BUSINESS_NAME_SUGGESTIONS: Record<HustleType, string[]> = {
  lawn_care: [
    'Green Machine Lawns',
    'The Mow Squad',
    'Fresh Cut Co.',
  ],
  power_washing: [
    'Blast Zone Cleaning',
    'Pressure Pro Services',
    'Sparkle Wash Co.',
  ],
  dog_walking: [
    'Paws & Hustle',
    'The Bark Boss',
    'Good Boy Walks',
  ],
  tutoring: [
    'Brain Boost Academy',
    'The Grade Maker',
    'Level Up Tutoring',
  ],
  car_detailing: [
    'Mirror Finish Detailing',
    'Shine Squad Auto',
    'The Detail Plug',
  ],
  snow_removal: [
    'Blizzard Busters',
    'Ice Breaker Services',
    'Snow Day Pros',
  ],
};

function generateId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 10)
  );
}

export default function SetupBusinessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ hustleType: HustleType }>();
  const hustleType = params.hustleType || 'lawn_care';
  const setProfile = useProfileStore((s) => s.setProfile);

  const hustleInfo = HUSTLE_TYPES.find((h) => h.id === hustleType);

  const [businessName, setBusinessName] = useState('');
  const [userName, setUserName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const suggestAnim = useRef(new Animated.Value(0)).current;
  const launchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.spring(suggestAnim, {
      toValue: showSuggestions ? 1 : 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [showSuggestions]);

  const suggestions = BUSINESS_NAME_SUGGESTIONS[hustleType] || [
    'My Awesome Business',
    'Hustle Co.',
    'The Side Gig',
  ];

  const canLaunch = businessName.trim().length >= 2 && userName.trim().length >= 2;

  const handleLaunch = () => {
    if (!canLaunch || isLaunching) return;
    setIsLaunching(true);

    Animated.timing(launchAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const profile: UserProfile = {
      id: generateId(),
      name: userName.trim(),
      businessName: businessName.trim(),
      hustleType,
      level: 1,
      xp: 0,
      hustleBucks: 50,
      totalEarnings: 0,
      streak: 0,
      joinedDate: new Date().toISOString(),
      badges: [],
      onboardingComplete: true,
    };

    setProfile(profile);

    setTimeout(() => {
      router.replace('/(tabs)');
    }, 400);
  };

  const handleSuggestionPress = (name: string) => {
    setBusinessName(name);
    setShowSuggestions(false);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors.textSecondary}
            />
          </Pressable>

          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, styles.stepDotComplete]} />
            <View style={[styles.stepDot, styles.stepDotActive]} />
          </View>
        </Animated.View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={10}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              {/* Selected hustle badge */}
              <View style={styles.hustleBadge}>
                <Text style={styles.hustleBadgeEmoji}>
                  {hustleInfo?.emoji || '🚀'}
                </Text>
                <Text style={styles.hustleBadgeText}>
                  {hustleInfo?.name || 'Your Hustle'}
                </Text>
              </View>

              <Text style={styles.title}>Name your business</Text>
              <Text style={styles.subtitle}>
                Every great empire starts with a name. Make it memorable!
              </Text>
            </Animated.View>

            {/* Name input */}
            <Animated.View
              style={[
                styles.inputGroup,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.inputLabel}>Your name</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person"
                  size={20}
                  color={
                    userName.length > 0 ? Colors.primary : Colors.textMuted
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="What should we call you?"
                  placeholderTextColor={Colors.textMuted}
                  value={userName}
                  onChangeText={setUserName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  maxLength={30}
                />
                {userName.length >= 2 && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.primary}
                  />
                )}
              </View>
            </Animated.View>

            {/* Business name input */}
            <Animated.View
              style={[
                styles.inputGroup,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.inputLabel}>Business name</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="storefront"
                  size={20}
                  color={
                    businessName.length > 0
                      ? Colors.primary
                      : Colors.textMuted
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Fresh Cut Co."
                  placeholderTextColor={Colors.textMuted}
                  value={businessName}
                  onChangeText={setBusinessName}
                  autoCapitalize="words"
                  returnKeyType="done"
                  maxLength={40}
                />
                {businessName.length >= 2 && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.primary}
                  />
                )}
              </View>
            </Animated.View>

            {/* AI Suggestion button */}
            <Pressable
              onPress={() => setShowSuggestions(!showSuggestions)}
              style={({ pressed }) => [
                styles.suggestButton,
                pressed && styles.suggestButtonPressed,
              ]}
            >
              <LinearGradient
                colors={[...Colors.gradientPurple]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.suggestGradient}
              >
                <Ionicons name="sparkles" size={18} color={Colors.text} />
                <Text style={styles.suggestButtonText}>
                  {showSuggestions ? 'Hide Suggestions' : 'AI Name Ideas'}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Suggestions */}
            {showSuggestions && (
              <Animated.View
                style={[
                  styles.suggestionsContainer,
                  {
                    opacity: suggestAnim,
                    transform: [
                      {
                        translateY: suggestAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [15, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.suggestionsHeader}>
                  <Ionicons
                    name="bulb"
                    size={18}
                    color={Colors.amber}
                  />
                  <Text style={styles.suggestionsTitle}>
                    Name ideas for {hustleInfo?.name || 'your hustle'}
                  </Text>
                </View>
                {suggestions.map((name, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleSuggestionPress(name)}
                    style={({ pressed }) => [
                      styles.suggestionItem,
                      pressed && styles.suggestionItemPressed,
                    ]}
                  >
                    <Text style={styles.suggestionNumber}>
                      {index + 1}
                    </Text>
                    <Text style={styles.suggestionText}>{name}</Text>
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color={Colors.primary}
                    />
                  </Pressable>
                ))}
              </Animated.View>
            )}

            {/* Preview card */}
            {canLaunch && (
              <View style={styles.previewCard}>
                <LinearGradient
                  colors={['rgba(0, 230, 118, 0.06)', 'rgba(124, 77, 255, 0.06)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <Text style={styles.previewLabel}>YOUR BUSINESS CARD</Text>
                <View style={styles.previewContent}>
                  <View style={styles.previewEmojiCircle}>
                    <Text style={styles.previewEmoji}>
                      {hustleInfo?.emoji || '🚀'}
                    </Text>
                  </View>
                  <View style={styles.previewInfo}>
                    <Text style={styles.previewBusinessName} numberOfLines={1}>
                      {businessName}
                    </Text>
                    <Text style={styles.previewUserName}>
                      {userName} — {hustleInfo?.name || 'Entrepreneur'}
                    </Text>
                  </View>
                </View>
                <View style={styles.previewStats}>
                  <View style={styles.previewStat}>
                    <Text style={styles.previewStatEmoji}>🌱</Text>
                    <Text style={styles.previewStatText}>Level 1</Text>
                  </View>
                  <View style={styles.previewStat}>
                    <Text style={styles.previewStatEmoji}>💰</Text>
                    <Text style={styles.previewStatText}>50 HB</Text>
                  </View>
                  <View style={styles.previewStat}>
                    <Text style={styles.previewStatEmoji}>⚡</Text>
                    <Text style={styles.previewStatText}>0 XP</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Launch button */}
        <Animated.View
          style={[
            styles.bottomBar,
            isLaunching && {
              transform: [
                {
                  scale: launchAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.02, 0.95],
                  }),
                },
              ],
            },
          ]}
        >
          <Pressable
            onPress={handleLaunch}
            disabled={!canLaunch || isLaunching}
            style={({ pressed }) => [
              styles.launchButtonWrapper,
              pressed && !isLaunching && styles.launchButtonPressed,
            ]}
          >
            <LinearGradient
              colors={
                canLaunch
                  ? [...Colors.gradientGreen]
                  : [Colors.bgElevated, Colors.bgCard]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.launchButton}
            >
              {isLaunching ? (
                <Text style={styles.launchButtonTextActive}>
                  Launching... 🚀
                </Text>
              ) : (
                <>
                  <Ionicons
                    name="rocket"
                    size={22}
                    color={
                      canLaunch ? Colors.textInverse : Colors.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.launchButtonText,
                      !canLaunch && styles.launchButtonTextDisabled,
                    ]}
                  >
                    Launch My Hustle
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
    borderRadius: 4,
  },
  stepDotComplete: {
    backgroundColor: Colors.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 120,
  },
  hustleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  hustleBadgeEmoji: {
    fontSize: 18,
  },
  hustleBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.black,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    height: 56,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    height: '100%',
  },
  suggestButton: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  suggestButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  suggestGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  suggestButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  suggestionsContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.secondaryBorder,
    marginBottom: Spacing.xxl,
    ...Shadows.card,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  suggestionsTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.amber,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  suggestionItemPressed: {
    opacity: 0.7,
  },
  suggestionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.bgElevated,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    overflow: 'hidden',
  },
  suggestionText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  previewCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    ...Shadows.elevated,
  },
  previewLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: Spacing.lg,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  previewEmojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
  },
  previewEmoji: {
    fontSize: 26,
  },
  previewInfo: {
    flex: 1,
  },
  previewBusinessName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.heavy,
    color: Colors.text,
    marginBottom: 2,
  },
  previewUserName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  previewStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  previewStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  previewStatEmoji: {
    fontSize: 14,
  },
  previewStatText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  launchButtonWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  launchButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  launchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  launchButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  launchButtonTextDisabled: {
    color: Colors.textMuted,
  },
  launchButtonTextActive: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
});
