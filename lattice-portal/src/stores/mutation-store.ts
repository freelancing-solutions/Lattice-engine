import { create } from 'zustand';
import { Mutation, MutationFilters } from '@/types';

interface MutationState {
  mutations: Mutation[];
  selectedMutation: Mutation | null;
  filters: MutationFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setMutations: (mutations: Mutation[]) => void;
  setSelectedMutation: (mutation: Mutation | null) => void;
  setFilters: (filters: MutationFilters) => void;
  addMutation: (mutation: Mutation) => void;
  updateMutation: (id: string, updates: Partial<Mutation>) => void;
  removeMutation: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useMutationStore = create<MutationState>((set, get) => ({
  mutations: [],
  selectedMutation: null,
  filters: {},
  isLoading: false,
  error: null,

  setMutations: (mutations) => {
    set({ mutations });
  },

  setSelectedMutation: (mutation) => {
    set({ selectedMutation: mutation });
  },

  setFilters: (filters) => {
    set({ filters });
  },

  addMutation: (mutation) => {
    set((state) => ({
      mutations: [mutation, ...state.mutations],
    }));
  },

  updateMutation: (id, updates) => {
    set((state) => ({
      mutations: state.mutations.map((mutation) =>
        mutation.id === id ? { ...mutation, ...updates } : mutation
      ),
      selectedMutation:
        state.selectedMutation?.id === id
          ? { ...state.selectedMutation, ...updates }
          : state.selectedMutation,
    }));
  },

  removeMutation: (id) => {
    set((state) => ({
      mutations: state.mutations.filter((mutation) => mutation.id !== id),
      selectedMutation:
        state.selectedMutation?.id === id ? null : state.selectedMutation,
    }));
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));