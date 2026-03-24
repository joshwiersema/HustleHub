import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, FontWeight } from '../../src/constants/theme';
import { ScreenHeader, Card, StatCard, BadgeIcon } from '../../src/components';
import { useProfileStore } from '../../src/store/profileStore';
import { BADGES } from '../../src/types';

export default function ProfileScreen() {
  const profile = useProfileStore((s) => s.profile);

  const displayName = profile?.name ?? 'Hustler';
  const displayBusiness = profile?.businessName ?? 'My Business';
  const firstBadge = BADGES[0];

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
        </Card>

        {/* Level & Streak stats */}
        <View style={styles.statsRow}>
          <StatCard
            label="Level"
            value="1"
            icon="trophy-outline"
            color={Colors.secondary}
          />
          <StatCard
            label="Streak"
            value="0 days"
            icon="flame-outline"
            color={Colors.amber}
          />
        </View>

        {/* Badge preview */}
        <Card style={styles.badgeCard}>
          <Text style={styles.badgeTitle}>Next Badge</Text>
          <View style={styles.badgeRow}>
            <BadgeIcon emoji={firstBadge.icon} size={48} unlocked={false} />
            <View style={styles.badgeInfo}>
              <Text style={styles.badgeName}>{firstBadge.name}</Text>
              <Text style={styles.badgeDesc}>{firstBadge.requirement}</Text>
            </View>
          </View>
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
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  badgeCard: {
    marginBottom: Spacing.lg,
  },
  badgeTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  badgeDesc: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  bottomSpacer: {
    height: Spacing.huge,
  },
});
