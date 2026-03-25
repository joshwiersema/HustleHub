import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
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
import { HustleType, HustleTypeInfo, HUSTLE_TYPES } from '../src/types';
import { useProfileStore } from '../src/store/profileStore';
import { useGameStore } from '../src/store/gameStore';
import { useClientsStore } from '../src/store/clientsStore';
import { useJobsStore } from '../src/store/jobsStore';
import { usePaymentsStore } from '../src/store/paymentsStore';
import { useCelebration } from '../src/components/CelebrationProvider';
import { checkBadges } from '../src/utils/gamification';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface HustleDetails {
  checklist: string[];
  tips: string[];
  equipment: string[];
}

const HUSTLE_DETAILS: Record<HustleType, HustleDetails> = {
  lawn_care: {
    checklist: [
      'Get a reliable lawn mower (push or self-propelled)',
      'Print flyers and post in your neighborhood',
      'Set your pricing (start at $25-35 per yard)',
      'Get your first 3 clients through family or neighbors',
      'Create a simple schedule to track your jobs',
    ],
    tips: [
      'Start with neighbors and family friends to build experience.',
      'Always show up on time -- reliability is your #1 marketing tool.',
      'Take before/after photos for your portfolio.',
      'Offer package deals for weekly service to lock in recurring income.',
    ],
    equipment: [
      'Lawn mower',
      'String trimmer / weed eater',
      'Leaf blower',
      'Edger',
      'Gas can',
      'Trash bags',
      'Work gloves',
    ],
  },
  power_washing: {
    checklist: [
      'Research and buy/rent a pressure washer (1500-3000 PSI)',
      'Practice on your own home first',
      'Set pricing by job type (driveway, deck, siding)',
      'Post before/after photos on social media',
      'Get your first client through a discounted demo',
    ],
    tips: [
      'Always test pressure on an inconspicuous area first.',
      'Driveways are the easiest jobs to start with.',
      'Upsell -- if you wash the driveway, offer the sidewalk too.',
      'Invest in surface cleaner attachments for faster driveway jobs.',
    ],
    equipment: [
      'Pressure washer (1500-3000 PSI)',
      'Garden hose (50-100 ft)',
      'Surface cleaner attachment',
      'Cleaning solution / degreaser',
      'Safety goggles',
      'Work boots',
    ],
  },
  dog_walking: {
    checklist: [
      'Get comfortable handling dogs of all sizes',
      'Create profiles on pet-sitting apps (Rover, Wag)',
      'Start with dogs of family and friends',
      'Get a sturdy leash and treat pouch',
      'Set up a simple booking system',
    ],
    tips: [
      'Always meet the dog before your first walk to build trust.',
      'Keep treats on hand for positive reinforcement.',
      'Group nearby walks together to maximize earnings per hour.',
      'Send owners photos and updates during walks -- they love it!',
    ],
    equipment: [
      'Sturdy leash (6 ft)',
      'Poop bags',
      'Treat pouch with treats',
      'Water bottle + portable bowl',
      'First aid kit (basic)',
      'Comfortable walking shoes',
    ],
  },
  tutoring: {
    checklist: [
      'Identify your strongest subjects',
      'Create a simple lesson plan template',
      'Spread the word at school and to parents in your community',
      'Set up a quiet study space (yours or the library)',
      'Get your first student through a free trial session',
    ],
    tips: [
      'Specialize in 1-2 subjects to build a strong reputation.',
      'Use practice problems and quizzes to track student progress.',
      'Be patient and encouraging -- attitude matters more than content.',
      'Ask satisfied parents for referrals -- word of mouth is king.',
    ],
    equipment: [
      'Whiteboard + markers (or tablet)',
      'Printed worksheets / practice problems',
      'Calculator',
      'Notebook for tracking progress',
      'Reliable Wi-Fi (for online sessions)',
      'Quiet workspace',
    ],
  },
  car_detailing: {
    checklist: [
      'Buy a basic detailing kit (bucket, microfiber, soap, wax)',
      'Practice on your own car or family vehicles',
      'Create tiered pricing (basic, premium, full)',
      'Take professional-looking before/after photos',
      'Offer a discounted first detail to build reviews',
    ],
    tips: [
      'Always work in the shade to prevent water spots.',
      'Interior detailing can add $20-40 to each job.',
      'Use two-bucket wash method to avoid scratching paint.',
      'Offer mobile detailing -- going to the customer is a huge selling point.',
    ],
    equipment: [
      'Buckets (2) + grit guards',
      'Microfiber towels (lots)',
      'Car wash soap',
      'Wax / sealant',
      'Interior cleaner + brush',
      'Vacuum (wet/dry)',
      'Tire shine',
    ],
  },
  snow_removal: {
    checklist: [
      'Get a sturdy snow shovel and ice melt',
      'Map out potential clients in your neighborhood before winter',
      'Set pricing (per job or seasonal contract)',
      'Plan for early morning availability after storms',
      'Line up your first 5 customers before the first snowfall',
    ],
    tips: [
      'Sign seasonal contracts before winter for guaranteed income.',
      'Check weather forecasts and be proactive with clients.',
      'Offer salting/ice treatment as an add-on service.',
      'Speed matters -- the first shoveler in the neighborhood gets referrals.',
    ],
    equipment: [
      'Snow shovel (ergonomic)',
      'Ice melt / rock salt',
      'Snow blower (optional but profitable)',
      'Warm waterproof boots',
      'Insulated gloves',
      'Headlamp (for early morning jobs)',
    ],
  },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: Colors.success,
  Medium: Colors.amber,
  Hard: Colors.error,
};

