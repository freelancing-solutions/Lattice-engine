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
  ApprovalFilters,
  Spec,
  SpecFilters,
  CreateSpecRequest,
  UpdateSpecRequest,
  GenerateSpecRequest,
  ValidateSpecRequest,
  ValidationResult,
  Task,
  TaskFilters,
  TaskRequestPayload,
  TaskClarificationPayload,
  TaskCompletionPayload,
  GraphQuery,
  SemanticSearchRequest,
  GraphQueryResult,
  SemanticSearchResult,
  GraphStats,
  Deployment,
  DeploymentFilters,
  CreateDeploymentRequest,
  DeploymentStatusInfo,
  RollbackDeploymentRequest,
  MCPServer,
  MCPServerConfig,
  MCPStatusResponse,
  MCPSyncRequest,
  MCPSyncResponse,
  MCPHealthCheck,
  MCPFilters,
  SpecSyncStatus
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

  // Spec methods
  async getSpecs(projectId: string, filters?: SpecFilters): Promise<APIResponse<ListResponse<Spec>>> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('node_type', filters.type);
      if (filters?.search) params.append('search', filters.search);
      params.append('limit', '50');
      params.append('offset', '0');

      const response: AxiosResponse<any> = await this.client.get(
        `/specs/${projectId}?${params.toString()}`
      );

      // Transform backend response format to frontend ListResponse format
      const backendData = response.data;
      const listResponse: ListResponse<Spec> = {
        items: backendData.specs || [],
        total: backendData.total || 0,
        page: Math.floor((backendData.offset || 0) / (backendData.limit || 50)) + 1,
        limit: backendData.limit || 50,
        has_more: (backendData.offset || 0) + (backendData.specs?.length || 0) < (backendData.total || 0)
      };

      // Convert snake_case fields to camelCase
      const transformedSpecs = listResponse.items.map((spec: any) => ({
        id: spec.id,
        name: spec.name,
        type: spec.type,
        description: spec.description,
        content: spec.content,
        specSource: spec.spec_source,
        metadata: spec.metadata || {},
        status: spec.status,
        createdAt: spec.created_at,
        updatedAt: spec.updated_at
      }));

      return {
        success: true,
        data: {
          ...listResponse,
          items: transformedSpecs
        }
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to get specs' } };
    }
  }

  async getSpec(specId: string): Promise<APIResponse<Spec>> {
    try {
      // Note: Backend doesn't have GET /specs/{id} endpoint
      // This method will need to be implemented on the backend or use client-side filtering
      throw new Error('Get spec by ID endpoint not implemented in backend');
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to get spec' } };
    }
  }

  async createSpec(specData: CreateSpecRequest): Promise<APIResponse<Spec>> {
    try {
      // Convert camelCase to snake_case for backend
      const payload: any = {
        name: specData.name,
        description: specData.description,
        content: specData.content,
        spec_source: specData.specSource,
        metadata: specData.metadata || {}
      };

      const response: AxiosResponse<any> = await this.client.post('/specs/create', payload);

      // Transform response to frontend format
      const createdSpec = response.data.created;
      const transformedSpec: Spec = {
        id: createdSpec.id,
        name: createdSpec.name,
        type: createdSpec.type,
        description: createdSpec.description,
        content: createdSpec.content,
        specSource: createdSpec.spec_source,
        metadata: createdSpec.metadata || {},
        status: createdSpec.status,
        createdAt: createdSpec.created_at,
        updatedAt: createdSpec.updated_at
      };

      return {
        success: true,
        data: transformedSpec
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to create spec' } };
    }
  }

  async updateSpec(updateData: UpdateSpecRequest): Promise<APIResponse<{ graph_snapshot: any, message: string }>> {
    try {
      // Convert camelCase to snake_case for backend
      const payload: any = {
        spec_id: updateData.specId,
        content: updateData.content,
        diff_summary: updateData.diffSummary
      };

      const response: AxiosResponse<any> = await this.client.patch('/specs/update', payload);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to update spec' } };
    }
  }

  async approveSpec(specId: string): Promise<APIResponse<{ status: string, spec_id: string, message: string }>> {
    try {
      const response: AxiosResponse<any> = await this.client.post('/specs/approve', {
        spec_id: specId
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to approve spec' } };
    }
  }

  async deleteSpec(specId: string): Promise<APIResponse<{ deleted: string, message: string }>> {
    try {
      const response: AxiosResponse<any> = await this.client.delete(`/specs/${specId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to delete spec' } };
    }
  }

  async generateSpec(generateData: GenerateSpecRequest): Promise<APIResponse<Spec>> {
    try {
      // Convert camelCase to snake_case for backend
      const payload: any = {
        template_id: generateData.templateId,
        template_type: generateData.templateType,
        parameters: generateData.parameters,
        name: generateData.name,
        description: generateData.description
      };

      const response: AxiosResponse<any> = await this.client.post('/specs/generate', payload);

      // Transform response to frontend format
      const generatedSpec = response.data.generated;
      const transformedSpec: Spec = {
        id: generatedSpec.id,
        name: generatedSpec.name,
        type: generatedSpec.type,
        description: generatedSpec.description,
        content: generatedSpec.content,
        specSource: generatedSpec.spec_source,
        metadata: generatedSpec.metadata || {},
        status: generatedSpec.status,
        createdAt: generatedSpec.created_at,
        updatedAt: generatedSpec.updated_at
      };

      return {
        success: true,
        data: transformedSpec
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to generate spec' } };
    }
  }

  async validateSpec(validateData: ValidateSpecRequest): Promise<APIResponse<ValidationResult>> {
    try {
      // Convert camelCase to snake_case for backend
      const payload: any = {
        content: validateData.content,
        format: validateData.format,
        required_fields: validateData.requiredFields,
        schema: validateData.schema
      };

      const response: AxiosResponse<any> = await this.client.post('/specs/validate', payload);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to validate spec' } };
    }
  }

  // Task methods
  async getTasks(filters?: TaskFilters): Promise<APIResponse<ListResponse<Task>>> {
    try {
      const params = new URLSearchParams();
      if (filters?.requesterId) params.append('requester_id', filters.requesterId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.operation) params.append('operation', filters.operation);
      params.append('limit', '50');
      params.append('offset', '0');

      const response: AxiosResponse<any> = await this.client.get(
        `/tasks?${params.toString()}`
      );

      // Transform backend response format to frontend ListResponse format
      const backendData = response.data;
      const listResponse: ListResponse<Task> = {
        items: backendData.tasks || [],
        total: backendData.total || 0,
        page: Math.floor((backendData.offset || 0) / (backendData.limit || 50)) + 1,
        limit: backendData.limit || 50,
        has_more: (backendData.offset || 0) + (backendData.tasks?.length || 0) < (backendData.total || 0)
      };

      // Convert snake_case fields to camelCase
      const transformedTasks = listResponse.items.map((task: any) => ({
        taskId: task.task_id,
        requesterId: task.requester_id,
        operation: task.operation,
        inputData: task.input_data,
        status: task.status,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        assignedAgentId: task.assigned_agent_id,
        targetAgentType: task.target_agent_type,
        result: task.result,
        error: task.error,
        clarificationNotes: task.clarification_notes || []
      }));

      return {
        success: true,
        data: {
          ...listResponse,
          items: transformedTasks
        }
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to get tasks' } };
    }
  }

  async getTask(taskId: string): Promise<APIResponse<Task>> {
    try {
      const response: AxiosResponse<any> = await this.client.get(`/tasks/status/${taskId}`);

      // Transform response to frontend format
      const taskData = response.data.task;
      const transformedTask: Task = {
        taskId: taskData.task_id,
        requesterId: taskData.requester_id,
        operation: taskData.operation,
        inputData: taskData.input_data,
        status: taskData.status,
        createdAt: taskData.created_at,
        updatedAt: taskData.updated_at,
        assignedAgentId: taskData.assigned_agent_id,
        targetAgentType: taskData.target_agent_type,
        result: taskData.result,
        error: taskData.error,
        clarificationNotes: taskData.clarification_notes || []
      };

      return {
        success: true,
        data: transformedTask
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to get task' } };
    }
  }

  async requestTask(payload: TaskRequestPayload): Promise<APIResponse<Task>> {
    try {
      // Convert camelCase to snake_case for backend
      const backendPayload: any = {
        requester_id: payload.requesterId,
        operation: payload.operation,
        input_data: payload.inputData,
        target_agent_type: payload.targetAgentType,
        priority: payload.priority || 5
      };

      const response: AxiosResponse<any> = await this.client.post('/tasks/request', backendPayload);

      // Transform response to frontend format
      const taskData = response.data.task;
      const transformedTask: Task = {
        taskId: taskData.task_id,
        requesterId: taskData.requester_id,
        operation: taskData.operation,
        inputData: taskData.input_data,
        status: taskData.status,
        createdAt: taskData.created_at,
        updatedAt: taskData.updated_at,
        assignedAgentId: taskData.assigned_agent_id,
        targetAgentType: taskData.target_agent_type,
        result: taskData.result,
        error: taskData.error,
        clarificationNotes: taskData.clarification_notes || []
      };

      return {
        success: true,
        data: transformedTask
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to request task' } };
    }
  }

  async clarifyTask(payload: TaskClarificationPayload): Promise<APIResponse<Task>> {
    try {
      // Convert camelCase to snake_case for backend
      const backendPayload: any = {
        task_id: payload.taskId,
        note: payload.note,
        from_user_id: payload.fromUserId
      };

      const response: AxiosResponse<any> = await this.client.post('/tasks/clarify', backendPayload);

      // Transform response to frontend format
      const taskData = response.data.task;
      const transformedTask: Task = {
        taskId: taskData.task_id,
        requesterId: taskData.requester_id,
        operation: taskData.operation,
        inputData: taskData.input_data,
        status: taskData.status,
        createdAt: taskData.created_at,
        updatedAt: taskData.updated_at,
        assignedAgentId: taskData.assigned_agent_id,
        targetAgentType: taskData.target_agent_type,
        result: taskData.result,
        error: taskData.error,
        clarificationNotes: taskData.clarification_notes || []
      };

      return {
        success: true,
        data: transformedTask
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to clarify task' } };
    }
  }

  async completeTask(payload: TaskCompletionPayload): Promise<APIResponse<Task>> {
    try {
      // Convert camelCase to snake_case for backend
      const backendPayload: any = {
        task_id: payload.taskId,
        success: payload.success,
        result: payload.result,
        notes: payload.notes
      };

      const response: AxiosResponse<any> = await this.client.post('/tasks/complete', backendPayload);

      // Transform response to frontend format
      const taskData = response.data.task;
      const transformedTask: Task = {
        taskId: taskData.task_id,
        requesterId: taskData.requester_id,
        operation: taskData.operation,
        inputData: taskData.input_data,
        status: taskData.status,
        createdAt: taskData.created_at,
        updatedAt: taskData.updated_at,
        assignedAgentId: taskData.assigned_agent_id,
        targetAgentType: taskData.target_agent_type,
        result: taskData.result,
        error: taskData.error,
        clarificationNotes: taskData.clarification_notes || []
      };

      return {
        success: true,
        data: transformedTask
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to complete task' } };
    }
  }

  // Graph methods
  async queryGraph(query: GraphQuery): Promise<APIResponse<GraphQueryResult>> {
    try {
      // Convert camelCase to snake_case for backend
      const backendPayload: any = {
        query_type: query.queryType,
        query: query.query,
        parameters: query.parameters,
        start_node: query.startNode,
        node_id: query.nodeId,
        relationship_types: query.relationshipTypes,
        max_depth: query.maxDepth
      };

      const response: AxiosResponse<any> = await this.client.post('/graph/query', backendPayload);

      // Transform response to frontend format
      const backendData = response.data;
      const results = backendData.results || [];

      // Separate nodes and edges based on presence of source_id/target_id
      const nodes: any[] = [];
      const edges: any[] = [];

      for (const item of results) {
        if (item.source_id && item.target_id) {
          // This is an edge
          edges.push({
            id: item.id || `${item.source_id}-${item.target_id}`,
            source: item.source_id,
            target: item.target_id,
            type: item.type,
            label: item.label,
            animated: item.animated || false,
            style: item.style
          });
        } else {
          // This is a node
          nodes.push({
            id: item.id,
            name: item.name,
            type: item.type,
            description: item.description,
            content: item.content,
            specSource: item.spec_source,
            metadata: item.metadata || {},
            status: item.status,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            // Add default position for ReactFlow
            position: item.position || { x: 0, y: 0 },
            selected: false,
            data: {}
          });
        }
      }

      const queryResult: GraphQueryResult = {
        nodes,
        edges,
        queryTimeMs: backendData.query_time_ms || 0,
        totalResults: backendData.total_results || results.length
      };

      return {
        success: true,
        data: queryResult
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to query graph' } };
    }
  }

  async semanticSearch(request: SemanticSearchRequest): Promise<APIResponse<SemanticSearchResult>> {
    try {
      // Convert camelCase to snake_case for backend
      const backendPayload: any = {
        query: request.query,
        limit: request.limit,
        similarity_threshold: request.similarityThreshold,
        filters: request.filters
      };

      const response: AxiosResponse<any> = await this.client.post('/graph/semantic-search', backendPayload);

      // Transform response to frontend format
      const backendData = response.data;
      const results = backendData.results || [];

      const transformedNodes: any[] = results.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        description: item.description,
        content: item.content,
        specSource: item.spec_source,
        metadata: item.metadata || {},
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        position: { x: 0, y: 0 },
        selected: false,
        data: item.similarity_score ? { similarityScore: item.similarity_score } : {}
      }));

      const searchResult: SemanticSearchResult = {
        nodes: transformedNodes,
        query: backendData.query || request.query,
        similarityThreshold: backendData.similarity_threshold || request.similarityThreshold || 0.7,
        searchTimeMs: backendData.search_time_ms || 0
      };

      return {
        success: true,
        data: searchResult
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to perform semantic search' } };
    }
  }

  async getGraphStats(): Promise<APIResponse<GraphStats>> {
    try {
      const response: AxiosResponse<any> = await this.client.get('/graph/semantic-search/stats');

      // Transform response to frontend format
      const backendData = response.data;
      const stats: GraphStats = {
        available: backendData.available || false,
        backend: backendData.backend || 'unknown',
        totalDocuments: backendData.total_documents || null,
        indexSizeMb: backendData.index_size_mb || null,
        lastUpdated: backendData.last_updated || null
      };

      return {
        success: true,
        data: stats
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to get graph stats' } };
    }
  }

  // Deployment methods
  async getDeployments(filters?: DeploymentFilters): Promise<APIResponse<ListResponse<Deployment>>> {
    try {
      const params = new URLSearchParams();
      if (filters?.environment) params.append('environment', filters.environment);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.mutationId) params.append('mutation_id', filters.mutationId);
      if (filters?.dateRange) {
        params.append('start_date', filters.dateRange.start);
        params.append('end_date', filters.dateRange.end);
      }
      params.append('limit', '50');
      params.append('offset', '0');

      const response: AxiosResponse<any> = await this.client.get(
        `/deployments?${params.toString()}`
      );

      // Transform backend response format to frontend ListResponse format
      const backendData = response.data;
      const listResponse: ListResponse<Deployment> = {
        items: backendData.deployments || [],
        total: backendData.total || 0,
        page: Math.floor((backendData.offset || 0) / (backendData.limit || 50)) + 1,
        limit: backendData.limit || 50,
        has_more: (backendData.offset || 0) + (backendData.deployments?.length || 0) < (backendData.total || 0)
      };

      // Convert snake_case fields to camelCase
      const transformedDeployments = listResponse.items.map((deployment: any) => ({
        deploymentId: deployment.deployment_id,
        mutationId: deployment.mutation_id,
        specId: deployment.spec_id,
        environment: deployment.environment,
        strategy: deployment.strategy,
        status: deployment.status,
        createdAt: deployment.created_at,
        createdBy: deployment.created_by,
        config: deployment.config || {},
        startedAt: deployment.started_at,
        completedAt: deployment.completed_at,
        errorMessage: deployment.error_message,
        rollbackFor: deployment.rollback_for,
        rollbackReason: deployment.rollback_reason,
        rollbackId: deployment.rollback_id
      }));

      return {
        success: true,
        data: {
          ...listResponse,
          items: transformedDeployments
        }
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to get deployments' } };
    }
  }

  async getDeployment(deploymentId: string): Promise<APIResponse<Deployment>> {
    try {
      const response: AxiosResponse<any> = await this.client.get(`/deployments/${deploymentId}`);

      // Transform response to frontend format
      const deploymentData = response.data;
      const transformedDeployment: Deployment = {
        deploymentId: deploymentData.deployment_id,
        mutationId: deploymentData.mutation_id,
        specId: deploymentData.spec_id,
        environment: deploymentData.environment,
        strategy: deploymentData.strategy,
        status: deploymentData.status,
        createdAt: deploymentData.created_at,
        createdBy: deploymentData.created_by,
        config: deploymentData.config || {},
        startedAt: deploymentData.started_at,
        completedAt: deploymentData.completed_at,
        errorMessage: deploymentData.error_message,
        rollbackFor: deploymentData.rollback_for,
        rollbackReason: deploymentData.rollback_reason,
        rollbackId: deploymentData.rollback_id
      };

      return {
        success: true,
        data: transformedDeployment
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to get deployment' } };
    }
  }

  async createDeployment(request: CreateDeploymentRequest): Promise<APIResponse<Deployment>> {
    try {
      // Convert camelCase to snake_case for backend
      const backendPayload: any = {
        mutation_id: request.mutationId,
        spec_id: request.specId,
        environment: request.environment,
        strategy: request.strategy,
        config: request.config || {}
      };

      const response: AxiosResponse<any> = await this.client.post('/deployments', backendPayload);

      // Transform response to frontend format
      const deploymentData = response.data;
      const transformedDeployment: Deployment = {
        deploymentId: deploymentData.deployment_id,
        mutationId: deploymentData.mutation_id,
        specId: deploymentData.spec_id,
        environment: deploymentData.environment,
        strategy: deploymentData.strategy,
        status: deploymentData.status,
        createdAt: deploymentData.created_at,
        createdBy: deploymentData.created_by,
        config: deploymentData.config || {},
        startedAt: deploymentData.started_at,
        completedAt: deploymentData.completed_at,
        errorMessage: deploymentData.error_message,
        rollbackFor: deploymentData.rollback_for,
        rollbackReason: deploymentData.rollback_reason,
        rollbackId: deploymentData.rollback_id
      };

      return {
        success: true,
        data: transformedDeployment
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to create deployment' } };
    }
  }

  async getDeploymentStatus(deploymentId: string): Promise<APIResponse<DeploymentStatusInfo>> {
    try {
      const response: AxiosResponse<any> = await this.client.get(`/deployments/${deploymentId}/status`);

      // Transform response to frontend format
      const statusData = response.data;
      const statusInfo: DeploymentStatusInfo = {
        deploymentId: statusData.deployment_id,
        status: statusData.status,
        progressPercentage: statusData.progress_percentage,
        currentStep: statusData.current_step || 'Unknown',
        estimatedRemainingSeconds: statusData.estimated_remaining_seconds,
        startedAt: statusData.started_at,
        completedAt: statusData.completed_at,
        errorMessage: statusData.error_message
      };

      return {
        success: true,
        data: statusInfo
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to get deployment status' } };
    }
  }

  async rollbackDeployment(deploymentId: string, request: RollbackDeploymentRequest): Promise<APIResponse<Deployment>> {
    try {
      // Convert camelCase to snake_case for backend
      const backendPayload: any = {
        reason: request.reason,
        target_version: request.targetVersion
      };

      const response: AxiosResponse<any> = await this.client.post(`/deployments/${deploymentId}/rollback`, backendPayload);

      // Transform response to frontend format
      const deploymentData = response.data;
      const transformedDeployment: Deployment = {
        deploymentId: deploymentData.deployment_id,
        mutationId: deploymentData.mutation_id,
        specId: deploymentData.spec_id,
        environment: deploymentData.environment,
        strategy: deploymentData.strategy,
        status: deploymentData.status,
        createdAt: deploymentData.created_at,
        createdBy: deploymentData.created_by,
        config: deploymentData.config || {},
        startedAt: deploymentData.started_at,
        completedAt: deploymentData.completed_at,
        errorMessage: deploymentData.error_message,
        rollbackFor: deploymentData.rollback_for,
        rollbackReason: deploymentData.rollback_reason,
        rollbackId: deploymentData.rollback_id
      };

      return {
        success: true,
        data: transformedDeployment
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to rollback deployment' } };
    }
  }

  // MCP (Model Context Protocol) Server Management API Methods

  async getMCPServers(filters?: MCPFilters): Promise<APIResponse<ListResponse<MCPServer>>> {
    try {
      const params: any = {};
      if (filters?.status) {
        params.status = filters.status;
      }
      if (filters?.search) {
        params.search = filters.search;
      }

      const response: AxiosResponse<any> = await this.client.get('/mcp/servers', { params });

      // Transform response data
      const servers = response.data.items.map((server: any) => ({
        id: server.id,
        name: server.name,
        description: server.description,
        endpoint: server.endpoint,
        port: server.port,
        status: server.status,
        config: server.config || {},
        lastHealthCheck: server.last_health_check,
        lastSync: server.last_sync,
        createdAt: server.created_at,
        updatedAt: server.updated_at
      }));

      return {
        success: true,
        data: {
          items: servers,
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit
        }
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to fetch MCP servers' } };
    }
  }

  async getMCPServer(serverId: string): Promise<APIResponse<MCPServer>> {
    try {
      const response: AxiosResponse<any> = await this.client.get(`/mcp/servers/${serverId}`);

      const serverData = response.data;
      const server: MCPServer = {
        id: serverData.id,
        name: serverData.name,
        description: serverData.description,
        endpoint: serverData.endpoint,
        port: serverData.port,
        status: serverData.status,
        config: serverData.config || {},
        lastHealthCheck: serverData.last_health_check,
        lastSync: serverData.last_sync,
        createdAt: serverData.created_at,
        updatedAt: serverData.updated_at
      };

      return {
        success: true,
        data: server
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to fetch MCP server' } };
    }
  }

  async registerMCPServer(name: string, endpoint: string, port: number, config?: MCPServerConfig): Promise<APIResponse<MCPServer>> {
    try {
      // Convert camelCase to snake_case for backend
      const backendPayload: any = {
        name,
        endpoint,
        port,
        config: config ? {
          timeout: config.timeout,
          retry_interval: config.retryInterval,
          max_retries: config.maxRetries,
          headers: config.headers,
          auth: config.auth ? {
            type: config.auth.type,
            token: config.auth.token,
            username: config.auth.username,
            password: config.auth.password,
            custom_header: config.auth.customHeader,
            custom_value: config.auth.customValue
          } : undefined
        } : undefined
      };

      const response: AxiosResponse<any> = await this.client.post('/mcp/servers', backendPayload);

      // Transform response to frontend format
      const serverData = response.data;
      const server: MCPServer = {
        id: serverData.id,
        name: serverData.name,
        description: serverData.description,
        endpoint: serverData.endpoint,
        port: serverData.port,
        status: serverData.status,
        config: serverData.config || {},
        lastHealthCheck: serverData.last_health_check,
        lastSync: serverData.last_sync,
        createdAt: serverData.created_at,
        updatedAt: serverData.updated_at
      };

      return {
        success: true,
        data: server
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to register MCP server' } };
    }
  }

  async updateMCPServer(serverId: string, name: string, endpoint: string, port: number, config?: MCPServerConfig): Promise<APIResponse<MCPServer>> {
    try {
      // Convert camelCase to snake_case for backend
      const backendPayload: any = {
        name,
        endpoint,
        port,
        config: config ? {
          timeout: config.timeout,
          retry_interval: config.retryInterval,
          max_retries: config.maxRetries,
          headers: config.headers,
          auth: config.auth ? {
            type: config.auth.type,
            token: config.auth.token,
            username: config.auth.username,
            password: config.auth.password,
            custom_header: config.auth.customHeader,
            custom_value: config.auth.customValue
          } : undefined
        } : undefined
      };

      const response: AxiosResponse<any> = await this.client.put(`/mcp/servers/${serverId}`, backendPayload);

      // Transform response to frontend format
      const serverData = response.data;
      const server: MCPServer = {
        id: serverData.id,
        name: serverData.name,
        description: serverData.description,
        endpoint: serverData.endpoint,
        port: serverData.port,
        status: serverData.status,
        config: serverData.config || {},
        lastHealthCheck: serverData.last_health_check,
        lastSync: serverData.last_sync,
        createdAt: serverData.created_at,
        updatedAt: serverData.updated_at
      };

      return {
        success: true,
        data: server
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to update MCP server' } };
    }
  }

  async deleteMCPServer(serverId: string): Promise<APIResponse<void>> {
    try {
      await this.client.delete(`/mcp/servers/${serverId}`);

      return {
        success: true
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to delete MCP server' } };
    }
  }

  async getMCPServerStatus(serverId: string): Promise<APIResponse<MCPStatusResponse>> {
    try {
      const response: AxiosResponse<any> = await this.client.get(`/mcp/servers/${serverId}/status`);

      const statusData = response.data;
      const status: MCPStatusResponse = {
        serverId: statusData.server_id,
        status: statusData.status,
        lastCheck: statusData.last_check,
        responseTime: statusData.response_time,
        error: statusData.error
      };

      return {
        success: true,
        data: status
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to fetch MCP server status' } };
    }
  }

  async syncMCPServer(request: MCPSyncRequest): Promise<APIResponse<MCPSyncResponse>> {
    try {
      // Convert camelCase to snake_case for backend
      const backendPayload: any = {
        server_id: request.serverId,
        sync_type: request.syncType,
        options: request.options
      };

      const response: AxiosResponse<any> = await this.client.post('/mcp/sync', backendPayload);

      // Transform response to frontend format
      const syncData = response.data;
      const sync: MCPSyncResponse = {
        syncId: syncData.sync_id,
        serverId: syncData.server_id,
        status: syncData.status,
        startTime: syncData.start_time,
        endTime: syncData.end_time,
        itemsProcessed: syncData.items_processed,
        errors: syncData.errors
      };

      return {
        success: true,
        data: sync
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to sync MCP server' } };
    }
  }

  async getMCPHealthCheck(serverId: string): Promise<APIResponse<MCPHealthCheck>> {
    try {
      const response: AxiosResponse<any> = await this.client.get(`/mcp/servers/${serverId}/health`);

      const healthData = response.data;
      const health: MCPHealthCheck = {
        serverId: healthData.server_id,
        status: healthData.status,
        lastCheck: healthData.last_check,
        responseTime: healthData.response_time,
        error: healthData.error,
        details: healthData.details
      };

      return {
        success: true,
        data: health
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to fetch MCP health check' } };
    }
  }

  // Spec Sync API Methods

  async getSpecSyncStatus(): Promise<APIResponse<SpecSyncStatus>> {
    try {
      const response: AxiosResponse<any> = await this.client.get('/spec-sync/status');

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to fetch spec sync status' } };
    }
  }

  async startSpecSync(): Promise<APIResponse<{ status: string; dir?: string }>> {
    try {
      const response: AxiosResponse<any> = await this.client.post('/spec-sync/start');

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to start spec sync' } };
    }
  }

  async stopSpecSync(): Promise<APIResponse<{ status: string }>> {
    try {
      const response: AxiosResponse<any> = await this.client.post('/spec-sync/stop');

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { message: 'Failed to stop spec sync' } };
    }
  }
}

// Create and export singleton instance
export const apiClient = new APIClient();
export default apiClient;