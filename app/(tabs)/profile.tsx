import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/theme';
import { ScreenHeader, Card, StatCard, XPBar, HustleBucksDisplay } from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
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

  const handleLogout = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        onPress: () => {
          useAuthStore.getState().logout().catch(console.error);
        },
      },
    ]);
  }, []);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete all local data and sign you out. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            useAuthStore.getState().logout().catch(console.error);
          },
        },
      ],
    );
  }, []);

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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name={levelInfo.icon as any} size={16} color={Colors.primary} />
            <Text style={styles.levelLabel}>{levelInfo.title}</Text>
          </View>
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
            color={Colors.primary}
          />
          <StatCard
            label="Streak"
            value={`${streak} days`}
            icon="flame-outline"
            color={Colors.primary}
          />
        </View>

        {/* Stats row 2: HustleBucks + Clients */}
        <View style={styles.statsRow}>
          <StatCard
            label="H-Bucks"
            value={hustleBucks.toLocaleString()}
            icon="diamond-outline"
            color={Colors.textSecondary}
          />
          <StatCard
            label="Clients"
            value={clients.length.toString()}
            icon="people-outline"
            color={Colors.textSecondary}
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
            color={Colors.textSecondary}
          />
          <StatCard
            label="Days Active"
            value={daysActive.toString()}
            icon="calendar-outline"
            color={Colors.textSecondary}
          />
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>Settings</Text>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.text} />
          <Text style={styles.settingsButtonText}>Sign Out</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Pressable>

        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [styles.resetButton, pressed && styles.resetButtonPressed]}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
          <Text style={styles.resetButtonText}>Delete Account</Text>
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
    color: Colors.primary,
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
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  settingsButtonPressed: {
    backgroundColor: Colors.bgCardHover,
  },
  settingsButtonText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  resetButtonPressed: {
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
  },
  resetButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.error,
  },
  bottomSpacer: {
    height: Spacing.huge,
  },
});
