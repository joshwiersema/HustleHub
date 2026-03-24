import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../src/constants/theme';
import { ScreenHeader, StatCard, EmptyState } from '../../src/components';

export default function EarningsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Earnings" subtitle="Track your hustle" />

        <View style={styles.statsRow}>
          <StatCard
            label="Total Earned"
            value="$0"
            icon="cash-outline"
            color={Colors.primary}
          />
          <StatCard
            label="Avg Per Job"
            value="$0"
            icon="trending-up-outline"
            color={Colors.amber}
          />
        </View>

        <EmptyState
          icon="bar-chart-outline"
          title="No earnings yet"
          subtitle="Complete jobs to see your earnings here"
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
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  bottomSpacer: {
    height: Spacing.huge,
  },
});
