import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, FontWeight } from '../../src/constants/theme';
import { ScreenHeader, Card, StatCard, XPBar } from '../../src/components';
import { useProfileStore } from '../../src/store/profileStore';

export default function HomeScreen() {
  const businessName = useProfileStore((s) => s.profile?.businessName ?? 'Your Business');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="HustleHub" subtitle={businessName} />

        {/* 3 StatCards demonstrating all 3 accent colors */}
        <View style={styles.statsRow}>
          <StatCard
            label="Earnings"
            value="$0"
            icon="cash-outline"
            color={Colors.primary}
          />
          <StatCard
            label="XP"
            value="0"
            icon="star-outline"
            color={Colors.secondary}
          />
          <StatCard
            label="H-Bucks"
            value="0"
            icon="diamond-outline"
            color={Colors.amber}
          />
        </View>

        {/* XP Progress Bar */}
        <Card style={styles.xpCard}>
          <XPBar
            currentXP={0}
            level={1}
            levelTitle="Rookie Hustler"
            xpForNextLevel={100}
          />
        </Card>

        {/* Welcome Card */}
        <Card style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Welcome to HustleHub!</Text>
          <Text style={styles.welcomeSubtext}>
            Your hustle journey starts here. Track jobs, clients, and earnings
            all in one place.
          </Text>
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
