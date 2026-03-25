import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '../constants/theme';

interface BadgeIconProps {
  emoji: string;
  size?: number;
  unlocked?: boolean;
}

export default function BadgeIcon({ emoji, size = 48, unlocked = true }: BadgeIconProps) {
  const emojiSize = size * 0.5;

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
      <Text
        style={[
          styles.emoji,
          { fontSize: emojiSize },
          !unlocked && styles.emojiLocked,
        ]}
      >
        {emoji}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeUnlocked: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 2,
    borderColor: Colors.secondaryBorder,
  },
  badgeLocked: {
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderColor: Colors.border,
    opacity: 0.45,
  },
  emoji: {
    textAlign: 'center',
  },
  emojiLocked: {
    opacity: 0.3,
  },
});
