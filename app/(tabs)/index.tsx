import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows } from '../../src/constants/theme';
import { Card, XPBar, StreakBadge, HustleBucksDisplay } from '../../src/components';
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
  { icon: 'grid-outline' as const, label: 'Toolkit', route: '/toolkit' },
];

export default function HomeScreen() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const businessName = profile?.businessName ?? 'Your Business';

  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const hustleBucks = useGameStore((s) => s.hustleBucks);
  const streak = useGameStore((s) => s.streak);
  const jobs = useJobsStore((s) => s.jobs);
  const payments = usePaymentsStore((s) => s.payments);

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
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>HustleHub</Text>
            <Text style={styles.businessName}>{businessName}</Text>
          </View>
          <View style={styles.headerRight}>
            <StreakBadge streak={streak} />
          </View>
        </View>

        {/* Hero Stat — Total Earnings */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>TOTAL EARNINGS</Text>
          <Text style={styles.heroValue}>
            ${totalEarnings.toFixed(0)}
          </Text>
          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Ionicons name="briefcase-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.heroMetaText}>{completedJobs} jobs</Text>
            </View>
            <View style={styles.heroMetaDot} />
            <View style={styles.heroMetaItem}>
              <Ionicons name="flash-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.heroMetaText}>{xp.toLocaleString()} XP</Text>
            </View>
            <View style={styles.heroMetaDot} />
            <View style={styles.heroMetaItem}>
              <Ionicons name="diamond-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.heroMetaText}>{hustleBucks} HB</Text>
            </View>
          </View>
        </View>

        {/* XP Progress */}
        <Card style={styles.xpCard}>
          <XPBar
            currentXP={xpIntoLevel}
            level={level}
            levelTitle={levelInfo.title}
            xpForNextLevel={xpForNextLevel}
          />
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.label}
              onPress={() => router.push(action.route as any)}
              style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name={action.icon} size={22} color={Colors.text} />
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
              onPress={() => router.push(`/job-detail?jobId=${job.id}` as any)}
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
          <View style={styles.emptyUpcoming}>
            <Ionicons name="calendar-outline" size={20} color={Colors.textMuted} />
            <Text style={styles.emptyUpcomingText}>No upcoming jobs</Text>
          </View>
        )}

        {/* Activity Summary */}
        {completedJobs > 0 && (
          <View style={styles.summaryCard}>
            <Ionicons name="trending-up" size={20} color={Colors.primary} />
            <Text style={styles.summaryText}>
              {completedJobs} {completedJobs === 1 ? 'job' : 'jobs'} completed — ${totalEarnings.toFixed(0)} earned
            </Text>
          </View>
        )}

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
    paddingHorizontal: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.heavy,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  businessName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  // Hero stat
  heroCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  heroLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  heroValue: {
    fontSize: FontSize.mega,
    fontWeight: FontWeight.black,
    color: Colors.text,
    letterSpacing: -2,
    marginBottom: Spacing.md,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroMetaText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  heroMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
  },
  xpCard: {
    marginBottom: Spacing.lg,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionPressed: {
    opacity: 0.7,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  jobCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
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
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  emptyUpcoming: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyUpcomingText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  summaryText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  bottomSpacer: {
    height: Spacing.huge,
  },
});
