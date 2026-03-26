import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Payment } from '../types';
import * as db from '../services/database';
import { useAuthStore } from './authStore';

interface PaymentsState {
  payments: Payment[];

  addPayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  getPaymentsByClient: (clientName: string) => Payment[];
  syncFromCloud: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  payments: [] as Payment[],
};

export const usePaymentsStore = create<PaymentsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addPayment: (payment) => {
        set((state) => ({ payments: [...state.payments, payment] }));
        const userId = useAuthStore.getState().user?.id;
        if (userId) db.insertPayment(userId, payment).catch((e) => {
          console.warn('Failed to sync payment to cloud:', e?.message || e);
        });
      },

      deletePayment: (id) => {
        set((state) => ({ payments: state.payments.filter((p) => p.id !== id) }));
        db.deletePayment(id).catch((e) => {
          console.warn('Failed to delete payment from cloud:', e?.message || e);
        });
      },

      getPaymentsByClient: (clientName) =>
        get().payments.filter((p) => p.clientName === clientName),

      syncFromCloud: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;
        try {
          const payments = await db.fetchPayments(userId);
          set({ payments });
        } catch (e) {
          console.warn('Payments sync failed:', e);
        }
      },

      reset: () => set({ ...initialState }),
    }),
    {
      name: '@hustlehub/payments',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
