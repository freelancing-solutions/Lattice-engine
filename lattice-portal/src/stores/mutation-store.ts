import { create } from 'zustand';
import { Mutation, MutationFilters } from '@/types';

interface MutationState {
  mutations: Mutation[];
  selectedMutation: Mutation | null;
  filters: MutationFilters;
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
  
  // Real-time updates
  lastUpdated: Date | null;
  
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
  
  // Pagination actions
  setPagination: (page: number, totalPages: number, totalCount: number, hasMore: boolean) => void;
  nextPage: () => void;
  previousPage: () => void;
  
  // Bulk operations
  bulkUpdateMutations: (updates: Array<{ id: string; updates: Partial<Mutation> }>) => void;
  clearMutations: () => void;
  
  // Filtering and sorting
  getFilteredMutations: () => Mutation[];
  getMutationsByStatus: (status: string) => Mutation[];
  getMutationsByProject: (projectId: string) => Mutation[];
  
  // Statistics
  getStatistics: () => {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    executed: number;
    failed: number;
    byRiskLevel: Record<string, number>;
  };
}

export const useMutationStore = create<MutationState>((set, get) => ({
  mutations: [],
  selectedMutation: null,
  filters: {},
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  hasMore: false,
  lastUpdated: null,

  setMutations: (mutations: Mutation[]) => {
    set({ 
      mutations, 
      lastUpdated: new Date(),
      error: null 
    });
  },

  setSelectedMutation: (mutation: Mutation | null) => {
    set({ selectedMutation: mutation });
  },

  setFilters: (filters: MutationFilters) => {
    set({ filters });
  },

  addMutation: (mutation: Mutation) => {
    set((state) => ({
      mutations: [mutation, ...state.mutations],
      totalCount: state.totalCount + 1,
      lastUpdated: new Date(),
    }));
  },

  updateMutation: (id: string, updates: Partial<Mutation>) => {
    set((state) => {
      const updatedMutations = state.mutations.map((mutation) =>
        mutation.id === id ? { ...mutation, ...updates } : mutation
      );
      
      // Update selected mutation if it's the one being updated
      const updatedSelectedMutation = state.selectedMutation?.id === id
        ? { ...state.selectedMutation, ...updates }
        : state.selectedMutation;

      return {
        mutations: updatedMutations,
        selectedMutation: updatedSelectedMutation,
        lastUpdated: new Date(),
        error: null,
      };
    });
  },

  removeMutation: (id: string) => {
    set((state) => ({
      mutations: state.mutations.filter((mutation) => mutation.id !== id),
      selectedMutation: state.selectedMutation?.id === id ? null : state.selectedMutation,
      totalCount: Math.max(0, state.totalCount - 1),
      lastUpdated: new Date(),
    }));
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error, isLoading: false });
  },

  clearError: () => {
    set({ error: null });
  },

  setPagination: (page: number, totalPages: number, totalCount: number, hasMore: boolean) => {
    set({
      currentPage: page,
      totalPages,
      totalCount,
      hasMore,
    });
  },

  nextPage: () => {
    set((state) => ({
      currentPage: state.hasMore ? state.currentPage + 1 : state.currentPage,
    }));
  },

  previousPage: () => {
    set((state) => ({
      currentPage: state.currentPage > 1 ? state.currentPage - 1 : 1,
    }));
  },

  bulkUpdateMutations: (updates: Array<{ id: string; updates: Partial<Mutation> }>) => {
    set((state) => {
      const updatedMutations = state.mutations.map((mutation) => {
        const update = updates.find((u) => u.id === mutation.id);
        return update ? { ...mutation, ...update.updates } : mutation;
      });

      return {
        mutations: updatedMutations,
        lastUpdated: new Date(),
        error: null,
      };
    });
  },

  clearMutations: () => {
    set({
      mutations: [],
      selectedMutation: null,
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      hasMore: false,
      lastUpdated: null,
    });
  },

  getFilteredMutations: () => {
    const { mutations, filters } = get();
    let filtered = [...mutations];

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((mutation) => filters.status!.includes(mutation.status));
    }

    if (filters.risk_level && filters.risk_level.length > 0) {
      filtered = filtered.filter((mutation) => filters.risk_level!.includes(mutation.risk_level));
    }

    if (filters.project_id) {
      filtered = filtered.filter((mutation) => mutation.project_id === filters.project_id);
    }

    if (filters.date_range) {
      const startDate = new Date(filters.date_range.start);
      const endDate = new Date(filters.date_range.end);
      filtered = filtered.filter((mutation) => {
        const mutationDate = new Date(mutation.created_at);
        return mutationDate >= startDate && mutationDate <= endDate;
      });
    }

    return filtered;
  },

  getMutationsByStatus: (status: string) => {
    const { mutations } = get();
    return mutations.filter((mutation) => mutation.status === status);
  },

  getMutationsByProject: (projectId: string) => {
    const { mutations } = get();
    return mutations.filter((mutation) => mutation.project_id === projectId);
  },

  getStatistics: () => {
    const { mutations } = get();
    
    const stats = {
      total: mutations.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      executed: 0,
      failed: 0,
      byRiskLevel: {
        low: 0,
        medium: 0,
        high: 0,
      } as Record<string, number>,
    };

    mutations.forEach((mutation) => {
      // Count by status
      switch (mutation.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'approved':
          stats.approved++;
          break;
        case 'rejected':
          stats.rejected++;
          break;
        case 'executed':
          stats.executed++;
          break;
        case 'failed':
          stats.failed++;
          break;
      }

      // Count by risk level
      stats.byRiskLevel[mutation.risk_level] = (stats.byRiskLevel[mutation.risk_level] || 0) + 1;
    });

    return stats;
  },
}));