import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../constants/theme';

interface BadgeIconProps {
  icon: string;
  size?: number;
  unlocked?: boolean;
}

export default function BadgeIcon({ icon, size = 48, unlocked = true }: BadgeIconProps) {
  const iconSize = size * 0.45;

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        unlocked ? styles.badgeUnlocked : styles.badgeLocked,
      ]}
    >
      <Ionicons
        name={icon as any}
        size={iconSize}
        color={unlocked ? Colors.primary : Colors.textMuted}
        style={!unlocked ? { opacity: 0.3 } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeUnlocked: {
    backgroundColor: Colors.primaryBg,
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
  },
  badgeLocked: {
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderColor: Colors.border,
    opacity: 0.45,
  },
});
