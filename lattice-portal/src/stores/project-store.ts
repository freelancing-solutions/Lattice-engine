import { create } from 'zustand';
import { Project, ProjectFilters } from '@/types';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  filters: ProjectFilters;
  isLoading: boolean;
  error: string | null;
  
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
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  filters: {},
  isLoading: false,
  error: null,

  setProjects: (projects) => {
    set({ projects });
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
    }));
  },

  removeProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
      selectedProject:
        state.selectedProject?.id === id ? null : state.selectedProject,
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