import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client } from '../types';
import * as db from '../services/database';
import { useAuthStore } from './authStore';

interface ClientsState {
  clients: Client[];

  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;
  syncFromCloud: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  clients: [] as Client[],
};

export const useClientsStore = create<ClientsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addClient: (client) => {
        set((state) => ({ clients: [...state.clients, client] }));
        const userId = useAuthStore.getState().user?.id;
        if (userId) db.insertClient(userId, client).catch((e) => {
          console.warn('Failed to sync client to cloud:', e?.message || e);
        });
      },

      updateClient: (id, updates) => {
        set((state) => ({
          clients: state.clients.map((c) => c.id === id ? { ...c, ...updates } : c),
        }));
        db.updateClient(id, updates).catch((e) => {
          console.warn('Failed to update client in cloud:', e?.message || e);
        });
      },

      deleteClient: (id) => {
        set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }));
        db.deleteClient(id).catch((e) => {
          console.warn('Failed to delete client from cloud:', e?.message || e);
        });
      },

      getClient: (id) => get().clients.find((c) => c.id === id),

      syncFromCloud: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;
        try {
          const clients = await db.fetchClients(userId);
          set({ clients });
        } catch (e) {
          console.warn('Clients sync failed:', e);
        }
      },

      reset: () => set({ ...initialState }),
    }),
    {
      name: '@hustlehub/clients',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
