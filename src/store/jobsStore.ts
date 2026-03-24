import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Job } from '../types';

interface JobsState {
  jobs: Job[];

  // Actions
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  getJob: (id: string) => Job | undefined;
  completeJob: (id: string) => void;
  reset: () => void;
}

const initialState = {
  jobs: [] as Job[],
};

export const useJobsStore = create<JobsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addJob: (job) =>
        set((state) => ({ jobs: [...state.jobs, job] })),

      updateJob: (id, updates) =>
        set((state) => ({
          jobs: state.jobs.map((j) =>
            j.id === id ? { ...j, ...updates } : j
          ),
        })),

      deleteJob: (id) =>
        set((state) => ({
          jobs: state.jobs.filter((j) => j.id !== id),
        })),

      getJob: (id) => get().jobs.find((j) => j.id === id),

      completeJob: (id) =>
        set((state) => ({
          jobs: state.jobs.map((j) =>
            j.id === id ? { ...j, status: 'completed' as const } : j
          ),
        })),

      reset: () => set({ ...initialState }),
    }),
    {
      name: '@hustlehub/jobs',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
