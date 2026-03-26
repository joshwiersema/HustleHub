import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../types';

let Haptics: any = null;
if (Platform.OS !== 'web') {
  import('expo-haptics').then(m => { Haptics = m; }).catch(() => {});
}
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from '../constants/theme';

interface BadgeUnlockSheetProps {
  visible: boolean;
  badge: Badge | null;
  onDismiss: () => void;
}

export default function BadgeUnlockSheet({
  visible,
  badge,
  onDismiss,
}: BadgeUnlockSheetProps) {
  useEffect(() => {
    if (visible) {
      Haptics?.impactAsync?.(Haptics?.ImpactFeedbackStyle?.Medium);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.badgeIconCircle}>
                <Ionicons
                  name={(badge?.icon ?? 'ribbon-outline') as any}
                  size={36}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.earnedLabel}>Badge Earned!</Text>
              <Text style={styles.badgeName}>{badge?.name ?? 'Badge'}</Text>
              <Text style={styles.badgeDescription}>
                {badge?.description ?? ''}
              </Text>
              <Pressable style={styles.dismissButton} onPress={onDismiss}>
                <Text style={styles.dismissButtonText}>Nice!</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    paddingBottom: 48,
    alignItems: 'center',
  },
  badgeIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryBg,
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  earnedLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  badgeName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  dismissButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xxl,
    width: '100%',
    alignItems: 'center',
  },
  dismissButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
});
