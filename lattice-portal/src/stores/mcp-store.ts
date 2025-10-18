import { create } from 'zustand';
import { MCPServer, MCPStatus, MCPFilters, MCPStatusResponse, MCPSyncResponse, MCPHealthCheck } from '@/types';

interface MCPState {
  // MCP servers data
  servers: MCPServer[];
  selectedServer: MCPServer | null;
  serverStatuses: Record<string, MCPStatusResponse>;
  syncHistory: Record<string, MCPSyncResponse[]>;
  healthChecks: Record<string, MCPHealthCheck>;

  // Filters and counts
  filters: MCPFilters;
  connectedCount: number;
  disconnectedCount: number;
  errorCount: number;

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Actions
  setServers: (servers: MCPServer[]) => void;
  setSelectedServer: (server: MCPServer | null) => void;
  setFilters: (filters: MCPFilters) => void;
  addServer: (server: MCPServer) => void;
  updateServer: (serverId: string, updates: Partial<MCPServer>) => void;
  removeServer: (serverId: string) => void;
  updateServerStatus: (serverId: string, status: MCPStatusResponse) => void;
  addSyncResponse: (serverId: string, syncResponse: MCPSyncResponse) => void;
  updateHealthCheck: (serverId: string, healthCheck: MCPHealthCheck) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setConnectedCount: (count: number) => void;
  setDisconnectedCount: (count: number) => void;
  setErrorCount: (count: number) => void;
}

export const useMCPStore = create<MCPState>((set, get) => ({
  // Initial state
  servers: [],
  selectedServer: null,
  serverStatuses: {},
  syncHistory: {},
  healthChecks: {},
  filters: {},
  connectedCount: 0,
  disconnectedCount: 0,
  errorCount: 0,
  isLoading: false,
  error: null,

  // Server data actions
  setServers: (servers) => {
    const connectedCount = servers.filter(s => s.status === MCPStatus.CONNECTED).length;
    const disconnectedCount = servers.filter(s => s.status === MCPStatus.DISCONNECTED).length;
    const errorCount = servers.filter(s => s.status === MCPStatus.ERROR).length;

    set({
      servers,
      connectedCount,
      disconnectedCount,
      errorCount
    });
  },

  setSelectedServer: (server) => set({ selectedServer: server }),

  setFilters: (filters) => set({ filters }),

  // Server actions
  addServer: (server) => set((state) => {
    // Check if server already exists
    const existingIndex = state.servers.findIndex(s => s.id === server.id);
    let newServers;

    if (existingIndex !== -1) {
      // Update existing server
      newServers = [...state.servers];
      newServers[existingIndex] = server;
    } else {
      // Add new server to the beginning
      newServers = [server, ...state.servers];
    }

    // Recalculate counts
    const connectedCount = newServers.filter(s => s.status === MCPStatus.CONNECTED).length;
    const disconnectedCount = newServers.filter(s => s.status === MCPStatus.DISCONNECTED).length;
    const errorCount = newServers.filter(s => s.status === MCPStatus.ERROR).length;

    return {
      ...state,
      servers: newServers,
      connectedCount,
      disconnectedCount,
      errorCount
    };
  }),

  updateServer: (serverId, updates) => set((state) => {
    const newServers = state.servers.map((server) =>
      server.id === serverId
        ? { ...server, ...updates }
        : server
    );

    // Recalculate counts
    const connectedCount = newServers.filter(s => s.status === MCPStatus.CONNECTED).length;
    const disconnectedCount = newServers.filter(s => s.status === MCPStatus.DISCONNECTED).length;
    const errorCount = newServers.filter(s => s.status === MCPStatus.ERROR).length;

    return {
      ...state,
      servers: newServers,
      selectedServer:
        state.selectedServer?.id === serverId
          ? { ...state.selectedServer, ...updates }
          : state.selectedServer,
      connectedCount,
      disconnectedCount,
      errorCount
    };
  }),

  removeServer: (serverId) => set((state) => {
    const newServers = state.servers.filter(
      (server) => server.id !== serverId
    );

    // Recalculate counts
    const connectedCount = newServers.filter(s => s.status === MCPStatus.CONNECTED).length;
    const disconnectedCount = newServers.filter(s => s.status === MCPStatus.DISCONNECTED).length;
    const errorCount = newServers.filter(s => s.status === MCPStatus.ERROR).length;

    // Clean up related data
    const newServerStatuses = { ...state.serverStatuses };
    delete newServerStatuses[serverId];

    const newSyncHistory = { ...state.syncHistory };
    delete newSyncHistory[serverId];

    const newHealthChecks = { ...state.healthChecks };
    delete newHealthChecks[serverId];

    return {
      ...state,
      servers: newServers,
      selectedServer:
        state.selectedServer?.id === serverId
          ? null
          : state.selectedServer,
      serverStatuses: newServerStatuses,
      syncHistory: newSyncHistory,
      healthChecks: newHealthChecks,
      connectedCount,
      disconnectedCount,
      errorCount
    };
  }),

  updateServerStatus: (serverId, status) => set((state) => {
    const newServerStatuses = {
      ...state.serverStatuses,
      [serverId]: status
    };

    // Update server status in the servers list
    const newServers = state.servers.map((server) =>
      server.id === serverId
        ? { ...server, status: status.status, lastHealthCheck: status.lastCheck }
        : server
    );

    // Recalculate counts
    const connectedCount = newServers.filter(s => s.status === MCPStatus.CONNECTED).length;
    const disconnectedCount = newServers.filter(s => s.status === MCPStatus.DISCONNECTED).length;
    const errorCount = newServers.filter(s => s.status === MCPStatus.ERROR).length;

    return {
      ...state,
      serverStatuses: newServerStatuses,
      servers: newServers,
      selectedServer:
        state.selectedServer?.id === serverId
          ? { ...state.selectedServer, status: status.status, lastHealthCheck: status.lastCheck }
          : state.selectedServer,
      connectedCount,
      disconnectedCount,
      errorCount
    };
  }),

  addSyncResponse: (serverId, syncResponse) => set((state) => {
    const currentHistory = state.syncHistory[serverId] || [];
    const newHistory = [syncResponse, ...currentHistory];

    const newSyncHistory = {
      ...state.syncHistory,
      [serverId]: newHistory
    };

    // Update server's last sync time
    const newServers = state.servers.map((server) =>
      server.id === serverId
        ? { ...server, lastSync: syncResponse.startTime }
        : server
    );

    return {
      ...state,
      syncHistory: newSyncHistory,
      servers: newServers,
      selectedServer:
        state.selectedServer?.id === serverId
          ? { ...state.selectedServer, lastSync: syncResponse.startTime }
          : state.selectedServer
    };
  }),

  updateHealthCheck: (serverId, healthCheck) => set((state) => {
    const newHealthChecks = {
      ...state.healthChecks,
      [serverId]: healthCheck
    };

    return {
      ...state,
      healthChecks: newHealthChecks
    };
  }),

  // Loading and error actions
  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  // Count actions
  setConnectedCount: (count) => set({ connectedCount: count }),

  setDisconnectedCount: (count) => set({ disconnectedCount: count }),

  setErrorCount: (count) => set({ errorCount: count })
}));