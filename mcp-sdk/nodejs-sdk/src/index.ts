/**
 * Lattice MCP SDK for Node.js
 * 
 * A TypeScript/JavaScript SDK for interacting with the Lattice Engine API.
 * Provides comprehensive support for authentication, project management, and mutation operations.
 * 
 * @example
 * ```typescript
 * import { LatticeClient } from '@lattice/mcp-sdk';
 * 
 * const client = new LatticeClient({
 *   apiKey: 'your-api-key',
 *   baseUrl: 'https://api.lattice-engine.com'
 * });
 * 
 * // Authenticate and get user info
 * const user = await client.authenticate();
 * console.log('Authenticated as:', user.email);
 * 
 * // List projects
 * const projects = await client.listProjects();
 * console.log('Available projects:', projects.length);
 * 
 * // Create a new project
 * const newProject = await client.createProject({
 *   name: 'My New Project',
 *   description: 'A project created via the SDK'
 * });
 * 
 * // Propose a mutation
 * const mutation = await client.proposeMutation({
 *   project_id: newProject.id,
 *   operation_type: 'update',
 *   changes: { /* your changes */ },
 *   description: 'Update project configuration'
 * });
 * ```
 */

// Main client class
export { LatticeClient } from './client';

// Authentication
export { AuthManager } from './auth';

// Data models and types
export {
  // Enums
  UserRole,
  UserStatus,
  OrganizationStatus,
  ProjectStatus,
  MutationStatus,
  
  // Core models
  User,
  Organization,
  Project,
  Mutation,
  MutationRequest,
  MutationResponse,
  
  // API response types
  APIResponse,
  ListResponse,
  ProjectListResponse,
  MutationListResponse,
  
  // Request types
  ProjectCreateRequest,
  ProjectUpdateRequest,
  AuthRequest,
  AuthResponse,
  ListProjectsRequest,
  ListMutationsRequest,
  
  // WebSocket types
  WebSocketMessage,
  MutationStatusUpdate,
  
  // Configuration
  SDKConfig,
  
  // Error types
  ErrorDetail,
  ErrorResponse
} from './models';

// Exception classes
export {
  LatticeError,
  AuthenticationError,
  AuthorizationError,
  ProjectNotFoundError,
  MutationError,
  ValidationError,
  NetworkError,
  RateLimitError,
  ConfigurationError,
  WebSocketError,
  TimeoutError,
  OrganizationError,
  SubscriptionError,
  APIKeyError,
  isLatticeError,
  createErrorFromResponse
} from './exceptions';

// Version information
export const VERSION = '1.0.0';

// Default configuration
export const DEFAULT_CONFIG = {
  baseUrl: 'https://api.lattice-engine.com',
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000
};

/**
 * Create a new Lattice client with the provided configuration
 * @param config - Client configuration options
 * @returns A new LatticeClient instance
 */
export function createClient(config: Partial<import('./models').SDKConfig> = {}): LatticeClient {
  return new LatticeClient(config);
}

/**
 * Utility function to check if the SDK is properly configured
 * @param config - Configuration to validate
 * @returns True if configuration is valid
 */
export function validateConfig(config: Partial<import('./models').SDKConfig>): boolean {
  if (!config.apiKey && !process.env.LATTICE_API_KEY) {
    console.warn('Warning: No API key provided. Authentication may fail.');
    return false;
  }
  
  if (config.baseUrl && !config.baseUrl.startsWith('http')) {
    console.error('Error: Base URL must start with http:// or https://');
    return false;
  }
  
  return true;
}