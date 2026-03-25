import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../constants/theme';

interface XPBarProps {
  currentXP: number;
  level: number;
  levelTitle: string;
  xpForNextLevel: number;
}

export default function XPBar({ currentXP, level, levelTitle, xpForNextLevel }: XPBarProps) {
  const progress = Math.min(currentXP / xpForNextLevel, 1);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelNumber}>{level}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.levelTitle}>{levelTitle}</Text>
          <Text style={styles.xpText}>
            {currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
          </Text>
        </View>
      </View>

      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFillWrapper, { width: widthInterpolation }]}>
          <LinearGradient
            colors={Colors.gradientPurple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.barFill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const BAR_HEIGHT = 10;

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondaryBg,
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    color: Colors.secondary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.heavy,
  },
  titleContainer: {
    flex: 1,
  },
  levelTitle: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  xpText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  barTrack: {
    height: BAR_HEIGHT,
    backgroundColor: Colors.bgElevated,
    borderRadius: BAR_HEIGHT / 2,
    overflow: 'hidden',
  },
  barFillWrapper: {
    height: '100%',
    borderRadius: BAR_HEIGHT / 2,
    overflow: 'hidden',
  },
  barFill: {
    flex: 1,
    borderRadius: BAR_HEIGHT / 2,
  },
});
