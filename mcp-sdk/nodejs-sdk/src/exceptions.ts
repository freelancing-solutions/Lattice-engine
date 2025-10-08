/**
 * Exception classes for Lattice MCP SDK
 * 
 * Custom error classes for different error scenarios.
 */

/**
 * Base error class for all Lattice SDK errors
 */
export class LatticeError extends Error {
  public readonly code: string;
  public readonly context: Record<string, any>;

  constructor(
    message: string,
    code: string = 'LATTICE_ERROR',
    context: Record<string, any> = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toString(): string {
    return `${this.code}: ${this.message}`;
  }

  toJSON(): Record<string, any> {
    return {
      error: this.code,
      message: this.message,
      context: this.context
    };
  }
}

/**
 * Raised when authentication fails
 */
export class AuthenticationError extends LatticeError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Raised when user lacks required permissions
 */
export class AuthorizationError extends LatticeError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Raised when a project is not found
 */
export class ProjectNotFoundError extends LatticeError {
  constructor(projectId?: string) {
    const message = projectId ? `Project not found: ${projectId}` : 'Project not found';
    super(message, 'PROJECT_NOT_FOUND', projectId ? { project_id: projectId } : {});
  }
}

/**
 * Raised when a mutation operation fails
 */
export class MutationError extends LatticeError {
  constructor(
    message: string,
    mutationId?: string,
    stage?: string
  ) {
    super(message, 'MUTATION_ERROR', {
      mutation_id: mutationId,
      stage: stage
    });
  }
}

/**
 * Raised when input validation fails
 */
export class ValidationError extends LatticeError {
  constructor(
    message: string,
    field?: string,
    value?: any
  ) {
    super(message, 'VALIDATION_ERROR', {
      field: field,
      value: value !== undefined ? String(value) : undefined
    });
  }
}

/**
 * Raised when network operations fail
 */
export class NetworkError extends LatticeError {
  constructor(message: string, statusCode?: number) {
    super(message, 'NETWORK_ERROR', statusCode ? { status_code: statusCode } : {});
  }
}

/**
 * Raised when rate limits are exceeded
 */
export class RateLimitError extends LatticeError {
  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number
  ) {
    super(message, 'RATE_LIMIT_ERROR', retryAfter ? { retry_after: retryAfter } : {});
  }
}

/**
 * Raised when SDK configuration is invalid
 */
export class ConfigurationError extends LatticeError {
  constructor(message: string, setting?: string) {
    super(message, 'CONFIGURATION_ERROR', setting ? { setting: setting } : {});
  }
}

/**
 * Raised when WebSocket operations fail
 */
export class WebSocketError extends LatticeError {
  constructor(message: string, connectionId?: string) {
    super(message, 'WEBSOCKET_ERROR', connectionId ? { connection_id: connectionId } : {});
  }
}

/**
 * Raised when operations timeout
 */
export class TimeoutError extends LatticeError {
  constructor(message: string = 'Operation timed out', timeout?: number) {
    super(message, 'TIMEOUT_ERROR', timeout ? { timeout: timeout } : {});
  }
}

/**
 * Raised when organization operations fail
 */
export class OrganizationError extends LatticeError {
  constructor(message: string, organizationId?: string) {
    super(message, 'ORGANIZATION_ERROR', organizationId ? { organization_id: organizationId } : {});
  }
}

/**
 * Raised when subscription-related operations fail
 */
export class SubscriptionError extends LatticeError {
  constructor(
    message: string,
    subscriptionId?: string,
    plan?: string
  ) {
    super(message, 'SUBSCRIPTION_ERROR', {
      subscription_id: subscriptionId,
      plan: plan
    });
  }
}

/**
 * Raised when API key operations fail
 */
export class APIKeyError extends LatticeError {
  constructor(message: string, keyId?: string) {
    super(message, 'API_KEY_ERROR', keyId ? { key_id: keyId } : {});
  }
}

/**
 * Type guard to check if an error is a LatticeError
 */
export function isLatticeError(error: any): error is LatticeError {
  return error instanceof LatticeError;
}

/**
 * Helper function to create appropriate error from API response
 */
export function createErrorFromResponse(
  statusCode: number,
  responseData: any
): LatticeError {
  const message = responseData?.error || responseData?.message || 'Unknown error';
  const code = responseData?.code;

  switch (statusCode) {
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new AuthorizationError(message);
    case 404:
      if (code === 'PROJECT_NOT_FOUND') {
        return new ProjectNotFoundError(responseData?.context?.project_id);
      }
      return new LatticeError(message, code || 'NOT_FOUND');
    case 422:
      return new ValidationError(
        message,
        responseData?.details?.[0]?.field,
        responseData?.details?.[0]?.context
      );
    case 429:
      return new RateLimitError(message, responseData?.retry_after);
    case 500:
    case 502:
    case 503:
    case 504:
      return new NetworkError(message, statusCode);
    default:
      return new LatticeError(message, code || 'UNKNOWN_ERROR', { status_code: statusCode });
  }
}