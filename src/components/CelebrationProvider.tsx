import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useGameStore } from '../store/gameStore';
import { BADGES } from '../types';
import XPToast from './XPToast';
import LevelUpModal from './LevelUpModal';
import BadgeUnlockSheet from './BadgeUnlockSheet';

interface CelebrationContextType {
  showXPToast: (amount: number) => void;
}

const CelebrationContext = createContext<CelebrationContextType>({
  showXPToast: () => {},
});

type CelebrationItem =
  | { type: 'level-up'; level: number }
  | { type: 'badge'; badgeId: string };

export const CelebrationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // XP toast state (non-blocking, shows alongside queued celebrations)
  const [xpToast, setXpToast] = useState({ amount: 0, visible: false });

  // Celebration queue
  const queueRef = useRef<CelebrationItem[]>([]);
  const [currentCelebration, setCurrentCelebration] =
    useState<CelebrationItem | null>(null);

  const processQueue = useCallback(() => {
    if (queueRef.current.length > 0) {
      const next = queueRef.current.shift()!;
      setCurrentCelebration(next);
    }
  }, []);

  const showXPToast = useCallback((amount: number) => {
    setXpToast({ amount, visible: true });
  }, []);

  const handleXPToastHide = useCallback(() => {
    setXpToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleDismiss = useCallback(() => {
    setCurrentCelebration(null);
  }, []);

  // Process next item in queue when current celebration is dismissed
  useEffect(() => {
    if (currentCelebration === null) {
      processQueue();
    }
  }, [currentCelebration, processQueue]);

  // Subscribe to gameStore for level and badge changes
  useEffect(() => {
    const state = useGameStore.getState();
    let prevLevel = state.level;
    let prevBadges = [...state.earnedBadges];

    const unsub = useGameStore.subscribe((newState) => {
      // Detect level-up
      if (newState.level > prevLevel) {
        queueRef.current.push({ type: 'level-up', level: newState.level });
        prevLevel = newState.level;
        // Trigger processing if nothing currently showing
        if (!currentCelebration && queueRef.current.length === 1) {
          processQueue();
        }
      }

      // Detect new badges
      if (newState.earnedBadges.length > prevBadges.length) {
        const newBadgeIds = newState.earnedBadges.filter(
          (id) => !prevBadges.includes(id)
        );
        for (const badgeId of newBadgeIds) {
          queueRef.current.push({ type: 'badge', badgeId });
        }
        prevBadges = [...newState.earnedBadges];
        // Trigger processing if nothing currently showing
        if (!currentCelebration && queueRef.current.length > 0) {
          processQueue();
        }
      }
    });

    return unsub;
  }, [processQueue]);

  // Look up badge object for BadgeUnlockSheet
  const currentBadge =
    currentCelebration?.type === 'badge'
      ? BADGES.find((b) => b.id === currentCelebration.badgeId) ?? null
      : null;

  return (
    <CelebrationContext.Provider value={{ showXPToast }}>
      {children}
      <XPToast
        amount={xpToast.amount}
        visible={xpToast.visible}
        onHide={handleXPToastHide}
      />
      <LevelUpModal
        visible={currentCelebration?.type === 'level-up'}
        level={
          currentCelebration?.type === 'level-up'
            ? currentCelebration.level
            : 1
        }
        onDismiss={handleDismiss}
      />
      <BadgeUnlockSheet
        visible={currentCelebration?.type === 'badge'}
        badge={currentBadge}
        onDismiss={handleDismiss}
      />
    </CelebrationContext.Provider>
  );
};

export function useCelebration(): CelebrationContextType {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebration must be used within a CelebrationProvider');
  }
  return context;
}
