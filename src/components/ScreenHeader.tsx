import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, FontWeight } from '../constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
}

export default function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.heavy,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    marginTop: Spacing.xs,
  },
});
