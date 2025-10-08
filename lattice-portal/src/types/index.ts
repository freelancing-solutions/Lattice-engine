// Core entity interfaces matching API responses
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'developer' | 'viewer';
  status: 'active' | 'inactive';
  organizations: string[];
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  subscription_tier: 'free' | 'pro' | 'enterprise';
  settings: Record<string, any>;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  status: 'active' | 'archived';
  visibility: 'private' | 'internal' | 'public';
  settings: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Mutation {
  id: string;
  project_id: string;
  operation_type: 'create' | 'update' | 'delete';
  description: string;
  risk_level: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';
  changes: Record<string, any>;
  metadata: Record<string, any>;
  created_by: string;
  approved_by?: string;
  executed_at?: string;
  created_at: string;
  updated_at: string;
}

// Standardized API response format
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata?: Record<string, any>;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// Authentication interfaces
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organization_name?: string;
}

// Form interfaces
export interface CreateProjectRequest {
  name: string;
  description?: string;
  visibility?: 'private' | 'internal' | 'public';
}

export interface CreateMutationRequest {
  project_id: string;
  operation_type: 'create' | 'update' | 'delete';
  description: string;
  risk_level: 'low' | 'medium' | 'high';
  changes: Record<string, any>;
  metadata?: Record<string, any>;
}

// Filter and search interfaces
export interface MutationFilters {
  status?: string[];
  risk_level?: string[];
  project_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface ProjectFilters {
  status?: string[];
  visibility?: string[];
  search?: string;
}

// WebSocket event types
export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface MutationStatusEvent {
  type: 'mutation_status_update';
  mutation_id: string;
  status: string;
  updated_by: string;
}

export interface NotificationEvent {
  type: 'notification_new';
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  };
}