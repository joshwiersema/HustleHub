import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LEVELS } from '../types';
import * as db from '../services/database';
import { useAuthStore } from './authStore';

interface GameState {
  xp: number;
  level: number;
  hustleBucks: number;
  streak: number;
  lastActivityDate: string | null;
  earnedBadges: string[];

  addXP: (amount: number) => void;
  updateStreak: () => void;
  earnBadge: (badgeId: string) => void;
  syncToCloud: () => void;
  syncFromCloud: () => Promise<void>;
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
    (set, get) => ({
      ...initialState,

      addXP: (amount) => {
        set((state) => {
          const newXP = state.xp + amount;
          const newLevel = calculateLevel(newXP);
          const newHustleBucks = state.hustleBucks + Math.floor(amount * 0.5);
          return { xp: newXP, level: newLevel, hustleBucks: newHustleBucks };
        });
        // Debounced cloud push
        get().syncToCloud();
      },

      updateStreak: () => {
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          if (state.lastActivityDate === today) return {};
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          if (state.lastActivityDate === yesterday) {
            return { streak: state.streak + 1, lastActivityDate: today };
          }
          return { streak: 1, lastActivityDate: today };
        });
        get().syncToCloud();
      },

      earnBadge: (badgeId) => {
        set((state) => {
          if (state.earnedBadges.includes(badgeId)) return {};
          return { earnedBadges: [...state.earnedBadges, badgeId] };
        });
        get().syncToCloud();
      },

      syncToCloud: () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;
        const s = get();
        db.upsertGameState(userId, {
          xp: s.xp,
          level: s.level,
          hustle_bucks: s.hustleBucks,
          streak: s.streak,
          last_activity_date: s.lastActivityDate,
          earned_badges: s.earnedBadges,
        }).catch(console.error);
      },

      syncFromCloud: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;
        try {
          const data = await db.fetchGameState(userId);
          if (data) {
            set({
              xp: data.xp,
              level: data.level,
              hustleBucks: data.hustle_bucks,
              streak: data.streak,
              lastActivityDate: data.last_activity_date,
              earnedBadges: data.earned_badges || [],
            });
          }
        } catch (e) {
          console.error('Game sync failed:', e);
        }
      },

      reset: () => set({ ...initialState }),
    }),
    {
      name: '@hustlehub/game',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
