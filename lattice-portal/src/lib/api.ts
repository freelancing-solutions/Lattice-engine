import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  APIResponse,
  ListResponse,
  User,
  Organization,
  Project,
  Mutation,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  CreateProjectRequest,
  CreateMutationRequest,
  MutationFilters,
  ProjectFilters,
  ApprovalRequest,
  ApprovalResponse,
  ApprovalFilters
} from '@/types';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.project-lattice.site';

class APIClient {
  private client: AxiosInstance;
  private isRefreshing = false;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for authentication
    this.client.interceptors.request.use((config) => {
      const token = this.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            await this.refreshToken();
            // Retry the original request with new token
            const newToken = this.getAuthToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.clearAuthToken();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        } else if (error.response?.data?.error?.message) {
          // Show API error messages
          console.error('API Error:', error.response.data.error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<APIResponse<AuthTokens>> {
    try {
      const response: AxiosResponse<APIResponse<AuthTokens>> = await this.client.post(
        '/api/v1/auth/login',
        credentials
      );

      if (response.data.success && response.data.data) {
        this.setAuthToken(response.data.data.access_token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('refresh_token', response.data.data.refresh_token);
        }
      }

      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Login failed' } };
    }
  }

  async register(userData: RegisterRequest): Promise<APIResponse<AuthTokens>> {
    try {
      const response: AxiosResponse<APIResponse<AuthTokens>> = await this.client.post(
        '/api/v1/auth/register',
        userData
      );

      if (response.data.success && response.data.data) {
        this.setAuthToken(response.data.data.access_token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('refresh_token', response.data.data.refresh_token);
        }
      }

      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Registration failed' } };
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await this.client.post('/api/v1/auth/logout', { refresh_token: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthToken();
    }
  }

  async getCurrentUser(): Promise<APIResponse<User>> {
    try {
      const response: AxiosResponse<APIResponse<User>> = await this.client.get('/api/v1/auth/me');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to get user' } };
    }
  }

  async refreshToken(): Promise<APIResponse<AuthTokens>> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response: AxiosResponse<APIResponse<AuthTokens>> = await this.client.post(
        '/api/v1/auth/refresh',
        { refresh_token: refreshToken }
      );

      if (response.data.success && response.data.data) {
        this.setAuthToken(response.data.data.access_token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('refresh_token', response.data.data.refresh_token);
        }
      }

      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Token refresh failed' } };
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  // Organization methods
  async getOrganizations(): Promise<APIResponse<Organization[]>> {
    try {
      const response: AxiosResponse<APIResponse<Organization[]>> = await this.client.get('/organizations');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to get organizations' } };
    }
  }

  // Project methods
  async getProjects(filters?: ProjectFilters): Promise<APIResponse<ListResponse<Project>>> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status.join(','));
      if (filters?.visibility) params.append('visibility', filters.visibility.join(','));
      if (filters?.search) params.append('search', filters.search);

      const response: AxiosResponse<APIResponse<ListResponse<Project>>> = await this.client.get(
        `/projects?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to get projects' } };
    }
  }

  async getProject(projectId: string): Promise<APIResponse<Project>> {
    try {
      const response: AxiosResponse<APIResponse<Project>> = await this.client.get(`/projects/${projectId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to get project' } };
    }
  }

  async createProject(projectData: CreateProjectRequest): Promise<APIResponse<Project>> {
    try {
      const response: AxiosResponse<APIResponse<Project>> = await this.client.post('/projects', projectData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to create project' } };
    }
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<APIResponse<Project>> {
    try {
      const response: AxiosResponse<APIResponse<Project>> = await this.client.put(
        `/projects/${projectId}`,
        updates
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to update project' } };
    }
  }

  async deleteProject(projectId: string): Promise<APIResponse<void>> {
    try {
      const response: AxiosResponse<APIResponse<void>> = await this.client.delete(`/projects/${projectId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to delete project' } };
    }
  }

  // Mutation methods
  async getMutations(filters?: MutationFilters): Promise<APIResponse<ListResponse<Mutation>>> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status.join(','));
      if (filters?.risk_level) params.append('risk_level', filters.risk_level.join(','));
      if (filters?.project_id) params.append('project_id', filters.project_id);
      if (filters?.date_range) {
        params.append('start_date', filters.date_range.start);
        params.append('end_date', filters.date_range.end);
      }

      const response: AxiosResponse<APIResponse<ListResponse<Mutation>>> = await this.client.get(
        `/mutations?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to get mutations' } };
    }
  }

  async getMutation(mutationId: string): Promise<APIResponse<Mutation>> {
    try {
      const response: AxiosResponse<APIResponse<Mutation>> = await this.client.get(`/mutations/${mutationId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to get mutation' } };
    }
  }

  async createMutation(mutationData: CreateMutationRequest): Promise<APIResponse<Mutation>> {
    try {
      const response: AxiosResponse<APIResponse<Mutation>> = await this.client.post('/mutations', mutationData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to create mutation' } };
    }
  }

  async approveMutation(mutationId: string, comment?: string): Promise<APIResponse<Mutation>> {
    try {
      const response: AxiosResponse<APIResponse<Mutation>> = await this.client.post(
        `/mutations/${mutationId}/approve`,
        { comment }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to approve mutation' } };
    }
  }

  async rejectMutation(mutationId: string, reason: string): Promise<APIResponse<Mutation>> {
    try {
      const response: AxiosResponse<APIResponse<Mutation>> = await this.client.post(
        `/mutations/${mutationId}/reject`,
        { reason }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to reject mutation' } };
    }
  }

  // Approval methods
  async getApprovals(filters?: ApprovalFilters): Promise<APIResponse<ListResponse<ApprovalRequest>>> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start);
        params.append('endDate', filters.dateRange.end);
      }
      if (filters?.mutationType) params.append('mutationType', filters.mutationType);

      const response: AxiosResponse<APIResponse<ListResponse<ApprovalRequest>>> = await this.client.get(
        `/api/approvals?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to get approvals' } };
    }
  }

  async getApproval(approvalId: string): Promise<APIResponse<ApprovalRequest>> {
    try {
      const response: AxiosResponse<APIResponse<ApprovalRequest>> = await this.client.get(
        `/api/approvals/${approvalId}`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to get approval' } };
    }
  }

  async respondToApproval(
    approvalId: string,
    decision: 'approve' | 'reject' | 'request_changes',
    notes?: string,
    modifiedContent?: string
  ): Promise<APIResponse<ApprovalResponse>> {
    try {
      const response: AxiosResponse<APIResponse<ApprovalResponse>> = await this.client.post(
        `/api/approvals/${approvalId}/respond`,
        {
          decision,
          user_notes: notes,
          modified_content: modifiedContent,
          responded_via: 'web'
        }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to respond to approval' } };
    }
  }

  async batchApprovalAction(
    action: 'approve' | 'reject',
    requestIds: string[],
    notes?: string
  ): Promise<APIResponse<{ success: string[], failed: string[] }>> {
    try {
      const response: AxiosResponse<APIResponse<{ success: string[], failed: string[] }>> = await this.client.post(
        '/api/approvals/batch',
        {
          action,
          requestIds,
          notes
        }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to perform batch approval action' } };
    }
  }

  async getPendingApprovals(userId: string): Promise<APIResponse<ApprovalRequest[]>> {
    try {
      const response: AxiosResponse<APIResponse<ApprovalRequest[]>> = await this.client.get(
        `/api/approvals/pending?user_id=${userId}`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to get pending approvals' } };
    }
  }
}

// Create and export singleton instance
export const apiClient = new APIClient();
export default apiClient;