/**
 * Data Models for Lattice MCP SDK
 * 
 * TypeScript interfaces and types for API communication and data validation.
 */

// Enums
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export enum OrganizationStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial'
}

export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DRAFT = 'draft'
}

export enum MutationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export type RiskLevel = 'low' | 'medium' | 'high';
export type OperationType = 'create' | 'update' | 'delete' | 'refactor' | 'optimize' | 'fix' | 'enhance' | 'migrate';

// User Models
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  status: UserStatus;
  role: UserRole;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

// Organization Models
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: OrganizationStatus;
  created_at: string;
  updated_at: string;
  member_count: number;
  project_count: number;
}

// Project Models
export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  organization_id: string;
  status: ProjectStatus;
  spec_content?: string;
  spec_version: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  mutation_count: number;
}

// Mutation Models
export interface MutationRequest {
  project_id: string;
  operation_type: OperationType;
  changes: Record<string, any>;
  description?: string;
  auto_approve?: boolean;
}

export interface Mutation {
  id: string;
  project_id: string;
  operation_type: OperationType;
  changes: Record<string, any>;
  description?: string;
  status: MutationStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  executed_at?: string;
  completed_at?: string;
  error_message?: string;
  execution_log: string[];
}

export interface MutationResponse {
  status: string;
  mutation_id: string;
  requires_approval: boolean;
  estimated_duration?: number; // seconds
  risk_level: RiskLevel;
  affected_files: string[];
  preview_url?: string;
}

// API Response Models
export interface APIResponse {
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ListResponse extends APIResponse {
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export interface ProjectListResponse extends ListResponse {
  projects: Project[];
}

export interface MutationListResponse extends ListResponse {
  mutations: Mutation[];
}

// WebSocket Models
export interface WebSocketMessage {
  type: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface MutationStatusUpdate {
  mutation_id: string;
  status: MutationStatus;
  progress?: number; // 0-100
  message?: string;
  log_entry?: string;
}

// Configuration Models
export interface SDKConfig {
  base_url?: string;
  api_key?: string;
  timeout?: number;
  max_retries?: number;
  auto_retry?: boolean;
  debug?: boolean;
}

// Error Models
export interface ErrorDetail {
  code: string;
  message: string;
  field?: string;
  context?: Record<string, any>;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details: ErrorDetail[];
  timestamp: string;
  request_id?: string;
}

// Request/Response Types
export interface CreateProjectRequest {
  name: string;
  description?: string;
  visibility?: 'private' | 'public';
  settings?: Record<string, any>;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  settings?: Record<string, any>;
}

export interface ListProjectsOptions {
  limit?: number;
  offset?: number;
  status?: ProjectStatus;
}

export interface ListMutationsOptions {
  project_id?: string;
  status?: MutationStatus;
  limit?: number;
  offset?: number;
}

export interface ApproveMutationRequest {
  comment?: string;
}

export interface RejectMutationRequest {
  reason: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends APIResponse {
  user: User;
  token: string;
  expires_at: string;
}

export interface RefreshTokenResponse extends APIResponse {
  token: string;
  expires_at: string;
}