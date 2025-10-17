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
  tokenExpiresAt: number | null;
  isRefreshing: boolean;
  refreshTimeoutId: NodeJS.Timeout | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, organizationName?: string) => Promise<void>;
  getCurrentUser: () => Promise<void>;
  refreshToken: () => Promise<void>;
  scheduleTokenRefresh: (expiresIn: number) => void;
  clearRefreshTimeout: () => void;
  checkTokenExpiration: () => Promise<void>;
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
      tokenExpiresAt: null,
      isRefreshing: false,
      refreshTimeoutId: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.login({ email, password });
          if (response.success && response.data) {
            // Set token expiration and schedule refresh
            const expiresAt = Date.now() + (response.data.expires_in * 1000);
            set({ tokenExpiresAt: expiresAt });
            get().scheduleTokenRefresh(response.data.expires_in);

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
          get().clearRefreshTimeout();
          set({
            user: null,
            isAuthenticated: false,
            currentOrganization: null,
            isLoading: false,
            error: null,
            tokenExpiresAt: null,
            isRefreshing: false,
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
            // Set token expiration and schedule refresh
            const expiresAt = Date.now() + (response.data.expires_in * 1000);
            set({ tokenExpiresAt: expiresAt });
            get().scheduleTokenRefresh(response.data.expires_in);

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

      refreshToken: async () => {
        if (get().isRefreshing) return;

        set({ isRefreshing: true });
        try {
          const response = await apiClient.refreshToken();
          if (response.success && response.data) {
            const expiresAt = Date.now() + (response.data.expires_in * 1000);
            set({ tokenExpiresAt: expiresAt });
            get().scheduleTokenRefresh(response.data.expires_in);
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          // Auto logout on refresh failure
          await get().logout();
        } finally {
          set({ isRefreshing: false });
        }
      },

      scheduleTokenRefresh: (expiresIn: number) => {
        get().clearRefreshTimeout();

        // Schedule refresh 5 minutes before expiration
        const refreshDelay = Math.max((expiresIn - 300) * 1000, 1000); // At least 1 second

        const timeoutId = setTimeout(() => {
          get().refreshToken();
        }, refreshDelay);

        set({ refreshTimeoutId: timeoutId });
      },

      clearRefreshTimeout: () => {
        const { refreshTimeoutId } = get();
        if (refreshTimeoutId) {
          clearTimeout(refreshTimeoutId);
          set({ refreshTimeoutId: null });
        }
      },

      checkTokenExpiration: async () => {
        const { tokenExpiresAt } = get();
        if (tokenExpiresAt && Date.now() >= tokenExpiresAt) {
          // Token expired, try to refresh
          await get().refreshToken();
        }
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
        tokenExpiresAt: state.tokenExpiresAt,
      }),
    }
  )
);

// Initialize token refresh on app startup
if (typeof window !== 'undefined') {
  const authStore = useAuthStore.getState();
  authStore.checkTokenExpiration();
}