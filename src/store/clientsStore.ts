import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client } from '../types';

interface ClientsState {
  clients: Client[];

  // Actions
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;
  reset: () => void;
}

const initialState = {
  clients: [] as Client[],
};

export const useClientsStore = create<ClientsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addClient: (client) =>
        set((state) => ({ clients: [...state.clients, client] })),

      updateClient: (id, updates) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        })),

      getClient: (id) => get().clients.find((c) => c.id === id),

      reset: () => set({ ...initialState }),
    }),
    {
      name: '@hustlehub/clients',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
