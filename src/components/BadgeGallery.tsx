import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from '../constants/theme';
import { BADGES } from '../types';
import { getBadgeProgress } from '../utils/gamification';
import BadgeIcon from './BadgeIcon';

interface BadgeGalleryProps {
  earnedBadges: string[];
  stats: {
    clients: number;
    completedJobs: number;
    totalEarnings: number;
    streak: number;
  };
}

export default function BadgeGallery({ earnedBadges, stats }: BadgeGalleryProps) {
  const [expandedBadgeId, setExpandedBadgeId] = useState<string | null>(null);

  const handlePress = (badgeId: string) => {
    setExpandedBadgeId((prev) => (prev === badgeId ? null : badgeId));
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Badge Collection</Text>

      <View style={styles.grid}>
        {BADGES.map((badge) => {
          const isEarned = earnedBadges.includes(badge.id);
          const isExpanded = expandedBadgeId === badge.id;
          const progress = getBadgeProgress(badge, stats);

          if (isExpanded) {
            return (
              <TouchableOpacity
                key={badge.id}
                activeOpacity={0.7}
                onPress={() => handlePress(badge.id)}
                style={[
                  styles.cellExpanded,
                  isEarned ? styles.cellEarned : styles.cellLocked,
                  isEarned && styles.cellGlow,
                ]}
              >
                <BadgeIcon icon={badge.icon} size={64} unlocked={isEarned} />
                <Text style={styles.expandedName}>{badge.name}</Text>
                <Text style={styles.expandedDesc}>{badge.description}</Text>
                <Text style={styles.expandedReq}>{badge.requirement}</Text>

                {isEarned ? (
                  <Text style={styles.earnedText}>Earned!</Text>
                ) : (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min((progress.current / progress.target) * 100, 100)}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressLabel}>{progress.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={badge.id}
              activeOpacity={0.7}
              onPress={() => handlePress(badge.id)}
              style={[
                styles.cell,
                isEarned ? styles.cellEarned : styles.cellLocked,
                isEarned && styles.cellGlow,
                !isEarned && styles.cellDimmed,
              ]}
            >
              {!isEarned && (
                <View style={styles.lockIcon}>
                  <Ionicons name="lock-closed" size={12} color={Colors.textMuted} />
                </View>
              )}
              <BadgeIcon icon={badge.icon} size={56} unlocked={isEarned} />
              <Text
                style={[
                  styles.cellName,
                  { color: isEarned ? Colors.text : Colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {badge.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cell: {
    width: '48%',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  cellExpanded: {
    width: '100%',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  cellEarned: {
    borderColor: Colors.primaryBorder,
  },
  cellLocked: {
    borderColor: Colors.border,
  },
  cellDimmed: {
    opacity: 0.7,
  },
  cellGlow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  lockIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  cellName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  expandedName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  expandedDesc: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  expandedReq: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  earnedText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    marginTop: Spacing.md,
  },
  progressContainer: {
    width: '100%',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.bgElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
