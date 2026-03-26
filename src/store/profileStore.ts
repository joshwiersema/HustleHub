import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';
import * as db from '../services/database';
import { useAuthStore } from './authStore';

interface ProfileState {
  profile: UserProfile | null;
  isOnboarded: boolean;

  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  markOnboarded: () => void;
  syncFromCloud: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  profile: null as UserProfile | null,
  isOnboarded: false,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setProfile: (profile) => {
        set({ profile });
        // Push to cloud
        const userId = useAuthStore.getState().user?.id;
        if (userId) {
          db.upsertProfile(userId, {
            name: profile.name,
            business_name: profile.businessName,
            hustle_type: profile.hustleType,
            is_onboarded: false,
          }).catch(console.error);
        }
      },

      updateProfile: (updates) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        }));
        const userId = useAuthStore.getState().user?.id;
        const profile = get().profile;
        if (userId && profile) {
          db.upsertProfile(userId, {
            name: updates.name ?? profile.name,
            business_name: updates.businessName ?? profile.businessName,
            hustle_type: updates.hustleType ?? profile.hustleType,
            is_onboarded: get().isOnboarded,
          }).catch(console.error);
        }
      },

      markOnboarded: () => {
        set({ isOnboarded: true });
        const userId = useAuthStore.getState().user?.id;
        const profile = get().profile;
        if (userId && profile) {
          db.upsertProfile(userId, {
            name: profile.name,
            business_name: profile.businessName,
            hustle_type: profile.hustleType,
            is_onboarded: true,
          }).catch(console.error);
        }
      },

      syncFromCloud: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;
        try {
          const data = await db.fetchProfile(userId);
          if (data) {
            set({
              profile: {
                id: data.id,
                name: data.name,
                businessName: data.business_name,
                hustleType: data.hustle_type,
                level: 1,
                xp: 0,
                hustleBucks: 50,
                totalEarnings: 0,
                streak: 0,
                joinedDate: data.created_at,
                badges: [],
                onboardingComplete: data.is_onboarded,
              },
              isOnboarded: data.is_onboarded,
            });
          }
        } catch (e) {
          console.error('Profile sync failed:', e);
        }
      },

      reset: () => set({ ...initialState }),
    }),
    {
      name: '@hustlehub/profile',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
