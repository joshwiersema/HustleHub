import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Payment } from '../types';

interface PaymentsState {
  payments: Payment[];

  // Actions
  addPayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  getPaymentsByClient: (clientName: string) => Payment[];
  reset: () => void;
}

const initialState = {
  payments: [] as Payment[],
};

export const usePaymentsStore = create<PaymentsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addPayment: (payment) =>
        set((state) => ({ payments: [...state.payments, payment] })),

      deletePayment: (id) =>
        set((state) => ({
          payments: state.payments.filter((p) => p.id !== id),
        })),

      getPaymentsByClient: (clientName) =>
        get().payments.filter((p) => p.clientName === clientName),

      reset: () => set({ ...initialState }),
    }),
    {
      name: '@hustlehub/payments',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
