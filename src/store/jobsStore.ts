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
        if (userId) db.insertJob(userId, job).catch((e) => {
          console.warn('Failed to sync job to cloud:', e?.message || e);
        });
      },

      updateJob: (id, updates) => {
        set((state) => ({
          jobs: state.jobs.map((j) => j.id === id ? { ...j, ...updates } : j),
        }));
        db.updateJob(id, updates).catch((e) => {
          console.warn('Failed to update job in cloud:', e?.message || e);
        });
      },

      deleteJob: (id) => {
        set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) }));
        db.deleteJob(id).catch((e) => {
          console.warn('Failed to delete job from cloud:', e?.message || e);
        });
      },

      getJob: (id) => get().jobs.find((j) => j.id === id),

      completeJob: (id) => {
        set((state) => ({
          jobs: state.jobs.map((j) =>
            j.id === id ? { ...j, status: 'completed' as const } : j
          ),
        }));
        db.updateJob(id, { status: 'completed' }).catch((e) => {
          console.warn('Failed to complete job in cloud:', e?.message || e);
        });
      },

      syncFromCloud: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;
        try {
          const jobs = await db.fetchJobs(userId);
          set({ jobs });
        } catch (e) {
          console.warn('Jobs sync failed:', e);
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
