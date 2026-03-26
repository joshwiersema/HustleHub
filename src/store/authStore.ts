import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;

  initialize: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  session: null,
  user: null,
  isLoggedIn: false,
  isLoading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({
        session,
        user: session?.user ?? null,
        isLoggedIn: !!session,
        isLoading: false,
      });

      // Listen for auth state changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
          isLoggedIn: !!session,
        });
      });
    } catch {
      set({ isLoading: false });
    }
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
    set({ session: null, user: null, isLoggedIn: false });
  },
}));
