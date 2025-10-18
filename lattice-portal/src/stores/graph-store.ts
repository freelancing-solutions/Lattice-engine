import { create } from 'zustand';
import { GraphNode, GraphEdge, GraphFilters, GraphStats, GraphLayout } from '@/types';

interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  filters: GraphFilters;
  layout: GraphLayout;
  isLoading: boolean;
  error: string | null;
  searchResults: GraphNode[];
  isSearching: boolean;
  searchError: string | null;
  stats: GraphStats | null;

  // Actions
  setNodes: (nodes: GraphNode[]) => void;
  setEdges: (edges: GraphEdge[]) => void;
  setGraph: (nodes: GraphNode[], edges: GraphEdge[]) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setFilters: (filters: GraphFilters) => void;
  setLayout: (layout: GraphLayout) => void;
  addNode: (node: GraphNode) => void;
  updateNode: (id: string, updates: Partial<GraphNode>) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: GraphEdge) => void;
  removeEdge: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setSearchResults: (results: GraphNode[]) => void;
  setSearching: (searching: boolean) => void;
  setSearchError: (error: string | null) => void;
  setStats: (stats: GraphStats | null) => void;
  clearGraph: () => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  filters: {},
  layout: GraphLayout.FORCE,
  isLoading: false,
  error: null,
  searchResults: [],
  isSearching: false,
  searchError: null,
  stats: null,

  setNodes: (nodes) => {
    set({ nodes });
  },

  setEdges: (edges) => {
    set({ edges });
  },

  setGraph: (nodes, edges) => {
    set({
      nodes,
      edges,
      selectedNodeId: null, // Clear selection when graph is replaced
    });
  },

  setSelectedNodeId: (nodeId) => {
    set((state) => {
      // Update selected state on nodes
      const updatedNodes = state.nodes.map((node) => ({
        ...node,
        selected: node.id === nodeId,
      }));

      return {
        ...state,
        nodes: updatedNodes,
        selectedNodeId: nodeId,
      };
    });
  },

  setFilters: (filters) => {
    set({ filters });
  },

  setLayout: (layout) => {
    set({ layout });
  },

  addNode: (node) => {
    set((state) => {
      // Check if node already exists
      const existingIndex = state.nodes.findIndex(n => n.id === node.id);
      let newNodes;

      if (existingIndex !== -1) {
        // Update existing node
        newNodes = [...state.nodes];
        newNodes[existingIndex] = node;
      } else {
        // Add new node
        newNodes = [node, ...state.nodes];
      }

      return {
        ...state,
        nodes: newNodes,
      };
    });
  },

  updateNode: (id, updates) => {
    set((state) => {
      const newNodes = state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      );

      return {
        ...state,
        nodes: newNodes,
        selectedNodeId:
          state.selectedNodeId === id
            ? { ...updates, id: state.selectedNodeId }
            : state.selectedNodeId,
      };
    });
  },

  removeNode: (id) => {
    set((state) => {
      const newNodes = state.nodes.filter((node) => node.id !== id);
      const newEdges = state.edges.filter((edge) =>
        edge.source !== id && edge.target !== id
      );

      return {
        ...state,
        nodes: newNodes,
        edges: newEdges,
        selectedNodeId:
          state.selectedNodeId === id ? null : state.selectedNodeId,
      };
    });
  },

  addEdge: (edge) => {
    set((state) => {
      // Check if edge already exists
      const existingIndex = state.edges.findIndex(e => e.id === edge.id);
      let newEdges;

      if (existingIndex !== -1) {
        // Update existing edge
        newEdges = [...state.edges];
        newEdges[existingIndex] = edge;
      } else {
        // Add new edge
        newEdges = [edge, ...state.edges];
      }

      return {
        ...state,
        edges: newEdges,
      };
    });
  },

  removeEdge: (id) => {
    set((state) => ({
      ...state,
      edges: state.edges.filter((edge) => edge.id !== id),
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

  setSearchResults: (results) => {
    set({ searchResults: results });
  },

  setSearching: (searching) => {
    set({ isSearching: searching });
  },

  setSearchError: (error) => {
    set({ searchError: error });
  },

  setStats: (stats) => {
    set({ stats });
  },

  clearGraph: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      searchResults: [],
    });
  },
}));