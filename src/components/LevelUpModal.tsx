import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { LEVELS } from '../types';
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from '../constants/theme';

interface LevelUpModalProps {
  visible: boolean;
  level: number;
  onDismiss: () => void;
}

export default function LevelUpModal({
  visible,
  level,
  onDismiss,
}: LevelUpModalProps) {
  const levelInfo = LEVELS.find((l) => l.level === level);

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <Text style={styles.levelUpLabel}>Level Up!</Text>
          <Text style={styles.icon}>{levelInfo?.icon ?? '🌱'}</Text>
          <Text style={styles.levelNumber}>Level {level}</Text>
          <Text style={styles.title}>{levelInfo?.title ?? 'Unknown'}</Text>
        </View>
      </TouchableWithoutFeedback>
      <ConfettiCannon
        count={150}
        origin={{ x: -10, y: 0 }}
        explosionSpeed={350}
        fallSpeed={3000}
        fadeOut={true}
        colors={[
          '#B388FF',
          '#7C4DFF',
          '#00E676',
          '#FFD740',
          '#FF5252',
          '#40C4FF',
        ]}
        autoStart={true}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 15, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelUpLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.secondaryDim,
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  levelNumber: {
    fontSize: FontSize.mega,
    fontWeight: FontWeight.heavy,
    color: Colors.secondary,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
});
