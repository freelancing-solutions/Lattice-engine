import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SpecSyncStatus, SpecSyncActivityLog } from '@/types';

interface SpecSyncState {
  // Spec sync data
  status: SpecSyncStatus | null;
  activityLogs: SpecSyncActivityLog[];

  // UI state
  isLoading: boolean;
  error: string | null;
  lastChecked: string | null;

  // Actions
  setStatus: (status: SpecSyncStatus) => void;
  addActivityLog: (log: SpecSyncActivityLog) => void;
  clearActivityLogs: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setLastChecked: (timestamp: string) => void;
}

// Helper function to generate unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Helper function to create activity log
const createActivityLog = (
  action: SpecSyncActivityLog['action'],
  success: boolean,
  error: string | null = null
): SpecSyncActivityLog => {
  return {
    id: generateId(),
    action,
    timestamp: new Date().toISOString(),
    success,
    error
  };
};

export const useSpecSyncStore = create<SpecSyncState>()(
  persist(
    (set, get) => ({
      // Initial state
      status: null,
      activityLogs: [],
      isLoading: false,
      error: null,
      lastChecked: null,

      // Actions
      setStatus: (status) => {
        set({ status });

        // Add status check activity log
        const log = createActivityLog('status_check', true);
        get().addActivityLog(log);
      },

      addActivityLog: (log) => set((state) => {
        // Prepend new log to array and limit to last 50 entries
        const newLogs = [log, ...state.activityLogs].slice(0, 50);
        return { activityLogs: newLogs };
      }),

      clearActivityLogs: () => set({ activityLogs: [] }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      setLastChecked: (timestamp) => set({ lastChecked: timestamp })
    }),
    {
      name: 'spec-sync-store',
      // Only persist activity logs, not the current status or UI state
      partialize: (state) => ({
        activityLogs: state.activityLogs
      })
    }
  )
);