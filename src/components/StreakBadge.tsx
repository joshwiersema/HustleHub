import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from '../constants/theme';

interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.fireEmoji}>🔥</Text>
      <Text style={styles.streakText}>{streak} day streak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.amberBg,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  fireEmoji: {
    fontSize: 16,
  },
  streakText: {
    color: Colors.amber,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
