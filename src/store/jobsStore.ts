import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Job } from '../types';
import * as db from '../services/database';
import { useAuthStore } from './authStore';

interface JobsState {
  jobs: Job[];

  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  getJob: (id: string) => Job | undefined;
  completeJob: (id: string) => void;
  syncFromCloud: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  jobs: [] as Job[],
};

export const useJobsStore = create<JobsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addJob: (job) => {
        set((state) => ({ jobs: [...state.jobs, job] }));
        const userId = useAuthStore.getState().user?.id;
        if (userId) db.insertJob(userId, job).catch(console.error);
      },

      updateJob: (id, updates) => {
        set((state) => ({
          jobs: state.jobs.map((j) => j.id === id ? { ...j, ...updates } : j),
        }));
        db.updateJob(id, updates).catch(console.error);
      },

      deleteJob: (id) => {
        set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) }));
        db.deleteJob(id).catch(console.error);
      },

      getJob: (id) => get().jobs.find((j) => j.id === id),

      completeJob: (id) => {
        set((state) => ({
          jobs: state.jobs.map((j) =>
            j.id === id ? { ...j, status: 'completed' as const } : j
          ),
        }));
        db.updateJob(id, { status: 'completed' }).catch(console.error);
      },

      syncFromCloud: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;
        try {
          const jobs = await db.fetchJobs(userId);
          set({ jobs });
        } catch (e) {
          console.error('Jobs sync failed:', e);
        }
      },

      reset: () => set({ ...initialState }),
    }),
    {
      name: '@hustlehub/jobs',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
