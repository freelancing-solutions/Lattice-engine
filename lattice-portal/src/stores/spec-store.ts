import { create } from 'zustand';
import { Spec, SpecFilters } from '@/types';

interface SpecState {
  specs: Spec[];
  selectedSpec: Spec | null;
  filters: SpecFilters;
  isLoading: boolean;
  error: string | null;
  currentProjectId: string | null;

  // Actions
  setSpecs: (specs: Spec[]) => void;
  setSelectedSpec: (spec: Spec | null) => void;
  setFilters: (filters: SpecFilters) => void;
  setCurrentProjectId: (projectId: string | null) => void;
  addSpec: (spec: Spec) => void;
  updateSpec: (id: string, updates: Partial<Spec>) => void;
  removeSpec: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useSpecStore = create<SpecState>((set, get) => ({
  specs: [],
  selectedSpec: null,
  filters: {},
  isLoading: false,
  error: null,
  currentProjectId: null,

  setSpecs: (specs) => {
    set({ specs });
  },

  setSelectedSpec: (spec) => {
    set({ selectedSpec: spec });
  },

  setFilters: (filters) => {
    set({ filters });
  },

  setCurrentProjectId: (projectId) => {
    set({ currentProjectId: projectId });
  },

  addSpec: (spec) => {
    set((state) => ({
      specs: [spec, ...state.specs],
    }));
  },

  updateSpec: (id, updates) => {
    set((state) => ({
      specs: state.specs.map((spec) =>
        spec.id === id ? { ...spec, ...updates } : spec
      ),
      selectedSpec:
        state.selectedSpec?.id === id
          ? { ...state.selectedSpec, ...updates }
          : state.selectedSpec,
    }));
  },

  removeSpec: (id) => {
    set((state) => ({
      specs: state.specs.filter((spec) => spec.id !== id),
      selectedSpec:
        state.selectedSpec?.id === id ? null : state.selectedSpec,
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