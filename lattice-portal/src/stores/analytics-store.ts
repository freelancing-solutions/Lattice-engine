import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface AnalyticsMetrics {
  // Mutation metrics
  totalMutations: number;
  successRate: number;
  averageApprovalTime: number;
  pendingMutations: number;
  
  // Performance metrics
  averageProcessingTime: number;
  systemLoad: number;
  errorRate: number;
  throughput: number;
  
  // Agent metrics
  activeAgents: number;
  agentUtilization: number;
  averageAgentResponseTime: number;
  
  // Project metrics
  activeProjects: number;
  projectsWithIssues: number;
  
  // Real-time data
  lastUpdated: Date;
  isConnected: boolean;
}

export interface AnalyticsTrend {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface AnalyticsData {
  // Current metrics
  metrics: AnalyticsMetrics;
  
  // Historical trends
  mutationTrends: AnalyticsTrend[];
  performanceTrends: AnalyticsTrend[];
  agentTrends: AnalyticsTrend[];
  
  // Risk distribution
  riskDistribution: Array<{
    level: 'low' | 'medium' | 'high' | 'critical';
    count: number;
    percentage: number;
  }>;
  
  // Project breakdown
  projectMetrics: Array<{
    projectId: string;
    projectName: string;
    mutationCount: number;
    successRate: number;
    averageTime: number;
    riskLevel: string;
  }>;
}

interface AnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isRealTimeEnabled: boolean;
  updateInterval: number; // in seconds
  connectionStatus: 'connected' | 'disconnected' | 'error';
  cache: Map<string, { data: AnalyticsData; timestamp: number }>;
  cacheTimeout: number; // Cache timeout in milliseconds
  
  // WebSocket connection status
  
  // Actions
  setData: (data: AnalyticsData) => void;
  updateMetrics: (metrics: Partial<AnalyticsMetrics>) => void;
  addTrendData: (type: 'mutation' | 'performance' | 'agent', data: AnalyticsTrend) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRealTimeEnabled: (enabled: boolean) => void;
  setUpdateInterval: (interval: number) => void;
  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  
  // Real-time data handlers
  handleRealTimeUpdate: (update: any) => void;
  handleMutationUpdate: (mutation: any) => void;
  handleAgentUpdate: (agent: any) => void;
  handleSystemUpdate: (system: any) => void;
  
  // Data fetching
  fetchAnalyticsData: () => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Utility functions
  getMetricTrend: (metric: keyof AnalyticsMetrics, timeRange: number) => AnalyticsTrend[];
  calculateGrowthRate: (metric: keyof AnalyticsMetrics, timeRange: number) => number;
  getTopProjects: (limit: number) => Array<{
    projectId: string;
    projectName: string;
    score: number;
  }>;
}

// Mock data generator for development
const generateMockAnalyticsData = (): AnalyticsData => {
  const now = new Date();
  const generateTrends = (count: number, baseValue: number, variance: number): AnalyticsTrend[] => {
    return Array.from({ length: count }, (_, i) => ({
      timestamp: new Date(now.getTime() - (count - i) * 60000), // 1 minute intervals
      value: baseValue + (Math.random() - 0.5) * variance,
    }));
  };

  return {
    metrics: {
      totalMutations: 1247,
      successRate: 94.2,
      averageApprovalTime: 12.5,
      pendingMutations: 23,
      averageProcessingTime: 8.3,
      systemLoad: 67.8,
      errorRate: 2.1,
      throughput: 45.6,
      activeAgents: 12,
      agentUtilization: 78.4,
      averageAgentResponseTime: 1.2,
      activeProjects: 34,
      projectsWithIssues: 3,
      lastUpdated: now,
      isConnected: true,
    },
    mutationTrends: generateTrends(30, 50, 20),
    performanceTrends: generateTrends(30, 8.5, 3),
    agentTrends: generateTrends(30, 75, 15),
    riskDistribution: [
      { level: 'low', count: 856, percentage: 68.7 },
      { level: 'medium', count: 298, percentage: 23.9 },
      { level: 'high', count: 78, percentage: 6.3 },
      { level: 'critical', count: 15, percentage: 1.2 },
    ],
    projectMetrics: [
      {
        projectId: '1',
        projectName: 'Frontend Dashboard',
        mutationCount: 156,
        successRate: 96.8,
        averageTime: 10.2,
        riskLevel: 'low',
      },
      {
        projectId: '2',
        projectName: 'API Gateway',
        mutationCount: 234,
        successRate: 92.1,
        averageTime: 15.7,
        riskLevel: 'medium',
      },
      {
        projectId: '3',
        projectName: 'Database Layer',
        mutationCount: 89,
        successRate: 98.9,
        averageTime: 8.1,
        riskLevel: 'low',
      },
    ],
  };
};

