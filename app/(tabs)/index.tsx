import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/theme';
import { ScreenHeader, Card, StatCard, XPBar, StreakBadge, HustleBucksDisplay } from '../../src/components';
import { useProfileStore } from '../../src/store/profileStore';
import { useGameStore } from '../../src/store/gameStore';
import { useJobsStore } from '../../src/store/jobsStore';
import { usePaymentsStore } from '../../src/store/paymentsStore';
import { getXPForLevel } from '../../src/utils/gamification';
import { parseDateString } from '../../src/utils/dateHelpers';
import { LEVELS } from '../../src/types';

const QUICK_ACTIONS = [
  { icon: 'add-circle-outline' as const, label: 'Add Job', route: '/(tabs)/jobs' },
  { icon: 'person-add-outline' as const, label: 'Add Client', route: '/(tabs)/clients' },
  { icon: 'cash-outline' as const, label: 'Log Payment', route: '/(tabs)/earnings' },
  { icon: 'construct-outline' as const, label: 'Toolkit', route: '/(tabs)/earnings' },
];

export default function HomeScreen() {
  const router = useRouter();
  const businessName = useProfileStore((s) => s.profile?.businessName ?? 'Your Business');

  // Granular gameStore selectors to prevent unnecessary re-renders
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const hustleBucks = useGameStore((s) => s.hustleBucks);
  const streak = useGameStore((s) => s.streak);
  const jobs = useJobsStore((s) => s.jobs);
  const payments = usePaymentsStore((s) => s.payments);

  // Derived values
  const levelInfo = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
  const { xpIntoLevel, xpForNextLevel } = getXPForLevel(level, xp);
  const completedJobs = jobs.filter((j) => j.status === 'completed').length;
  const totalEarnings = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);

  const upcomingJobs = useMemo(() => {
    return jobs
      .filter((j) => j.status === 'upcoming')
      .sort((a, b) => parseDateString(a.date).getTime() - parseDateString(b.date).getTime())
      .slice(0, 3);
  }, [jobs]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="HustleHub" subtitle={businessName} />

        {/* 3 StatCards with live data */}
        <View style={styles.statsRow}>
          <StatCard
            label="Earnings"
            value={`$${totalEarnings.toFixed(0)}`}
            icon="cash-outline"
            color={Colors.primary}
          />
          <StatCard
            label="XP"
            value={xp.toLocaleString()}
            icon="star-outline"
            color={Colors.secondary}
          />
          <StatCard
            label="H-Bucks"
            value={hustleBucks.toLocaleString()}
            icon="diamond-outline"
            color={Colors.amber}
          />
        </View>

        {/* XP Progress Bar */}
        <Card style={styles.xpCard}>
          <XPBar
            currentXP={xpIntoLevel}
            level={level}
            levelTitle={levelInfo.title}
            xpForNextLevel={xpForNextLevel}
          />
        </Card>

        {/* Gamification widget row */}
        <View style={styles.gameRow}>
          <StreakBadge streak={streak} />
          <HustleBucksDisplay amount={hustleBucks} />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.label}
              onPress={() => router.push(action.route as any)}
              style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name={action.icon} size={24} color={Colors.primary} />
              </View>
              <Text style={styles.quickActionLabel} numberOfLines={1}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Upcoming Jobs */}
        <Text style={styles.sectionTitle}>Coming Up</Text>
        {upcomingJobs.length > 0 ? (
          upcomingJobs.map((job) => (
            <Pressable
              key={job.id}
              onPress={() => router.push(`/job-detail?id=${job.id}` as any)}
              style={({ pressed }) => [styles.jobCard, pressed && styles.jobCardPressed]}
            >
              <View style={styles.jobCardLeft}>
                <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                <Text style={styles.jobMeta}>{job.date} {job.time ? `at ${job.time}` : ''}</Text>
                <Text style={styles.jobClient} numberOfLines={1}>{job.clientName}</Text>
              </View>
              <Text style={styles.jobPrice}>${job.price.toFixed(0)}</Text>
            </Pressable>
          ))
        ) : (
          <Card style={styles.emptyUpcoming}>
            <Text style={styles.emptyUpcomingText}>No upcoming jobs</Text>
            <Text style={styles.emptyUpcomingSubtext}>Tap "Add Job" above to schedule one</Text>
          </Card>
        )}

        {/* Welcome / Motivation Card */}
        <Card style={styles.welcomeCard}>
          {completedJobs === 0 ? (
            <>
              <Text style={styles.welcomeText}>Welcome to HustleHub!</Text>
              <Text style={styles.welcomeSubtext}>
                Your hustle journey starts here. Track jobs, clients, and earnings
                all in one place.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.welcomeText}>Keep hustling!</Text>
              <Text style={styles.welcomeSubtext}>
                You've completed {completedJobs} {completedJobs === 1 ? 'job' : 'jobs'} and earned ${totalEarnings.toFixed(0)} so far. Keep it up!
              </Text>
            </>
          )}
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  xpCard: {
    marginBottom: Spacing.lg,
  },
  gameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionPressed: {
    opacity: 0.7,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  jobCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobCardPressed: {
    backgroundColor: Colors.bgCardHover,
  },
  jobCardLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  jobTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  jobMeta: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  jobClient: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  jobPrice: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  emptyUpcoming: {
    marginBottom: Spacing.lg,
  },
  emptyUpcomingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyUpcomingSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  welcomeCard: {
    marginBottom: Spacing.lg,
  },
  welcomeText: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  welcomeSubtext: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: Spacing.huge,
  },
});
