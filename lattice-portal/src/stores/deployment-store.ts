import { create } from 'zustand';
import { Deployment, DeploymentFilters, DeploymentStatus } from '@/types';

interface DeploymentState {
  // Deployment data
  deployments: Deployment[];
  selectedDeployment: Deployment | null;

  // Filters and counts
  filters: DeploymentFilters;
  pendingCount: number;
  runningCount: number;

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Actions
  setDeployments: (deployments: Deployment[]) => void;
  setSelectedDeployment: (deployment: Deployment | null) => void;
  setFilters: (filters: DeploymentFilters) => void;
  addDeployment: (deployment: Deployment) => void;
  updateDeployment: (deploymentId: string, updates: Partial<Deployment>) => void;
  removeDeployment: (deploymentId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setPendingCount: (count: number) => void;
  setRunningCount: (count: number) => void;
}

export const useDeploymentStore = create<DeploymentState>((set, get) => ({
  // Initial state
  deployments: [],
  selectedDeployment: null,
  filters: {},
  pendingCount: 0,
  runningCount: 0,
  isLoading: false,
  error: null,

  // Deployment data actions
  setDeployments: (deployments) => {
    const pendingCount = deployments.filter(d => d.status === DeploymentStatus.PENDING).length;
    const runningCount = deployments.filter(d => d.status === DeploymentStatus.RUNNING).length;

    set({
      deployments,
      pendingCount,
      runningCount
    });
  },

  setSelectedDeployment: (deployment) => set({ selectedDeployment: deployment }),

  setFilters: (filters) => set({ filters }),

  // Deployment actions
  addDeployment: (deployment) => set((state) => {
    // Check if deployment already exists
    const existingIndex = state.deployments.findIndex(d => d.deploymentId === deployment.deploymentId);
    let newDeployments;

    if (existingIndex !== -1) {
      // Update existing deployment
      newDeployments = [...state.deployments];
      newDeployments[existingIndex] = deployment;
    } else {
      // Add new deployment to the beginning
      newDeployments = [deployment, ...state.deployments];
    }

    // Recalculate counts
    const pendingCount = newDeployments.filter(d => d.status === DeploymentStatus.PENDING).length;
    const runningCount = newDeployments.filter(d => d.status === DeploymentStatus.RUNNING).length;

    return {
      ...state,
      deployments: newDeployments,
      pendingCount,
      runningCount
    };
  }),

  updateDeployment: (deploymentId, updates) => set((state) => {
    const newDeployments = state.deployments.map((deployment) =>
      deployment.deploymentId === deploymentId
        ? { ...deployment, ...updates }
        : deployment
    );

    // Recalculate counts
    const pendingCount = newDeployments.filter(d => d.status === DeploymentStatus.PENDING).length;
    const runningCount = newDeployments.filter(d => d.status === DeploymentStatus.RUNNING).length;

    return {
      ...state,
      deployments: newDeployments,
      selectedDeployment:
        state.selectedDeployment?.deploymentId === deploymentId
          ? { ...state.selectedDeployment, ...updates }
          : state.selectedDeployment,
      pendingCount,
      runningCount
    };
  }),

  removeDeployment: (deploymentId) => set((state) => {
    const newDeployments = state.deployments.filter(
      (deployment) => deployment.deploymentId !== deploymentId
    );

    // Recalculate counts
    const pendingCount = newDeployments.filter(d => d.status === DeploymentStatus.PENDING).length;
    const runningCount = newDeployments.filter(d => d.status === DeploymentStatus.RUNNING).length;

    return {
      ...state,
      deployments: newDeployments,
      selectedDeployment:
        state.selectedDeployment?.deploymentId === deploymentId
          ? null
          : state.selectedDeployment,
      pendingCount,
      runningCount
    };
  }),

  // Loading and error actions
  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  // Count actions
  setPendingCount: (count) => set({ pendingCount: count }),

  setRunningCount: (count) => set({ runningCount: count })
}));