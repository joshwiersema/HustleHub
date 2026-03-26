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
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();

    Animated.stagger(
      80,
      cardAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: false,
        }),
      ),
    ).start();
  }, []);

  useEffect(() => {
    Animated.spring(buttonAnim, {
      toValue: selected ? 1 : 0,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
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
          {/* Checkmark for selected */}
          {isSelected && (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            </View>
          )}

          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              isSelected && styles.iconContainerSelected,
            ]}
          >
            <Ionicons
              name={hustle.icon as any}
              size={28}
              color={isSelected ? Colors.primary : Colors.textSecondary}
            />
          </View>

          {/* Name */}
          <Text
            style={[styles.cardName, isSelected && styles.cardNameSelected]}
            numberOfLines={1}
          >
            {hustle.name}
          </Text>

          {/* One-line description */}
          <Text style={styles.cardDescription} numberOfLines={2}>
            {hustle.description}
          </Text>
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
              name="chevron-back"
              size={24}
              color={Colors.textSecondary}
            />
          </Pressable>

          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, styles.stepDotComplete]} />
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepDot} />
            <View style={styles.stepDot} />
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
              Choose your business type. You can always change this later.
            </Text>
          </Animated.View>

          {/* Cards grid */}
          <View style={styles.grid}>
            {HUSTLE_TYPES.map((hustle, index) => renderCard(hustle, index))}
          </View>

          {/* Info callout */}
          <View style={styles.infoCallout}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              Don't worry — you can change this later in settings.
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
              colors={[...Colors.gradientPrimary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color="#FFFFFF"
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
    borderRadius: BorderRadius.md,
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
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  iconContainerSelected: {
    backgroundColor: Colors.primaryBg,
  },
  cardName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  cardNameSelected: {
    color: Colors.primary,
  },
  cardDescription: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
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
    color: '#FFFFFF',
  },
});