export const useAnalyticsStore = create<AnalyticsState>()(
  subscribeWithSelector((set, get) => ({
    data: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
    isRealTimeEnabled: true,
    updateInterval: 30, // 30 seconds
    connectionStatus: 'disconnected',
    cache: new Map(),
    cacheTimeout: 5 * 60 * 1000, // 5 minutes

    setData: (data: AnalyticsData) => {
      set({ data, error: null, lastUpdated: new Date() });
    },

    clearCache: () => {
      const { cache } = get();
      cache.clear();
    },

    updateMetrics: (metrics: Partial<AnalyticsMetrics>) => {
      set((state) => ({
        data: state.data ? {
          ...state.data,
          metrics: {
            ...state.data.metrics,
            ...metrics,
            lastUpdated: new Date(),
          },
        } : null,
      }));
    },

    addTrendData: (type: 'mutation' | 'performance' | 'agent', trendData: AnalyticsTrend) => {
      set((state) => {
        if (!state.data) return state;

        const trendKey = `${type}Trends` as keyof Pick<AnalyticsData, 'mutationTrends' | 'performanceTrends' | 'agentTrends'>;
        const currentTrends = state.data[trendKey] as AnalyticsTrend[];
        
        // Keep only last 50 data points
        const updatedTrends = [...currentTrends, trendData].slice(-50);

        return {
          data: {
            ...state.data,
            [trendKey]: updatedTrends,
          },
        };
      });
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    setRealTimeEnabled: (enabled: boolean) => {
      set({ isRealTimeEnabled: enabled });
    },

    setUpdateInterval: (interval: number) => {
      set({ updateInterval: interval });
    },

    setConnectionStatus: (status) => {
      set({ connectionStatus: status });
    },

    handleRealTimeUpdate: (update: any) => {
      const { type, data } = update;
      
      switch (type) {
        case 'metrics_update':
          get().updateMetrics(data);
          break;
        case 'mutation_update':
          get().handleMutationUpdate(data);
          break;
        case 'agent_update':
          get().handleAgentUpdate(data);
          break;
        case 'system_update':
          get().handleSystemUpdate(data);
          break;
        default:
          console.warn('Unknown real-time update type:', type);
      }
    },

    handleMutationUpdate: (mutation: any) => {
      // Update mutation-related metrics
      const currentData = get().data;
      if (!currentData) return;

      // Add to mutation trends
      get().addTrendData('mutation', {
        timestamp: new Date(),
        value: mutation.processingTime || 0,
      });

      // Update metrics based on mutation status
      if (mutation.status === 'approved') {
        get().updateMetrics({
          totalMutations: currentData.metrics.totalMutations + 1,
          pendingMutations: Math.max(0, currentData.metrics.pendingMutations - 1),
        });
      }
    },

    handleAgentUpdate: (agent: any) => {
      // Update agent-related metrics
      get().addTrendData('agent', {
        timestamp: new Date(),
        value: agent.utilization || 0,
      });

      get().updateMetrics({
        agentUtilization: agent.utilization || 0,
        averageAgentResponseTime: agent.responseTime || 0,
      });
    },

    handleSystemUpdate: (system: any) => {
      // Update system-related metrics
      get().addTrendData('performance', {
        timestamp: new Date(),
        value: system.load || 0,
      });

      get().updateMetrics({
        systemLoad: system.load || 0,
        errorRate: system.errorRate || 0,
        throughput: system.throughput || 0,
      });
    },

    fetchAnalyticsData: async (timeRange?: string) => {
    const { setLoading, setError, setData, cache, cacheTimeout } = get();
    
    // Create cache key
    const cacheKey = `analytics-${timeRange || 'default'}`;
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < cacheTimeout) {
      setData(cachedData.data);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/analytics?timeRange=${timeRange}`);
      // const data = response.data;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data for now
      const mockData = generateMockAnalyticsData();
      
      // Cache the data
      cache.set(cacheKey, { data: mockData, timestamp: Date.now() });
      
      setData(mockData);
      
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  },

    refreshData: async () => {
      await get().fetchAnalyticsData();
    },

    getMetricTrend: (metric: keyof AnalyticsMetrics, timeRange: number) => {
      const data = get().data;
      if (!data) return [];

      const now = new Date();
      const cutoff = new Date(now.getTime() - timeRange * 60000); // timeRange in minutes

      // This is a simplified implementation
      // In a real app, you'd have historical data for each metric
      return data.performanceTrends.filter(trend => trend.timestamp >= cutoff);
    },

    calculateGrowthRate: (metric: keyof AnalyticsMetrics, timeRange: number) => {
      const trends = get().getMetricTrend(metric, timeRange);
      if (trends.length < 2) return 0;

      const first = trends[0].value;
      const last = trends[trends.length - 1].value;
      
      return ((last - first) / first) * 100;
    },

    getTopProjects: (limit: number) => {
      const data = get().data;
      if (!data) return [];

      return data.projectMetrics
        .map(project => ({
          projectId: project.projectId,
          projectName: project.projectName,
          score: project.successRate * 0.6 + (100 - project.averageTime) * 0.4,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    },
  }))
);