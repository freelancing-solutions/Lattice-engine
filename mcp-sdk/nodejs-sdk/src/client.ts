import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthManager } from './auth';
import {
  User,
  Organization,
  Project,
  Mutation,
  MutationRequest,
  MutationResponse,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  SDKConfig,
  APIResponse,
  ListResponse,
  ProjectListResponse,
  MutationListResponse
} from './models';
import {
  LatticeError,
  AuthenticationError,
  AuthorizationError,
  ProjectNotFoundError,
  NetworkError,
  createErrorFromResponse
} from './exceptions';

/**
 * Main client for interacting with the Lattice Engine API
 * Provides methods for authentication, project management, and mutation operations
 */
export class LatticeClient {
  private httpClient: AxiosInstance;
  private auth: AuthManager;
  private config: SDKConfig;
  
  // Current context
  private _currentUser: User | null = null;
  private _currentOrganization: Organization | null = null;
  private _currentProject: Project | null = null;

  /**
   * Initialize the Lattice client
   * @param config - Configuration options for the client
   */
  constructor(config: Partial<SDKConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'https://api.lattice-engine.com',
      apiKey: config.apiKey,
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000
    };

    // Initialize authentication manager
    this.auth = new AuthManager(this.config.apiKey);

    // Create HTTP client with default configuration
    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'User-Agent': 'Lattice-MCP-SDK-Node/1.0.0',
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for authentication
    this.httpClient.interceptors.request.use(
      async (config) => {
        const authHeaders = await this.auth.getHeaders();
        config.headers = { ...config.headers, ...authHeaders };
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw createErrorFromResponse(error.response);
        } else if (error.request) {
          throw new NetworkError('Network request failed', { originalError: error });
        } else {
          throw new LatticeError('Request setup failed', { originalError: error });
        }
      }
    );
  }

  /**
   * Make an authenticated HTTP request with retry logic
   * @param config - Axios request configuration
   * @returns Promise resolving to the response data
   */
  private async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.config.maxRetries!; attempt++) {
      try {
        const response: AxiosResponse<T> = await this.httpClient.request(config);
        return response.data;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on authentication/authorization errors
        if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
          throw error;
        }
        
        // Don't retry on the last attempt
        if (attempt === this.config.maxRetries) {
          break;
        }
        
        // Exponential backoff with jitter
        const delay = this.config.retryDelay! * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  // Authentication Methods

  /**
   * Authenticate with the Lattice Engine
   * @param apiKey - Optional API key to use for authentication
   * @returns Promise resolving to the authenticated user
   */
  async authenticate(apiKey?: string): Promise<User> {
    if (apiKey) {
      this.auth.setApiKey(apiKey);
    }

    const response = await this.request<{ user: User; organization?: Organization }>({
      method: 'GET',
      url: '/auth/me'
    });

    this._currentUser = response.user;
    
    if (response.organization) {
      this._currentOrganization = response.organization;
    }

    return this._currentUser;
  }

  /**
   * Get the current authenticated user
   * @returns The current user or null if not authenticated
   */
  getCurrentUser(): User | null {
    return this._currentUser;
  }

  /**
   * Get the current user's organization
   * @returns The current organization or null if not available
   */
  getCurrentOrganization(): Organization | null {
    return this._currentOrganization;
  }

  // Project Methods

  /**
   * List all projects accessible to the current user
   * @returns Promise resolving to an array of projects
   */
  async listProjects(): Promise<Project[]> {
    const response = await this.request<ProjectListResponse>({
      method: 'GET',
      url: '/projects'
    });

    return response.projects;
  }

  /**
   * Get a specific project by ID
   * @param projectId - The ID of the project to retrieve
   * @returns Promise resolving to the project
   */
  async getProject(projectId: string): Promise<Project> {
    const response = await this.request<{ project: Project }>({
      method: 'GET',
      url: `/projects/${projectId}`
    });

    const project = response.project;
    this._currentProject = project;
    return project;
  }

  /**
   * Create a new project
   * @param request - Project creation request data
   * @returns Promise resolving to the created project
   */
  async createProject(request: ProjectCreateRequest): Promise<Project> {
    const response = await this.request<{ project: Project }>({
      method: 'POST',
      url: '/projects',
      data: request
    });

    return response.project;
  }

  /**
   * Update an existing project
   * @param projectId - The ID of the project to update
   * @param request - Project update request data
   * @returns Promise resolving to the updated project
   */
  async updateProject(projectId: string, request: ProjectUpdateRequest): Promise<Project> {
    const response = await this.request<{ project: Project }>({
      method: 'PUT',
      url: `/projects/${projectId}`,
      data: request
    });

    return response.project;
  }

  // Mutation Methods

  /**
   * Propose a mutation for a project
   * @param request - Mutation request data
   * @returns Promise resolving to the mutation response
   */
  async proposeMutation(request: MutationRequest): Promise<MutationResponse> {
    const response = await this.request<MutationResponse>({
      method: 'POST',
      url: '/mutations/propose',
      data: request
    });

    return response;
  }

  /**
   * Get a specific mutation by ID
   * @param mutationId - The ID of the mutation to retrieve
   * @returns Promise resolving to the mutation
   */
  async getMutation(mutationId: string): Promise<Mutation> {
    const response = await this.request<{ mutation: Mutation }>({
      method: 'GET',
      url: `/mutations/${mutationId}`
    });

    return response.mutation;
  }

  /**
   * List mutations with optional filtering
   * @param options - Filtering options
   * @returns Promise resolving to an array of mutations
   */
  async listMutations(options: {
    projectId?: string;
    status?: string;
    limit?: number;
  } = {}): Promise<Mutation[]> {
    const params: Record<string, any> = {
      limit: options.limit || 50
    };

    if (options.projectId) {
      params.project_id = options.projectId;
    }
    if (options.status) {
      params.status = options.status;
    }

    const response = await this.request<MutationListResponse>({
      method: 'GET',
      url: '/mutations',
      params
    });

    return response.mutations;
  }

  /**
   * Approve a pending mutation
   * @param mutationId - The ID of the mutation to approve
   * @returns Promise resolving to the updated mutation
   */
  async approveMutation(mutationId: string): Promise<Mutation> {
    const response = await this.request<{ mutation: Mutation }>({
      method: 'POST',
      url: `/mutations/${mutationId}/approve`
    });

    return response.mutation;
  }

  /**
   * Reject a pending mutation
   * @param mutationId - The ID of the mutation to reject
   * @param reason - Optional reason for rejection
   * @returns Promise resolving to the updated mutation
   */
  async rejectMutation(mutationId: string, reason?: string): Promise<Mutation> {
    const data = reason ? { reason } : {};
    
    const response = await this.request<{ mutation: Mutation }>({
      method: 'POST',
      url: `/mutations/${mutationId}/reject`,
      data
    });

    return response.mutation;
  }

  // Utility Methods

  /**
   * Check the health of the Lattice Engine
   * @returns Promise resolving to health status
   */
  async healthCheck(): Promise<Record<string, any>> {
    return await this.request<Record<string, any>>({
      method: 'GET',
      url: '/health'
    });
  }

  /**
   * Get system metrics
   * @returns Promise resolving to system metrics
   */
  async getMetrics(): Promise<Record<string, any>> {
    return await this.request<Record<string, any>>({
      method: 'GET',
      url: '/metrics'
    });
  }

  /**
   * Set the current project context
   * @param project - The project to set as current
   */
  setCurrentProject(project: Project): void {
    this._currentProject = project;
  }

  /**
   * Get the current project context
   * @returns The current project or null if not set
   */
  getCurrentProject(): Project | null {
    return this._currentProject;
  }

  /**
   * Update the client configuration
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<SDKConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Update HTTP client configuration if needed
    if (config.baseUrl) {
      this.httpClient.defaults.baseURL = config.baseUrl;
    }
    if (config.timeout) {
      this.httpClient.defaults.timeout = config.timeout;
    }
    if (config.apiKey) {
      this.auth.setApiKey(config.apiKey);
    }
  }

  /**
   * Get the current client configuration
   * @returns The current configuration
   */
  getConfig(): SDKConfig {
    return { ...this.config };
  }
}