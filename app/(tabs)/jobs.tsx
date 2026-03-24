import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../src/constants/theme';
import { ScreenHeader, StatCard, EmptyState } from '../../src/components';

export default function JobsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="My Jobs" subtitle="0 upcoming" />

        <View style={styles.statsRow}>
          <StatCard
            label="Upcoming"
            value="0"
            icon="calendar-outline"
            color={Colors.primary}
          />
          <StatCard
            label="Completed"
            value="0"
            icon="checkmark-done-outline"
            color={Colors.secondary}
          />
        </View>

        <EmptyState
          icon="briefcase-outline"
          title="No jobs yet"
          subtitle="Your jobs will appear here"
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