export default function IdeasScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<HustleType | null>(null);
  const currentHustleType = useProfileStore((s) => s.profile?.hustleType ?? null);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const { showXPToast } = useCelebration();
  const [xpAwarded, setXpAwarded] = useState(false);

  const toggleExpand = (id: HustleType) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const isExpanding = expandedId !== id;
    setExpandedId(expandedId === id ? null : id);

    // Gamification on first expansion per session
    if (isExpanding && !xpAwarded) {
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
        { totalClients: clients.length, completedJobs, totalEarnings },
      );
      newBadges.forEach((badgeId) => useGameStore.getState().earnBadge(badgeId));
      showXPToast(10);
      setXpAwarded(true);
    }
  };

  const handleStartHustle = (hustle: HustleTypeInfo) => {
    if (currentHustleType === hustle.id) {
      Alert.alert(
        'Already Your Hustle!',
        `You're already running a ${hustle.name} business.`,
      );
      return;
    }

    Alert.alert(
      `Start ${hustle.name}?`,
      `Switch your hustle type to ${hustle.name}? This will update your profile.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start It!',
          onPress: () => {
            // Synchronous Zustand update -- no try/catch needed
            updateProfile({ hustleType: hustle.id });
            // Zustand selector auto-updates -- no local state needed
            Alert.alert(
              'Hustle Updated!',
              `You're now running a ${hustle.name} business. Let's go!`,
            );
          },
        },
      ],
    );
  };

  const renderExpandedContent = (hustle: HustleTypeInfo) => {
    const details = HUSTLE_DETAILS[hustle.id];
    const isCurrentHustle = currentHustleType === hustle.id;

    return (
      <View style={styles.expandedContent}>
        {/* Getting Started Checklist */}
        <View style={styles.expandedSection}>
          <View style={styles.expandedSectionHeader}>
            <Ionicons
              name="checkbox-outline"
              size={18}
              color={Colors.primary}
            />
            <Text style={styles.expandedSectionTitle}>Getting Started</Text>
          </View>
          {details.checklist.map((item, index) => (
            <View key={index} style={styles.checklistItem}>
              <View style={styles.checklistBullet}>
                <Text style={styles.checklistBulletText}>{index + 1}</Text>
              </View>
              <Text style={styles.checklistText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Pro Tips */}
        <View style={styles.expandedSection}>
          <View style={styles.expandedSectionHeader}>
            <Ionicons name="bulb" size={18} color={Colors.amber} />
            <Text style={styles.expandedSectionTitle}>Pro Tips</Text>
          </View>
          {details.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Ionicons
                name="star"
                size={12}
                color={Colors.amber}
                style={{ marginTop: 3 }}
              />
              <Text style={styles.tipItemText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Equipment Needed */}
        <View style={styles.expandedSection}>
          <View style={styles.expandedSectionHeader}>
            <Ionicons name="construct" size={18} color={Colors.secondary} />
            <Text style={styles.expandedSectionTitle}>Equipment Needed</Text>
          </View>
          <View style={styles.equipmentGrid}>
            {details.equipment.map((item, index) => (
              <View key={index} style={styles.equipmentTag}>
                <Text style={styles.equipmentTagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          onPress={() => handleStartHustle(hustle)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              isCurrentHustle
                ? (['#333', '#444'] as [string, string])
                : (Colors.gradientGreen as unknown as [string, string])
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButton}
          >
            <Ionicons
              name={isCurrentHustle ? 'checkmark-circle' : 'rocket'}
              size={22}
              color="#FFFFFF"
            />
            <Text style={styles.startButtonText}>
              {isCurrentHustle ? 'Current Hustle' : 'Start This Hustle'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
            <Text style={styles.headerTitle}>Hustle Ideas</Text>
            <Text style={styles.headerSubtitle}>
              Find your next money-making hustle
            </Text>
          </View>
        </View>

        {/* Hustle Cards */}
        {HUSTLE_TYPES.map((hustle) => {
          const isExpanded = expandedId === hustle.id;
          const isCurrentHustle = currentHustleType === hustle.id;
          const diffColor = DIFFICULTY_COLORS[hustle.difficulty];

          return (
            <TouchableOpacity
              key={hustle.id}
              style={[
                styles.hustleCard,
                isExpanded && styles.hustleCardExpanded,
                isCurrentHustle && styles.hustleCardCurrent,
              ]}
              onPress={() => toggleExpand(hustle.id)}
              activeOpacity={0.8}
            >
              {/* Card Header */}
              <View style={styles.hustleCardHeader}>
                <View style={styles.hustleCardLeft}>
                  <Text style={styles.hustleEmoji}>{hustle.emoji}</Text>
                  <View style={styles.hustleCardInfo}>
                    <View style={styles.hustleNameRow}>
                      <Text style={styles.hustleName}>{hustle.name}</Text>
                      {isCurrentHustle && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>YOURS</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.hustleDescription} numberOfLines={isExpanded ? undefined : 2}>
                      {hustle.description}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={Colors.textMuted}
                />
              </View>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons
                    name="cash-outline"
                    size={14}
                    color={Colors.primary}
                  />
                  <Text style={styles.statText}>{hustle.avgEarnings}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons
                    name="wallet-outline"
                    size={14}
                    color={Colors.amber}
                  />
                  <Text style={styles.statText}>{hustle.startupCost}</Text>
                </View>
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: `${diffColor}20`, borderColor: `${diffColor}40` },
                  ]}
                >
                  <Text style={[styles.difficultyText, { color: diffColor }]}>
                    {hustle.difficulty}
                  </Text>
                </View>
              </View>

              {/* Expanded Content */}
              {isExpanded && renderExpandedContent(hustle)}
            </TouchableOpacity>
          );
        })}

        {/* Bottom padding */}
        <View style={{ height: Spacing.huge }} />
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
  hustleCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  hustleCardExpanded: {
    borderColor: Colors.primaryBorder,
  },
  hustleCardCurrent: {
    borderColor: Colors.primaryBorder,
  },
  hustleCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  hustleCardLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: Spacing.md,
  },
  hustleEmoji: {
    fontSize: 36,
    marginTop: 2,
  },
  hustleCardInfo: {
    flex: 1,
  },
  hustleNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  hustleName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  currentBadge: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  currentBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 1,
  },
  hustleDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  difficultyBadge: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    marginLeft: 'auto',
  },
  difficultyText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  expandedContent: {
    marginTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xl,
  },
  expandedSection: {
    marginBottom: Spacing.xl,
  },
  expandedSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  expandedSectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  checklistBullet: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checklistBulletText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  checklistText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  tipItem: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  tipItemText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  equipmentTag: {
    backgroundColor: Colors.secondaryBg,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.secondaryBorder,
  },
  equipmentTagText: {
    fontSize: FontSize.sm,
    color: Colors.secondary,
    fontWeight: FontWeight.medium,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    ...Shadows.card,
  },
  startButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
});
