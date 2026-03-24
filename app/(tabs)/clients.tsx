import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../src/constants/theme';
import { ScreenHeader, StatCard, EmptyState } from '../../src/components';

export default function ClientsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Clients" subtitle="0 total" />

        <View style={styles.statsRow}>
          <StatCard
            label="Total Clients"
            value="0"
            icon="people-outline"
            color={Colors.primary}
          />
        </View>

        <EmptyState
          icon="people-outline"
          title="No clients yet"
          subtitle="Add your first client to get started"
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
