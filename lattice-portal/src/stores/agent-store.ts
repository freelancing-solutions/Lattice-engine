/**
 * Zustand store for agent state management
 */

import { create } from 'zustand';
import { Agent, AgentPerformance, AgentPerformanceMetric, AgentFilters } from '@/types';

interface AgentState {
  // State
  agents: Agent[];
  selectedAgent: Agent | null;
  agentMetrics: Record<string, AgentPerformanceMetric[]>;
  filters: AgentFilters;
  isLoading: boolean;
  error: string | null;

  // Computed values
  activeCount: number;
  totalRequests: number;
}

interface AgentActions {
  // Basic state actions
  setAgents: (agents: Agent[]) => void;
  setSelectedAgent: (agent: Agent | null) => void;
  setFilters: (filters: AgentFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Agent CRUD actions
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;

  // Performance actions
  setAgentMetrics: (agentId: string, metrics: AgentPerformanceMetric[]) => void;
  addMetric: (agentId: string, metric: AgentPerformanceMetric) => void;

  // Computed actions
  setActiveCount: (count: number) => void;
  setTotalRequests: (count: number) => void;

  // Helper methods
  getAgentSuccessRate: (agentId: string) => number;
  getAgentAverageResponseTime: (agentId: string) => number;
  getAgentById: (id: string) => Agent | null;
  getFilteredAgents: () => Agent[];
  clearAgentMetrics: (agentId: string) => void;
}

type AgentStore = AgentState & AgentActions;

export const useAgentStore = create<AgentStore>((set, get) => ({
  // Initial state
  agents: [],
  selectedAgent: null,
  agentMetrics: {},
  filters: {},
  isLoading: false,
  error: null,
  activeCount: 0,
  totalRequests: 0,

  // Basic state actions
  setAgents: (agents) => {
    // Calculate computed values
    const activeCount = agents.filter(agent => agent.status === 'active').length;
    const totalRequests = agents.reduce((sum, agent) =>
      sum + (agent.performance?.totalRequests || 0), 0
    );

    set({
      agents,
      activeCount,
      totalRequests,
      error: null
    });
  },

  setSelectedAgent: (agent) => set({ selectedAgent: agent }),

  setFilters: (filters) => set({ filters }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  // Agent CRUD actions
  addAgent: (agent) => {
    const { agents } = get();
    const newAgents = [agent, ...agents];

    // Recalculate computed values
    const activeCount = newAgents.filter(a => a.status === 'active').length;
    const totalRequests = newAgents.reduce((sum, a) =>
      sum + (a.performance?.totalRequests || 0), 0
    );

    set({
      agents: newAgents,
      activeCount,
      totalRequests
    });
  },

  updateAgent: (id, updates) => {
    const { agents, selectedAgent } = get();
    const updatedAgents = agents.map(agent =>
      agent.id === id ? { ...agent, ...updates } : agent
    );

    // Update selected agent if it matches
    const updatedSelectedAgent = selectedAgent?.id === id
      ? { ...selectedAgent, ...updates }
      : selectedAgent;

    // Recalculate computed values
    const activeCount = updatedAgents.filter(agent => agent.status === 'active').length;
    const totalRequests = updatedAgents.reduce((sum, agent) =>
      sum + (agent.performance?.totalRequests || 0), 0
    );

    set({
      agents: updatedAgents,
      selectedAgent: updatedSelectedAgent,
      activeCount,
      totalRequests
    });
  },

  removeAgent: (id) => {
    const { agents, selectedAgent, agentMetrics } = get();
    const filteredAgents = agents.filter(agent => agent.id !== id);

    // Clear selected agent if it was the removed one
    const newSelectedAgent = selectedAgent?.id === id ? null : selectedAgent;

    // Clear metrics for removed agent
    const newAgentMetrics = { ...agentMetrics };
    delete newAgentMetrics[id];

    // Recalculate computed values
    const activeCount = filteredAgents.filter(agent => agent.status === 'active').length;
    const totalRequests = filteredAgents.reduce((sum, agent) =>
      sum + (agent.performance?.totalRequests || 0), 0
    );

    set({
      agents: filteredAgents,
      selectedAgent: newSelectedAgent,
      agentMetrics: newAgentMetrics,
      activeCount,
      totalRequests
    });
  },

  // Performance actions
  setAgentMetrics: (agentId, metrics) => {
    const { agentMetrics } = get();
    set({
      agentMetrics: {
        ...agentMetrics,
        [agentId]: metrics
      }
    });
  },

  addMetric: (agentId, metric) => {
    const { agentMetrics } = get();
    const currentMetrics = agentMetrics[agentId] || [];
    set({
      agentMetrics: {
        ...agentMetrics,
        [agentId]: [metric, ...currentMetrics]
      }
    });
  },

  // Computed actions
  setActiveCount: (count) => set({ activeCount: count }),

  setTotalRequests: (count) => set({ totalRequests: count }),

  // Helper methods
  getAgentSuccessRate: (agentId) => {
    const { agents } = get();
    const agent = agents.find(a => a.id === agentId);
    return agent?.performance?.successRate || 0;
  },

  getAgentAverageResponseTime: (agentId) => {
    const { agents } = get();
    const agent = agents.find(a => a.id === agentId);
    return agent?.performance?.averageResponseTime || 0;
  },

  getAgentById: (id) => {
    const { agents } = get();
    return agents.find(agent => agent.id === id) || null;
  },

  getFilteredAgents: () => {
    const { agents, filters } = get();

    return agents.filter(agent => {
      // Type filter
      if (filters.type && agent.type !== filters.type) {
        return false;
      }

      // Status filter
      if (filters.status && agent.status !== filters.status) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          agent.name.toLowerCase().includes(searchLower) ||
          (agent.description && agent.description.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  },

  clearAgentMetrics: (agentId) => {
    const { agentMetrics } = get();
    const newAgentMetrics = { ...agentMetrics };
    delete newAgentMetrics[agentId];
    set({ agentMetrics: newAgentMetrics });
  }
}));