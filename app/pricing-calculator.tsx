import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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

const TIPS_BY_TYPE: Record<HustleType, string[]> = {
  lawn_care: [
    'Charge more for larger yards or overgrown lawns.',
    'Offer a discount for recurring weekly service to lock in customers.',
    'Add upsells like edging, leaf blowing, or weed pulling.',
    'Check what competitors charge in your area and price competitively.',
  ],
  power_washing: [
    'Price by square footage for driveways and siding.',
    'Charge a minimum fee even for small jobs to cover setup time.',
    'Bundle services (driveway + sidewalk) for a package deal.',
    'Offer a "before & after" photo to justify premium pricing.',
  ],
  dog_walking: [
    'Charge extra for multiple dogs from the same household.',
    'Offer a weekly package discount (5 walks/week deal).',
    'Holiday and weekend walks can be priced 20-30% higher.',
    'Build a route of nearby clients to maximize your time.',
  ],
  tutoring: [
    'SAT/ACT prep tutoring can command $40-60/hour or more.',
    'Offer package deals (10 sessions for the price of 9).',
    'Group tutoring (2-3 students) lets you charge less per person but earn more total.',
    'Specialize in one subject to charge premium rates.',
  ],
  car_detailing: [
    'Create tiered packages: Basic, Premium, and Full Detail.',
    'Charge more for SUVs and trucks due to extra surface area.',
    'Offer mobile detailing at a premium for convenience.',
    'Add-ons like headlight restoration or ceramic coating boost revenue.',
  ],
  snow_removal: [
    'Price based on driveway size: small, medium, large.',
    'Offer seasonal contracts for guaranteed income all winter.',
    'Charge extra for ice treatment and salting.',
    'Emergency/same-day service can be priced at 1.5-2x normal rate.',
  ],
};

