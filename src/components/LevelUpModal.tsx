import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LEVELS } from '../types';
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from '../constants/theme';

// Native-only: confetti and haptics crash on web
const ConfettiCannon = Platform.OS !== 'web'
  ? React.lazy(() => import('react-native-confetti-cannon').then(m => ({ default: m.default })))
  : null;

let Haptics: any = null;
if (Platform.OS !== 'web') {
  import('expo-haptics').then(m => { Haptics = m; }).catch(() => {});
}

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
      Haptics?.impactAsync?.(Haptics?.ImpactFeedbackStyle?.Medium);
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
          <View style={styles.iconCircle}>
            <Ionicons
              name={(levelInfo?.icon ?? 'leaf-outline') as any}
              size={48}
              color={Colors.primary}
            />
          </View>
          <Text style={styles.levelNumber}>Level {level}</Text>
          <Text style={styles.title}>{levelInfo?.title ?? 'Unknown'}</Text>
        </View>
      </TouchableWithoutFeedback>
      {Platform.OS !== 'web' && ConfettiCannon && (
        <React.Suspense fallback={null}>
          <ConfettiCannon
            count={150}
            origin={{ x: -10, y: 0 }}
            explosionSpeed={350}
            fallSpeed={3000}
            fadeOut={true}
            colors={[
              '#DC2626',
              '#B91C1C',
              '#FFFFFF',
              '#8A8A96',
              '#EF4444',
              '#22C55E',
            ]}
            autoStart={true}
          />
        </React.Suspense>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelUpLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryBg,
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  levelNumber: {
    fontSize: FontSize.mega,
    fontWeight: FontWeight.heavy,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
});
