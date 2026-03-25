import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
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
  Shadows,
} from '../../src/constants/theme';
import { HustleType, HUSTLE_TYPES, HustleTypeInfo } from '../../src/types';

const { width } = Dimensions.get('window');
const CARD_GAP = Spacing.md;
const CARD_WIDTH = (width - Spacing.xxl * 2 - CARD_GAP) / 2;

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  Easy: { bg: 'rgba(0, 230, 118, 0.15)', text: Colors.primary },
  Medium: { bg: 'rgba(255, 215, 64, 0.15)', text: Colors.amber },
  Hard: { bg: 'rgba(255, 82, 82, 0.15)', text: Colors.error },
};

export default function PickHustleScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<HustleType | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef(
    HUSTLE_TYPES.map(() => new Animated.Value(0)),
  ).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Title entrance
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

    // Staggered card entrance
    Animated.stagger(
      80,
      cardAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, []);

  useEffect(() => {
    Animated.spring(buttonAnim, {
      toValue: selected ? 1 : 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [selected]);

  const handleNext = () => {
    if (!selected) return;
    router.push({
      pathname: '/onboarding/setup-business',
      params: { hustleType: selected },
    });
  };

  const renderCard = (hustle: HustleTypeInfo, index: number) => {
    const isSelected = selected === hustle.id;
    const diffStyle = DIFFICULTY_COLORS[hustle.difficulty];
    const animValue = cardAnims[index];

    return (
      <Animated.View
        key={hustle.id}
        style={{
          opacity: animValue,
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [40, 0],
              }),
            },
            {
              scale: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        }}
      >
        <Pressable
          onPress={() => setSelected(hustle.id)}
          style={({ pressed }) => [
            styles.card,
            isSelected && styles.cardSelected,
            pressed && styles.cardPressed,
          ]}
        >
          {/* Selected glow overlay */}
          {isSelected && (
            <View style={styles.selectedGlow}>
              <LinearGradient
                colors={['rgba(0, 230, 118, 0.08)', 'rgba(0, 230, 118, 0.02)']}
                style={StyleSheet.absoluteFillObject}
              />
            </View>
          )}

          {/* Checkmark for selected */}
          {isSelected && (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={14} color={Colors.textInverse} />
            </View>
          )}

          {/* Emoji */}
          <View
            style={[
              styles.emojiContainer,
              isSelected && styles.emojiContainerSelected,
            ]}
          >
            <Text style={styles.cardEmoji}>{hustle.emoji}</Text>
          </View>

          {/* Name */}
          <Text
            style={[styles.cardName, isSelected && styles.cardNameSelected]}
            numberOfLines={1}
          >
            {hustle.name}
          </Text>

          {/* Earnings */}
          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}>Avg</Text>
            <Text style={styles.earningsValue}>{hustle.avgEarnings}</Text>
          </View>

          {/* Difficulty badge */}
          <View
            style={[styles.difficultyBadge, { backgroundColor: diffStyle.bg }]}
          >
            <Text style={[styles.difficultyText, { color: diffStyle.text }]}>
              {hustle.difficulty}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    );
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
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors.textSecondary}
            />
          </Pressable>

          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepDot} />
          </View>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text style={styles.title}>What's your hustle?</Text>
            <Text style={styles.subtitle}>
              Choose your business type. This is like picking your character
              class — each one has unique strengths!
            </Text>
          </Animated.View>

          {/* Cards grid */}
          <View style={styles.grid}>
            {HUSTLE_TYPES.map((hustle, index) => renderCard(hustle, index))}
          </View>

          {/* Info callout */}
          <View style={styles.infoCallout}>
            <Text style={styles.infoEmoji}>💡</Text>
            <Text style={styles.infoText}>
              Don't worry — you can always change this later in settings.
            </Text>
          </View>
        </ScrollView>

        {/* Bottom button */}
        <Animated.View
          style={[
            styles.bottomBar,
            {
              opacity: buttonAnim,
              transform: [
                {
                  translateY: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Pressable
            onPress={handleNext}
            disabled={!selected}
            style={({ pressed }) => [
              styles.nextButtonWrapper,
              pressed && styles.nextButtonPressed,
            ]}
          >
            <LinearGradient
              colors={[...Colors.gradientGreen]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={Colors.textInverse}
              />
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
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 120,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    overflow: 'hidden',
    ...Shadows.card,
  },
  cardSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  selectedGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.lg,
  },
  checkBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emojiContainerSelected: {
    backgroundColor: Colors.primaryBg,
  },
  cardEmoji: {
    fontSize: 30,
  },
  cardName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  cardNameSelected: {
    color: Colors.primary,
  },
  earningsRow: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  earningsLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  earningsValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.amber,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  difficultyText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  infoCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginTop: Spacing.xxl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoEmoji: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
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
  nextButtonWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  nextButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  nextButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
});
