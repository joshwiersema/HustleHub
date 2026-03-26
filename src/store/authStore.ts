import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple hash for local password storage (not cryptographic — local-only app)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  // Add salt-like suffix for basic obfuscation
  return `hh_${Math.abs(hash).toString(36)}_${str.length}`;
}

interface AuthUser {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
  hasAccount: boolean;

  signup: (name: string, email: string, password: string) => { success: boolean; error?: string };
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  resetAccount: () => void;
}

const initialState = {
  user: null as AuthUser | null,
  isLoggedIn: false,
  hasAccount: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      signup: (name, email, password) => {
        const existing = get().user;
        if (existing && existing.email === email.toLowerCase().trim()) {
          return { success: false, error: 'An account with this email already exists. Try logging in.' };
        }

        if (!name.trim() || name.trim().length < 2) {
          return { success: false, error: 'Name must be at least 2 characters.' };
        }
        if (!email.trim() || !email.includes('@')) {
          return { success: false, error: 'Please enter a valid email address.' };
        }
        if (password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters.' };
        }

        const user: AuthUser = {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          passwordHash: simpleHash(password),
          createdAt: new Date().toISOString(),
        };

        set({ user, isLoggedIn: true, hasAccount: true });
        return { success: true };
      },

      login: (email, password) => {
        const user = get().user;
        if (!user) {
          return { success: false, error: 'No account found. Please sign up first.' };
        }

        if (user.email !== email.toLowerCase().trim()) {
          return { success: false, error: 'Invalid email or password.' };
        }

        if (user.passwordHash !== simpleHash(password)) {
          return { success: false, error: 'Invalid email or password.' };
        }

        set({ isLoggedIn: true });
        return { success: true };
      },

      logout: () => set({ isLoggedIn: false }),

      resetAccount: () => set({ ...initialState }),
    }),
    {
      name: '@hustlehub/auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
