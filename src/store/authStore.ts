import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;

  initialize: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearAllLocalData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  session: null,
  user: null,
  isLoggedIn: false,
  isLoading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Verify the session is still valid by calling getUser
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          // Session is stale — clear everything and force re-login
          await get().clearAllLocalData();
          await supabase.auth.signOut().catch(() => {});
          set({ session: null, user: null, isLoggedIn: false, isLoading: false });
          return;
        }
        set({ session, user, isLoggedIn: true, isLoading: false });
      } else {
        set({ session: null, user: null, isLoggedIn: false, isLoading: false });
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
          isLoggedIn: !!session,
        });
      });
    } catch {
      await get().clearAllLocalData();
      set({ session: null, user: null, isLoggedIn: false, isLoading: false });
    }
  },

  validateSession: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      await get().clearAllLocalData();
      await supabase.auth.signOut().catch(() => {});
      set({ session: null, user: null, isLoggedIn: false });
      return false;
    }
    return true;
  },

  signup: async (name, email, password) => {
    if (!name.trim() || name.trim().length < 2) {
      return { success: false, error: 'Name must be at least 2 characters.' };
    }
    if (!email.trim() || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // Clear any stale local data from previous accounts
    await get().clearAllLocalData();

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: { name: name.trim() },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.session) {
      set({
        session: data.session,
        user: data.user,
        isLoggedIn: true,
      });
    }

    return { success: true };
  },

  login: async (email, password) => {
    // Clear stale local data before login
    await get().clearAllLocalData();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    set({
      session: data.session,
      user: data.user,
      isLoggedIn: true,
    });

    return { success: true };
  },

  logout: async () => {
    await supabase.auth.signOut();
    // Clear ALL local Zustand/AsyncStorage data
    await get().clearAllLocalData();
    set({ session: null, user: null, isLoggedIn: false });
  },

  clearAllLocalData: async () => {
    // Remove all HustleHub Zustand persisted stores from AsyncStorage
    const keys = [
      '@hustlehub/profile',
      '@hustlehub/clients',
      '@hustlehub/jobs',
      '@hustlehub/payments',
      '@hustlehub/game',
      '@hustlehub/auth',
    ];
    await AsyncStorage.multiRemove(keys).catch(() => {});
  },
}));
