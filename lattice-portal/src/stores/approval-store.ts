import { create } from 'zustand';
import { ApprovalRequest, ApprovalFilters, ApprovalStatus } from '@/types';

interface ApprovalState {
  approvals: ApprovalRequest[];
  selectedApproval: ApprovalRequest | null;
  filters: ApprovalFilters;
  isLoading: boolean;
  error: string | null;
  pendingCount: number;

  // Actions
  setApprovals: (approvals: ApprovalRequest[]) => void;
  setSelectedApproval: (approval: ApprovalRequest | null) => void;
  setFilters: (filters: ApprovalFilters) => void;
  addApproval: (approval: ApprovalRequest) => void;
  updateApproval: (id: string, updates: Partial<ApprovalRequest>) => void;
  removeApproval: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setPendingCount: (count: number) => void;
}

export const useApprovalStore = create<ApprovalState>((set, get) => ({
  approvals: [],
  selectedApproval: null,
  filters: {},
  isLoading: false,
  error: null,
  pendingCount: 0,

  setApprovals: (approvals) => {
    const pendingCount = approvals.filter(approval => approval.status === ApprovalStatus.PENDING).length;
    set({ approvals, pendingCount });
  },

  setSelectedApproval: (approval) => {
    set({ selectedApproval: approval });
  },

  setFilters: (filters) => {
    set({ filters });
  },

  addApproval: (approval) => {
    set((state) => {
      const existingIndex = state.approvals.findIndex(a => a.id === approval.id);
      let newApprovals;

      if (existingIndex >= 0) {
        // Update existing approval
        newApprovals = [...state.approvals];
        newApprovals[existingIndex] = approval;
      } else {
        // Add new approval to the beginning
        newApprovals = [approval, ...state.approvals];
      }

      const pendingCount = newApprovals.filter(a => a.status === ApprovalStatus.PENDING).length;
      return { approvals: newApprovals, pendingCount };
    });
  },

  updateApproval: (id, updates) => {
    set((state) => {
      const newApprovals = state.approvals.map((approval) =>
        approval.id === id ? { ...approval, ...updates } : approval
      );

      const pendingCount = newApprovals.filter(a => a.status === ApprovalStatus.PENDING).length;
      const updatedSelectedApproval = state.selectedApproval?.id === id
        ? { ...state.selectedApproval, ...updates }
        : state.selectedApproval;

      return {
        approvals: newApprovals,
        selectedApproval: updatedSelectedApproval,
        pendingCount
      };
    });
  },

  removeApproval: (id) => {
    set((state) => {
      const newApprovals = state.approvals.filter((approval) => approval.id !== id);
      const pendingCount = newApprovals.filter(a => a.status === ApprovalStatus.PENDING).length;
      const updatedSelectedApproval = state.selectedApproval?.id === id ? null : state.selectedApproval;

      return {
        approvals: newApprovals,
        selectedApproval: updatedSelectedApproval,
        pendingCount
      };
    });
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

  setPendingCount: (count) => {
    set({ pendingCount: count });
  },
}));