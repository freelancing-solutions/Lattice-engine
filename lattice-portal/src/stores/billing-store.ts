/**
 * Billing Store
 *
 * Zustand store for managing billing state including subscriptions,
 * plans, invoices, usage metrics, and payment methods.
 */

import { create } from 'zustand';
import {
  Subscription,
  SubscriptionWithPlan,
  Plan,
  Invoice,
  UsageMetrics,
  PaymentMethod
} from '@/types';

interface BillingState {
  // State
  currentSubscription: SubscriptionWithPlan | null;
  plans: Plan[];
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
  usage: UsageMetrics | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentSubscription: (subscription: SubscriptionWithPlan | null) => void;
  setPlans: (plans: Plan[]) => void;
  setInvoices: (invoices: Invoice[]) => void;
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  setUsage: (usage: UsageMetrics | null) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Helper methods
  isOverLimit: (metricName: string) => boolean;
  getPlanLimit: (metricName: string) => number;
  getUsagePercentage: (metricName: string) => number;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  // Initial state
  currentSubscription: null,
  plans: [],
  invoices: [],
  paymentMethods: [],
  usage: null,
  isLoading: false,
  error: null,

  // Actions
  setCurrentSubscription: (subscription) => {
    set({ currentSubscription: subscription });
  },

  setPlans: (plans) => {
    set({ plans });
  },

  setInvoices: (invoices) => {
    set({ invoices });
  },

  setPaymentMethods: (methods) => {
    set({ paymentMethods: methods });
  },

  setUsage: (usage) => {
    set({ usage });
  },

  addInvoice: (invoice) => {
    set((state) => ({
      invoices: [invoice, ...state.invoices]
    }));
  },

  updateInvoice: (id, updates) => {
    set((state) => ({
      invoices: state.invoices.map((invoice) =>
        invoice.id === id ? { ...invoice, ...updates } : invoice
      )
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

  // Helper methods
  isOverLimit: (metricName) => {
    const { currentSubscription, usage } = get();

    if (!currentSubscription || !usage) {
      return false;
    }

    const limit = getPlanLimit(metricName);
    const current = usage[metricName as keyof UsageMetrics] as number;

    if (limit === -1) return false; // Unlimited
    return current > limit;
  },

  getPlanLimit: (metricName) => {
    const { currentSubscription } = get();

    if (!currentSubscription || !currentSubscription.plan) {
      return 0;
    }

    const plan = currentSubscription.plan;

    switch (metricName) {
      case 'apiCalls':
        return plan.maxApiCallsMonthly;
      case 'specsCreated':
        return plan.maxSpecsPerProject;
      case 'projectsCreated':
        return plan.maxProjects;
      case 'membersActive':
        return plan.maxMembers;
      default:
        return 0;
    }
  },

  getUsagePercentage: (metricName) => {
    const limit = getPlanLimit(metricName);
    const { usage } = get();

    if (limit === -1) return 0; // Unlimited
    if (!usage || limit === 0) return 0;

    const current = usage[metricName as keyof UsageMetrics] as number;
    return Math.min((current / limit) * 100, 100);
  }
}));