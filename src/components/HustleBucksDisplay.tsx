import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';

interface HustleBucksDisplayProps {
  amount: number;
}

export default function HustleBucksDisplay({ amount }: HustleBucksDisplayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="logo-bitcoin" size={14} color={Colors.amber} />
      </View>
      <Text style={styles.amount}>{amount.toLocaleString()}</Text>
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
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 215, 64, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    color: Colors.amber,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
});
