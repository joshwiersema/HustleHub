import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';

type ButtonSize = 'sm' | 'md' | 'lg';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  colors?: readonly [string, string, ...string[]];
  disabled?: boolean;
  size?: ButtonSize;
  style?: ViewStyle;
}

const sizeConfig: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { height: 44, paddingHorizontal: Spacing.lg, fontSize: FontSize.sm },
  md: { height: 48, paddingHorizontal: Spacing.xxl, fontSize: FontSize.md },
  lg: { height: 56, paddingHorizontal: Spacing.xxxl, fontSize: FontSize.lg },
};

export default function GradientButton({
  title,
  onPress,
  colors,
  disabled = false,
  size = 'md',
  style,
}: GradientButtonProps) {
  const config = sizeConfig[size];
  const gradientColors = colors ?? Colors.gradientGreen;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrapper,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={disabled ? [Colors.textMuted, Colors.textMuted] : gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          {
            height: config.height,
            paddingHorizontal: config.paddingHorizontal,
            borderRadius: config.height / 2,
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              fontSize: config.fontSize,
              color: disabled ? Colors.textSecondary : Colors.textInverse,
            },
          ]}
        >
          {title}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...Shadows.card,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
