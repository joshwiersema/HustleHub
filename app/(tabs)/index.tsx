import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, FontWeight } from '../../src/constants/theme';
import { ScreenHeader, Card, StatCard, XPBar, StreakBadge, HustleBucksDisplay } from '../../src/components';
import { useProfileStore } from '../../src/store/profileStore';
import { useGameStore } from '../../src/store/gameStore';
import { useJobsStore } from '../../src/store/jobsStore';
import { getXPForLevel, getTotalEarningsFromJobs } from '../../src/utils/gamification';
import { LEVELS } from '../../src/types';

export default function HomeScreen() {
  const businessName = useProfileStore((s) => s.profile?.businessName ?? 'Your Business');

  // Granular gameStore selectors to prevent unnecessary re-renders
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const hustleBucks = useGameStore((s) => s.hustleBucks);
  const streak = useGameStore((s) => s.streak);
  const jobs = useJobsStore((s) => s.jobs);

  // Derived values
  const levelInfo = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
  const { xpIntoLevel, xpForNextLevel } = getXPForLevel(level, xp);
  const completedJobs = jobs.filter((j) => j.status === 'completed').length;
  const totalEarnings = getTotalEarningsFromJobs(jobs);

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
