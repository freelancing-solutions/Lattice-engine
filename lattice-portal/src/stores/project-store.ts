import { create } from 'zustand';
import { Project, ProjectFilters } from '@/types';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  filters: ProjectFilters;
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
  setProjects: (projects: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;
  setFilters: (filters: ProjectFilters) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Pagination actions
  setPagination: (page: number, totalPages: number, totalCount: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  
  // Bulk operations
  bulkUpdateProjects: (updates: Array<{ id: string; updates: Partial<Project> }>) => void;
  
  // Filtering
  getFilteredProjects: () => Project[];
  getProjectsByStatus: (status: string) => Project[];
  getProjectsByOrganization: (organizationId: string) => Project[];
  
  // Statistics
  getStatistics: () => {
    total: number;
    active: number;
    completed: number;
    archived: number;
  };
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  filters: {},
  isLoading: false,
  error: null,
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  hasMore: false,
  
  // Real-time updates
  lastUpdated: null,

  setProjects: (projects) => {
    set({ 
      projects,
      lastUpdated: new Date()
    });
  },

  setSelectedProject: (project) => {
    set({ selectedProject: project });
  },

  setFilters: (filters) => {
    set({ filters });
  },

  addProject: (project) => {
    set((state) => ({
      projects: [...state.projects, project],
      totalCount: state.totalCount + 1,
      lastUpdated: new Date()
    }));
  },

  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id ? { ...project, ...updates } : project
      ),
      selectedProject:
        state.selectedProject?.id === id
          ? { ...state.selectedProject, ...updates }
          : state.selectedProject,
      lastUpdated: new Date()
    }));
  },

  removeProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
      selectedProject:
        state.selectedProject?.id === id ? null : state.selectedProject,
      totalCount: Math.max(0, state.totalCount - 1),
      lastUpdated: new Date()
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

  // Pagination actions
  setPagination: (page, totalPages, totalCount) => {
    set({
      currentPage: page,
      totalPages,
      totalCount,
      hasMore: page < totalPages
    });
  },

  nextPage: () => {
    const { currentPage, totalPages } = get();
    if (currentPage < totalPages) {
      set({ currentPage: currentPage + 1 });
    }
  },

  prevPage: () => {
    const { currentPage } = get();
    if (currentPage > 1) {
      set({ currentPage: currentPage - 1 });
    }
  },

  // Bulk operations
  bulkUpdateProjects: (updates) => {
    set((state) => {
      const updatedProjects = [...state.projects];
      updates.forEach(({ id, updates: projectUpdates }) => {
        const index = updatedProjects.findIndex(p => p.id === id);
        if (index !== -1) {
          updatedProjects[index] = { ...updatedProjects[index], ...projectUpdates };
        }
      });
      
      return {
        projects: updatedProjects,
        lastUpdated: new Date()
      };
    });
  },

  // Filtering
  getFilteredProjects: () => {
    const { projects, filters } = get();
    return projects.filter(project => {
      if (filters.status && project.status !== filters.status) return false;
      if (filters.organizationId && project.organizationId !== filters.organizationId) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return project.name.toLowerCase().includes(searchLower) ||
               project.description?.toLowerCase().includes(searchLower);
      }
      return true;
    });
  },

  getProjectsByStatus: (status) => {
    const { projects } = get();
    return projects.filter(project => project.status === status);
  },

  getProjectsByOrganization: (organizationId) => {
    const { projects } = get();
    return projects.filter(project => project.organizationId === organizationId);
  },

  // Statistics
  getStatistics: () => {
    const { projects } = get();
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      archived: projects.filter(p => p.status === 'archived').length
    };
  }
}));