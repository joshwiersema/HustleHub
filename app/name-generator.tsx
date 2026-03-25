import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadows,
} from '../src/constants/theme';
import { HustleType, HUSTLE_TYPES } from '../src/types';
import { useProfileStore } from '../src/store/profileStore';
import { useGameStore } from '../src/store/gameStore';
import { useClientsStore } from '../src/store/clientsStore';
import { useJobsStore } from '../src/store/jobsStore';
import { usePaymentsStore } from '../src/store/paymentsStore';
import { useCelebration } from '../src/components/CelebrationProvider';
import { checkBadges } from '../src/utils/gamification';

const NAMES_BY_TYPE: Record<HustleType, string[]> = {
  lawn_care: [
    'GreenMachine',
    'MowTown',
    'Blade Runners',
    'Fresh Cut Crew',
    'The Lawn Boss',
    'TurfWorks',
  ],
  power_washing: [
    'BlastZone',
    'PressurePros',
    'SparkleForce',
    'CleanSweep',
    'PowerGlow',
    'WashWorks',
  ],
  dog_walking: [
    'PawPatrol Pro',
    'WagWorks',
    'Happy Tails',
    'The Dog Squad',
    'LeashLife',
    'BarkBuddy',
  ],
  tutoring: [
    'BrainBoost',
    'A+ Academy',
    'StudyBuddy',
    'MindMakers',
    'TutorUp',
    'SmartStart',
  ],
  car_detailing: [
    'Mirror Finish',
    'DetailKing',
    'ShineTime',
    'SpotlessRide',
    'GlossGang',
    'AutoGlow',
  ],
  snow_removal: [
    'SnowBuster',
    'FrostFighters',
    'ClearPath',
    'IceBreakers',
    'SnowPro',
    'PlowKing',
  ],
};

export default function NameGeneratorScreen() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const { showXPToast } = useCelebration();
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);
  const animValues = useRef<Animated.Value[]>(
    Array.from({ length: 6 }, () => new Animated.Value(0)),
  ).current;
  const slideValues = useRef<Animated.Value[]>(
    Array.from({ length: 6 }, () => new Animated.Value(50)),
  ).current;

  const hustleType = profile?.hustleType || 'lawn_care';
  const hustleInfo = HUSTLE_TYPES.find((h) => h.id === hustleType);

  const generateNames = () => {
    // Reset animations
    animValues.forEach((v) => v.setValue(0));
    slideValues.forEach((v) => v.setValue(50));

    // Shuffle names for variety
    const allNames = [...NAMES_BY_TYPE[hustleType]];
    for (let i = allNames.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allNames[i], allNames[j]] = [allNames[j], allNames[i]];
    }

    setGeneratedNames(allNames);
    setHasGenerated(true);

    // Staggered slot-machine style entrance animation
    const animations = allNames.map((_, index) =>
      Animated.parallel([
        Animated.timing(animValues[index], {
          toValue: 1,
          duration: 300,
          delay: index * 120,
          useNativeDriver: true,
        }),
        Animated.spring(slideValues[index], {
          toValue: 0,
          friction: 6,
          tension: 50,
          delay: index * 120,
          useNativeDriver: true,
        }),
      ]),
    );

    Animated.stagger(0, animations).start();

    // Award XP on first generation (10 XP per CONTEXT.md)
    if (!xpAwarded) {
      const gs = useGameStore.getState();
      gs.addXP(10);
      gs.updateStreak();
      const clients = useClientsStore.getState().clients;
      const jobs = useJobsStore.getState().jobs;
      const payments = usePaymentsStore.getState().payments;
      const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
      const completedJobs = jobs.filter((j) => j.status === 'completed').length;
      const newBadges = checkBadges(
        { earnedBadges: gs.earnedBadges, streak: gs.streak },
        { totalClients: clients.length, completedJobs, totalEarnings }
      );
      newBadges.forEach((id) => useGameStore.getState().earnBadge(id));
      showXPToast(10);
      setXpAwarded(true);
    }
  };

  const adoptName = (name: string) => {
    Alert.alert(
      'Adopt This Name?',
      `Change your business name to "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Adopt It!',
          onPress: () => {
            updateProfile({ businessName: name });
            Alert.alert(
              'Name Updated!',
              `Your business is now called "${name}"`,
            );
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Name Generator</Text>
            <Text style={styles.headerSubtitle}>
              Find the perfect name for your hustle
            </Text>
          </View>
        </View>

        {/* Current Name */}
        <View style={styles.currentNameCard}>
          <Text style={styles.currentNameLabel}>Current Business Name</Text>
          <Text style={styles.currentNameValue}>
            {profile?.businessName || 'Not set'}
          </Text>
          <View style={styles.hustleTag}>
            <Text style={styles.hustleTagText}>
              {hustleInfo?.emoji} {hustleInfo?.name}
            </Text>
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity onPress={generateNames} activeOpacity={0.8}>
          <LinearGradient
            colors={Colors.gradientHero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.generateButton}
          >
            <Ionicons name="sparkles" size={22} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>
              {hasGenerated ? 'Shuffle Names' : 'Generate Names'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* XP Notice */}
        {!xpAwarded && !hasGenerated && (
          <View style={styles.xpNotice}>
            <Ionicons name="star" size={16} color={Colors.amber} />
            <Text style={styles.xpNoticeText}>
              Earn 10 XP for generating names!
            </Text>
          </View>
        )}

        {xpAwarded && hasGenerated && (
          <View style={styles.xpNotice}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
            <Text style={[styles.xpNoticeText, { color: Colors.primary }]}>
              +10 XP earned!
            </Text>
          </View>
        )}

        {/* Generated Names */}
        {hasGenerated && (
          <View style={styles.namesContainer}>
            <Text style={styles.sectionTitle}>Tap a name to adopt it</Text>
            {generatedNames.map((name, index) => (
              <Animated.View
                key={`${name}-${index}`}
                style={{
                  opacity: animValues[index],
                  transform: [{ translateY: slideValues[index] }],
                }}
              >
                <TouchableOpacity
                  style={styles.nameCard}
                  onPress={() => adoptName(name)}
                  activeOpacity={0.7}
                >
                  <View style={styles.nameCardLeft}>
                    <View style={styles.nameIndexBadge}>
                      <Text style={styles.nameIndexText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.nameText}>{name}</Text>
                  </View>
                  <View style={styles.adoptButton}>
                    <Ionicons
                      name="arrow-forward-circle"
                      size={24}
                      color={Colors.primary}
                    />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {!hasGenerated && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{hustleInfo?.emoji || '💼'}</Text>
            <Text style={styles.emptyTitle}>
              Ready to find your perfect name?
            </Text>
            <Text style={styles.emptySubtitle}>
              Hit the button above to generate {hustleInfo?.name?.toLowerCase()}{' '}
              business name ideas
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  currentNameCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    ...Shadows.card,
  },
  currentNameLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  currentNameValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  hustleTag: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  hustleTagText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.card,
  },
  generateButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  xpNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  xpNoticeText: {
    fontSize: FontSize.sm,
    color: Colors.amber,
    fontWeight: FontWeight.medium,
  },
  namesContainer: {
    marginTop: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  nameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  nameCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  nameIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameIndexText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  nameText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    flex: 1,
  },
  adoptButton: {
    marginLeft: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: Spacing.huge,
    paddingHorizontal: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
