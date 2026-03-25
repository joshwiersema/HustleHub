import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';

interface ProfileState {
  profile: UserProfile | null;
  isOnboarded: boolean;

  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  markOnboarded: () => void;
  reset: () => void;
}

const initialState = {
  profile: null,
  isOnboarded: false,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...initialState,

      setProfile: (profile) => set({ profile }),

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),

      markOnboarded: () => set({ isOnboarded: true }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: '@hustlehub/profile',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