export default function PricingCalculatorScreen() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const { showXPToast } = useCelebration();
  const [timePerJob, setTimePerJob] = useState('');
  const [supplyCost, setSupplyCost] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [jobsPerWeek, setJobsPerWeek] = useState('');
  const [calculated, setCalculated] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  const hustleType = profile?.hustleType || 'lawn_care';
  const hustleInfo = HUSTLE_TYPES.find((h) => h.id === hustleType);
  const tips = TIPS_BY_TYPE[hustleType];

  const timeNum = parseFloat(timePerJob) || 0;
  const supplyNum = parseFloat(supplyCost) || 0;
  const rateNum = parseFloat(hourlyRate) || 0;
  const jobsNum = parseFloat(jobsPerWeek) || 0;

  // Suggested price = (time in hours * hourly rate) + supply cost + 15% profit margin
  const laborCost = (timeNum / 60) * rateNum;
  const suggestedPrice = laborCost + supplyNum;
  const withMargin = suggestedPrice * 1.15; // 15% margin
  const weeklyEarnings = withMargin * jobsNum;
  const monthlyEarnings = weeklyEarnings * 4;

  const canCalculate = timeNum > 0 && rateNum > 0;

  const handleCalculate = () => {
    setCalculated(true);

    // Award XP on first calculation (10 XP per CONTEXT.md)
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

  const formatCurrency = (num: number) => {
    return `$${num.toFixed(2)}`;
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
            <Text style={styles.headerTitle}>Pricing Calculator</Text>
            <Text style={styles.headerSubtitle}>
              Figure out what to charge
            </Text>
          </View>
        </View>

        {/* Hustle context */}
        <View style={styles.contextBadge}>
          <Text style={styles.contextText}>
            {hustleInfo?.emoji} Pricing for {hustleInfo?.name}
          </Text>
        </View>

        {/* Input Fields */}
        <View style={styles.inputsContainer}>
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <Ionicons name="time-outline" size={18} color={Colors.primary} />
              <Text style={styles.inputLabel}>Time Per Job (minutes)</Text>
            </View>
            <TextInput
              style={styles.input}
              value={timePerJob}
              onChangeText={setTimePerJob}
              placeholder="e.g. 60"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <Ionicons name="cart-outline" size={18} color={Colors.primary} />
              <Text style={styles.inputLabel}>Supply Cost Per Job ($)</Text>
            </View>
            <TextInput
              style={styles.input}
              value={supplyCost}
              onChangeText={setSupplyCost}
              placeholder="e.g. 5.00"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <Ionicons
                name="cash-outline"
                size={18}
                color={Colors.primary}
              />
              <Text style={styles.inputLabel}>Desired Hourly Rate ($)</Text>
            </View>
            <TextInput
              style={styles.input}
              value={hourlyRate}
              onChangeText={setHourlyRate}
              placeholder="e.g. 25.00"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={Colors.primary}
              />
              <Text style={styles.inputLabel}>Jobs Per Week</Text>
            </View>
            <TextInput
              style={styles.input}
              value={jobsPerWeek}
              onChangeText={setJobsPerWeek}
              placeholder="e.g. 10"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Calculate Button */}
        <TouchableOpacity
          onPress={handleCalculate}
          activeOpacity={0.8}
          disabled={!canCalculate}
        >
          <LinearGradient
            colors={
              canCalculate
                ? (Colors.gradientGreen as unknown as [string, string])
                : (['#333', '#444'] as [string, string])
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.calculateButton}
          >
            <Ionicons name="calculator" size={22} color="#FFFFFF" />
            <Text style={styles.calculateButtonText}>Calculate</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Results */}
        {calculated && canCalculate && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Your Numbers</Text>

            {/* Main Price Card */}
            <View style={styles.mainResultCard}>
              <Text style={styles.resultLabel}>Suggested Price Per Job</Text>
              <Text style={styles.mainResultValue}>
                {formatCurrency(withMargin)}
              </Text>
              <View style={styles.resultBreakdown}>
                <Text style={styles.breakdownText}>
                  Labor: {formatCurrency(laborCost)} + Supplies:{' '}
                  {formatCurrency(supplyNum)} + 15% margin
                </Text>
              </View>
            </View>

            {/* Secondary Results */}
            <View style={styles.secondaryResultsRow}>
              <View style={styles.secondaryResultCard}>
                <Text style={styles.secondaryResultLabel}>Weekly</Text>
                <Text style={styles.secondaryResultValue}>
                  {formatCurrency(weeklyEarnings)}
                </Text>
                <Text style={styles.secondaryResultSub}>
                  {jobsNum > 0 ? `${jobsNum} jobs` : '--'}
                </Text>
              </View>
              <View style={styles.secondaryResultCard}>
                <Text style={styles.secondaryResultLabel}>Monthly</Text>
                <Text style={styles.secondaryResultValue}>
                  {formatCurrency(monthlyEarnings)}
                </Text>
                <Text style={styles.secondaryResultSub}>
                  {jobsNum > 0 ? `${jobsNum * 4} jobs` : '--'}
                </Text>
              </View>
            </View>

            {/* Hourly breakdown */}
            <View style={styles.hourlyCard}>
              <View style={styles.hourlyRow}>
                <Text style={styles.hourlyLabel}>Effective Hourly Rate</Text>
                <Text style={styles.hourlyValue}>
                  {formatCurrency(
                    timeNum > 0 ? (withMargin / timeNum) * 60 : 0,
                  )}
                  /hr
                </Text>
              </View>
              <View style={styles.hourlyBar}>
                <View
                  style={[
                    styles.hourlyBarFill,
                    {
                      width: `${Math.min(
                        ((timeNum > 0 ? (withMargin / timeNum) * 60 : 0) /
                          50) *
                          100,
                        100,
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipsTitleRow}>
            <Ionicons name="bulb" size={20} color={Colors.amber} />
            <Text style={styles.tipsTitle}>Pricing Tips</Text>
          </View>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <View style={styles.tipBullet}>
                <Text style={styles.tipBulletText}>{index + 1}</Text>
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
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
  contextBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  contextText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  inputsContainer: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  inputLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  calculateButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  resultsContainer: {
    marginBottom: Spacing.xxl,
  },
  resultsTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  mainResultCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    marginBottom: Spacing.lg,
    ...Shadows.elevated,
  },
  resultLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  mainResultValue: {
    fontSize: FontSize.mega,
    fontWeight: FontWeight.black,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  resultBreakdown: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  breakdownText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  secondaryResultsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  secondaryResultCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  secondaryResultLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  secondaryResultValue: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.black,
    color: Colors.primary,
  },
  secondaryResultSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  hourlyCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  hourlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  hourlyLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  hourlyValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  hourlyBar: {
    height: 8,
    backgroundColor: Colors.bgElevated,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  hourlyBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  tipsContainer: {
    marginTop: Spacing.lg,
  },
  tipsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tipsTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  tipBullet: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.amberBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  tipBulletText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.amber,
  },
  tipText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
