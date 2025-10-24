/**
 * Zustand store for webhook state management
 */

import { create } from 'zustand';
import { Webhook, WebhookDelivery, WebhookFilters } from '@/types';

interface WebhookState {
  // State
  webhooks: Webhook[];
  selectedWebhook: Webhook | null;
  deliveries: Record<string, WebhookDelivery[]>;
  filters: WebhookFilters;
  isLoading: boolean;
  error: string | null;

  // Computed values
  activeCount: number;
  totalDeliveries: number;
}

interface WebhookActions {
  // Basic state actions
  setWebhooks: (webhooks: Webhook[]) => void;
  setSelectedWebhook: (webhook: Webhook | null) => void;
  setFilters: (filters: WebhookFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Webhook CRUD actions
  addWebhook: (webhook: Webhook) => void;
  updateWebhook: (id: string, updates: Partial<Webhook>) => void;
  removeWebhook: (id: string) => void;

  // Delivery actions
  setDeliveries: (webhookId: string, deliveries: WebhookDelivery[]) => void;
  addDelivery: (webhookId: string, delivery: WebhookDelivery) => void;

  // Computed actions
  setActiveCount: (count: number) => void;
  setTotalDeliveries: (count: number) => void;

  // Helper methods
  getSuccessRate: (webhookId: string) => number;
  getWebhookById: (id: string) => Webhook | null;
  getFilteredWebhooks: () => Webhook[];
  clearDeliveries: (webhookId: string) => void;
}

type WebhookStore = WebhookState & WebhookActions;

export const useWebhookStore = create<WebhookStore>((set, get) => ({
  // Initial state
  webhooks: [],
  selectedWebhook: null,
  deliveries: {},
  filters: {},
  isLoading: false,
  error: null,
  activeCount: 0,
  totalDeliveries: 0,

  // Basic state actions
  setWebhooks: (webhooks) => {
    const activeCount = webhooks.filter(w => w.active).length;
    const totalDeliveries = webhooks.reduce((sum, w) => sum + w.totalDeliveries, 0);

    set({
      webhooks,
      activeCount,
      totalDeliveries,
      error: null
    });
  },

  setSelectedWebhook: (webhook) => set({ selectedWebhook: webhook }),

  setFilters: (filters) => set({ filters }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  // Webhook CRUD actions
  addWebhook: (webhook) => set((state) => {
    const newWebhooks = [webhook, ...state.webhooks];
    const activeCount = newWebhooks.filter(w => w.active).length;
    const totalDeliveries = newWebhooks.reduce((sum, w) => sum + w.totalDeliveries, 0);

    return {
      webhooks: newWebhooks,
      activeCount,
      totalDeliveries,
      selectedWebhook: webhook
    };
  }),

  updateWebhook: (id, updates) => set((state) => {
    const updatedWebhooks = state.webhooks.map(webhook =>
      webhook.id === id ? { ...webhook, ...updates } : webhook
    );

    const activeCount = updatedWebhooks.filter(w => w.active).length;
    const totalDeliveries = updatedWebhooks.reduce((sum, w) => sum + w.totalDeliveries, 0);

    return {
      webhooks: updatedWebhooks,
      activeCount,
      totalDeliveries,
      selectedWebhook: state.selectedWebhook?.id === id
        ? { ...state.selectedWebhook, ...updates }
        : state.selectedWebhook
    };
  }),

  removeWebhook: (id) => set((state) => {
    const newWebhooks = state.webhooks.filter(webhook => webhook.id !== id);
    const activeCount = newWebhooks.filter(w => w.active).length;
    const totalDeliveries = newWebhooks.reduce((sum, w) => sum + w.totalDeliveries, 0);

    const newDeliveries = { ...state.deliveries };
    delete newDeliveries[id];

    return {
      webhooks: newWebhooks,
      activeCount,
      totalDeliveries,
      deliveries: newDeliveries,
      selectedWebhook: state.selectedWebhook?.id === id ? null : state.selectedWebhook
    };
  }),

  // Delivery actions
  setDeliveries: (webhookId, deliveries) => set((state) => ({
    deliveries: {
      ...state.deliveries,
      [webhookId]: deliveries
    }
  })),

  addDelivery: (webhookId, delivery) => set((state) => {
    const existingDeliveries = state.deliveries[webhookId] || [];
    const newDeliveries = [delivery, ...existingDeliveries];

    return {
      deliveries: {
        ...state.deliveries,
        [webhookId]: newDeliveries
      }
    };
  }),

  // Computed actions
  setActiveCount: (count) => set({ activeCount: count }),

  setTotalDeliveries: (count) => set({ totalDeliveries: count }),

  // Helper methods
  getSuccessRate: (webhookId) => {
    const webhook = get().webhooks.find(w => w.id === webhookId);
    if (!webhook || webhook.totalDeliveries === 0) return 0;
    return Math.round((webhook.successfulDeliveries / webhook.totalDeliveries) * 100);
  },

  getWebhookById: (id) => {
    return get().webhooks.find(w => w.id === id) || null;
  },

  getFilteredWebhooks: () => {
    const { webhooks, filters } = get();

    let filtered = webhooks;

    if (filters.active !== undefined) {
      filtered = filtered.filter(w => w.active === filters.active);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(searchTerm) ||
        w.url.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  },

  clearDeliveries: (webhookId) => set((state) => {
    const newDeliveries = { ...state.deliveries };
    delete newDeliveries[webhookId];

    return {
      deliveries: newDeliveries
    };
  })
}));

// Export individual hooks for convenience
export const useWebhooks = () => useWebhookStore(state => state.webhooks);
export const useSelectedWebhook = () => useWebhookStore(state => state.selectedWebhook);
export const useWebhookDeliveries = () => useWebhookStore(state => state.deliveries);
export const useWebhookFilters = () => useWebhookStore(state => state.filters);
export const useWebhookLoading = () => useWebhookStore(state => state.isLoading);
export const useWebhookError = () => useWebhookStore(state => state.error);
export const useWebhookStats = () => useWebhookStore(state => ({
  activeCount: state.activeCount,
  totalDeliveries: state.totalDeliveries
}));

// Export action hooks
export const useWebhookActions = () => useWebhookStore(state => ({
  setWebhooks: state.setWebhooks,
  setSelectedWebhook: state.setSelectedWebhook,
  setFilters: state.setFilters,
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError,
  addWebhook: state.addWebhook,
  updateWebhook: state.updateWebhook,
  removeWebhook: state.removeWebhook,
  setDeliveries: state.setDeliveries,
  addDelivery: state.addDelivery,
  clearDeliveries: state.clearDeliveries
}));

// Export helper hooks
export const useWebhookHelpers = () => useWebhookStore(state => ({
  getSuccessRate: state.getSuccessRate,
  getWebhookById: state.getWebhookById,
  getFilteredWebhooks: state.getFilteredWebhooks
}));