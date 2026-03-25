import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, FontWeight } from '../../src/constants/theme';
import { ScreenHeader, Card, StatCard, XPBar, HustleBucksDisplay } from '../../src/components';
import { useProfileStore } from '../../src/store/profileStore';
import { useGameStore } from '../../src/store/gameStore';
import { useClientsStore } from '../../src/store/clientsStore';
import { useJobsStore } from '../../src/store/jobsStore';
import { getXPForLevel, getTotalEarningsFromJobs } from '../../src/utils/gamification';
import { LEVELS } from '../../src/types';
import BadgeGallery from '../../src/components/BadgeGallery';

export default function ProfileScreen() {
  const profile = useProfileStore((s) => s.profile);

  // Granular game state selectors
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const hustleBucks = useGameStore((s) => s.hustleBucks);
  const streak = useGameStore((s) => s.streak);
  const earnedBadges = useGameStore((s) => s.earnedBadges);

  // Data stores
  const clients = useClientsStore((s) => s.clients);
  const jobs = useJobsStore((s) => s.jobs);

  // Derived values
  const levelInfo = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
  const { xpIntoLevel, xpForNextLevel } = getXPForLevel(level, xp);
  const completedJobs = jobs.filter((j) => j.status === 'completed').length;
  const totalEarnings = getTotalEarningsFromJobs(jobs);

  const displayName = profile?.name ?? 'Hustler';
  const displayBusiness = profile?.businessName ?? 'My Business';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Profile" />

        {/* Profile info */}
        <Card style={styles.profileCard}>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileBusiness}>{displayBusiness}</Text>
          <Text style={styles.levelLabel}>{levelInfo.icon} {levelInfo.title}</Text>
        </Card>

        {/* XP Bar */}
        <Card style={styles.xpCard}>
          <XPBar
            currentXP={xpIntoLevel}
            level={level}
            levelTitle={levelInfo.title}
            xpForNextLevel={xpForNextLevel}
          />
        </Card>

        {/* Stats row 1: Level + Streak */}
        <View style={styles.statsRow}>
          <StatCard
            label="Level"
            value={level.toString()}
            icon="trophy-outline"
            color={Colors.secondary}
          />
          <StatCard
            label="Streak"
            value={`${streak} days`}
            icon="flame-outline"
            color={Colors.amber}
          />
        </View>

        {/* Stats row 2: Jobs Done + Earned */}
        <View style={styles.statsRow}>
          <StatCard
            label="Jobs Done"
            value={completedJobs.toString()}
            icon="checkmark-circle-outline"
            color={Colors.primary}
          />
          <StatCard
            label="Earned"
            value={`$${totalEarnings.toFixed(0)}`}
            icon="cash-outline"
            color={Colors.primary}
          />
        </View>

        {/* HustleBucks display */}
        <View style={styles.hbRow}>
          <Text style={styles.hbLabel}>HustleBucks</Text>
          <HustleBucksDisplay amount={hustleBucks} />
        </View>

        {/* Badge Gallery */}
        <BadgeGallery
          earnedBadges={earnedBadges}
          stats={{
            clients: clients.length,
            completedJobs,
            totalEarnings,
            streak,
          }}
        />

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
  profileCard: {
    marginBottom: Spacing.lg,
  },
  profileName: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  profileBusiness: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },
  levelLabel: {
    fontSize: FontSize.sm,
    color: Colors.secondary,
    marginTop: Spacing.xs,
  },
  xpCard: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  hbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  hbLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  bottomSpacer: {
    height: Spacing.huge,
  },
});
