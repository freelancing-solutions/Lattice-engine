import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Organization } from '@/types';
import { apiClient } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  currentOrganization: Organization | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, organizationName?: string) => Promise<void>;
  getCurrentUser: () => Promise<void>;
  setCurrentOrganization: (org: Organization) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      currentOrganization: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.login({ email, password });
          if (response.success && response.data) {
            // Get user data after successful login
            await get().getCurrentUser();
          } else {
            set({ error: response.error?.message || 'Login failed' });
          }
        } catch (error: any) {
          set({ error: error.error?.message || 'Login failed' });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await apiClient.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            currentOrganization: null,
            isLoading: false,
            error: null,
          });
        }
      },

      register: async (email: string, password: string, name: string, organizationName?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.register({ 
            email, 
            password, 
            name, 
            organization_name: organizationName 
          });
          if (response.success && response.data) {
            // Get user data after successful registration
            await get().getCurrentUser();
          } else {
            set({ error: response.error?.message || 'Registration failed' });
          }
        } catch (error: any) {
          set({ error: error.error?.message || 'Registration failed' });
        } finally {
          set({ isLoading: false });
        }
      },

      getCurrentUser: async () => {
        try {
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
            });
          }
        } catch (error) {
          console.error('Failed to get current user:', error);
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },

      setCurrentOrganization: (org: Organization) => {
        set({ currentOrganization: org });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentOrganization: state.currentOrganization,
      }),
    }
  )
);