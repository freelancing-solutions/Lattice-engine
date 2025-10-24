/**
 * Organization Store
 *
 * Zustand store for managing organization state including members and invitations.
 * Follows the same pattern as other stores in the application.
 */

import { create } from 'zustand';
import { Organization, OrganizationMember, OrganizationInvitation } from '@/types';

interface OrganizationState {
  // State
  currentOrganization: Organization | null;
  members: OrganizationMember[];
  invitations: OrganizationInvitation[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentOrganization: (organization: Organization | null) => void;
  setMembers: (members: OrganizationMember[]) => void;
  setInvitations: (invitations: OrganizationInvitation[]) => void;
  addMember: (member: OrganizationMember) => void;
  updateMember: (userId: string, updates: Partial<OrganizationMember>) => void;
  removeMember: (userId: string) => void;
  addInvitation: (invitation: OrganizationInvitation) => void;
  updateInvitation: (id: string, updates: Partial<OrganizationInvitation>) => void;
  removeInvitation: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  // Initial state
  currentOrganization: null,
  members: [],
  invitations: [],
  isLoading: false,
  error: null,

  // Actions
  setCurrentOrganization: (organization) => {
    set({ currentOrganization: organization });
  },

  setMembers: (members) => {
    set({ members });
  },

  setInvitations: (invitations) => {
    set({ invitations });
  },

  addMember: (member) => {
    set((state) => ({
      members: [member, ...state.members]
    }));
  },

  updateMember: (userId, updates) => {
    set((state) => ({
      members: state.members.map((member) =>
        member.userId === userId ? { ...member, ...updates } : member
      )
    }));
  },

  removeMember: (userId) => {
    set((state) => ({
      members: state.members.filter((member) => member.userId !== userId)
    }));
  },

  addInvitation: (invitation) => {
    set((state) => ({
      invitations: [invitation, ...state.invitations]
    }));
  },

  updateInvitation: (id, updates) => {
    set((state) => ({
      invitations: state.invitations.map((invitation) =>
        invitation.id === id ? { ...invitation, ...updates } : invitation
      )
    }));
  },

  removeInvitation: (id) => {
    set((state) => ({
      invitations: state.invitations.filter((invitation) => invitation.id !== id)
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
  }
}));