import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/theme';
import { ScreenHeader, Card, StatCard, XPBar, HustleBucksDisplay } from '../../src/components';
import { useProfileStore } from '../../src/store/profileStore';
import { useGameStore } from '../../src/store/gameStore';
import { useClientsStore } from '../../src/store/clientsStore';
import { useJobsStore } from '../../src/store/jobsStore';
import { usePaymentsStore } from '../../src/store/paymentsStore';
import { getXPForLevel } from '../../src/utils/gamification';
import { LEVELS } from '../../src/types';
import BadgeGallery from '../../src/components/BadgeGallery';

export default function ProfileScreen() {
  const router = useRouter();
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
  const payments = usePaymentsStore((s) => s.payments);

  // Derived values
  const levelInfo = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
  const { xpIntoLevel, xpForNextLevel } = getXPForLevel(level, xp);
  const completedJobs = jobs.filter((j) => j.status === 'completed').length;
  const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);

  const displayName = profile?.name ?? 'Hustler';
  const displayBusiness = profile?.businessName ?? 'My Business';

  const daysActive = useMemo(() => {
    if (!profile?.joinedDate) return 1;
    const joined = new Date(profile.joinedDate);
    const now = new Date();
    const diffMs = now.getTime() - joined.getTime();
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, [profile?.joinedDate]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your data including clients, jobs, payments, and progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            useProfileStore.getState().reset();
            useClientsStore.getState().reset();
            useJobsStore.getState().reset();
            usePaymentsStore.getState().reset();
            useGameStore.getState().reset();
            router.replace('/onboarding');
          },
        },
      ],
    );
  }, [router]);

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

        {/* Stats row 2: HustleBucks + Clients */}
        <View style={styles.statsRow}>
          <StatCard
            label="H-Bucks"
            value={hustleBucks.toLocaleString()}
            icon="diamond-outline"
            color={Colors.amber}
          />
          <StatCard
            label="Clients"
            value={clients.length.toString()}
            icon="people-outline"
            color={Colors.secondary}
          />
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

        {/* Lifetime Stats */}
        <Text style={styles.sectionTitle}>Lifetime Stats</Text>
        <View style={styles.statsRow}>
          <StatCard
            label="Total Earned"
            value={`$${totalEarnings.toFixed(0)}`}
            icon="cash-outline"
            color={Colors.primary}
          />
          <StatCard
            label="Jobs Done"
            value={completedJobs.toString()}
            icon="checkmark-circle-outline"
            color={Colors.primary}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            label="Clients"
            value={clients.length.toString()}
            icon="people-outline"
            color={Colors.secondary}
          />
          <StatCard
            label="Days Active"
            value={daysActive.toString()}
            icon="calendar-outline"
            color={Colors.amber}
          />
        </View>

        {/* Leaderboard Teaser */}
        <Text style={styles.sectionTitle}>Local Rankings</Text>
        <Card style={styles.leaderboardCard}>
          <View style={styles.leaderboardHeader}>
            <Text style={styles.leaderboardTitle}>Coming Soon</Text>
            <Text style={styles.leaderboardSubtitle}>See how you stack up</Text>
          </View>
          {/* 3 fake entries */}
          <View style={styles.leaderboardEntry}>
            <Text style={styles.leaderboardRank}>1</Text>
            <Text style={styles.leaderboardName}>LawnKing_Mike</Text>
            <Text style={styles.leaderboardXP}>4,200 XP</Text>
          </View>
          <View style={styles.leaderboardEntry}>
            <Text style={styles.leaderboardRank}>2</Text>
            <Text style={styles.leaderboardName}>DetailQueen_Sara</Text>
            <Text style={styles.leaderboardXP}>3,800 XP</Text>
          </View>
          <View style={styles.leaderboardEntry}>
            <Text style={styles.leaderboardRank}>3</Text>
            <Text style={styles.leaderboardName}>TutorPro_Alex</Text>
            <Text style={styles.leaderboardXP}>3,100 XP</Text>
          </View>
          {/* User's position */}
          <View style={[styles.leaderboardEntry, styles.leaderboardEntryYou]}>
            <Text style={styles.leaderboardRank}>--</Text>
            <Text style={[styles.leaderboardName, { color: Colors.primary }]}>You ({displayBusiness})</Text>
            <Text style={[styles.leaderboardXP, { color: Colors.primary }]}>{xp.toLocaleString()} XP</Text>
          </View>
        </Card>

        {/* Data Reset */}
        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [styles.resetButton, pressed && styles.resetButtonPressed]}
        >
          <Text style={styles.resetButtonText}>Reset All Data</Text>
        </Pressable>

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
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  leaderboardCard: {
    marginBottom: Spacing.lg,
  },
  leaderboardHeader: {
    marginBottom: Spacing.md,
  },
  leaderboardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.amber,
  },
  leaderboardSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  leaderboardEntryYou: {
    borderTopWidth: 2,
    borderTopColor: Colors.primaryBorder,
    marginTop: Spacing.xs,
    paddingTop: Spacing.md,
  },
  leaderboardRank: {
    width: 28,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
  },
  leaderboardName: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  leaderboardXP: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  resetButton: {
    marginTop: Spacing.xxl,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: 'center',
  },
  resetButtonPressed: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
  },
  resetButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.error,
  },
  bottomSpacer: {
    height: Spacing.huge,
  },
});
