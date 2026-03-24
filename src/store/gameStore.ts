import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LEVELS } from '../types';

interface GameState {
  xp: number;
  level: number;
  hustleBucks: number;
  streak: number;
  lastActivityDate: string | null;
  earnedBadges: string[];

  // Actions
  addXP: (amount: number) => void;
  updateStreak: () => void;
  earnBadge: (badgeId: string) => void;
  reset: () => void;
}

const initialState = {
  xp: 0,
  level: 1,
  hustleBucks: 0,
  streak: 0,
  lastActivityDate: null as string | null,
  earnedBadges: [] as string[],
};

/**
 * Calculate level from total XP using the LEVELS table.
 * Returns the highest level whose xpRequired threshold has been met.
 */
function calculateLevel(xp: number): number {
  let level = 1;
  for (const info of LEVELS) {
    if (xp >= info.xpRequired) {
      level = info.level;
    } else {
      break;
    }
  }
  return level;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,

      addXP: (amount) =>
        set((state) => {
          const newXP = state.xp + amount;
          const newLevel = calculateLevel(newXP);
          // Earn HustleBucks at 50% of XP rate (per existing storage.ts pattern)
          const newHustleBucks = state.hustleBucks + Math.floor(amount * 0.5);
          return {
            xp: newXP,
            level: newLevel,
            hustleBucks: newHustleBucks,
          };
        }),

      updateStreak: () =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          if (state.lastActivityDate === today) {
            // Already counted today
            return {};
          }

          const yesterday = new Date(Date.now() - 86400000)
            .toISOString()
            .split('T')[0];

          if (state.lastActivityDate === yesterday) {
            // Consecutive day -- increment streak
            return { streak: state.streak + 1, lastActivityDate: today };
          }

          // Streak broken -- reset to 1
          return { streak: 1, lastActivityDate: today };
        }),

      earnBadge: (badgeId) =>
        set((state) => {
          if (state.earnedBadges.includes(badgeId)) {
            return {}; // Already earned
          }
          return { earnedBadges: [...state.earnedBadges, badgeId] };
        }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: '@hustlehub/game',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
