"""
Exception classes for Lattice MCP SDK

Custom exceptions for different error scenarios.
"""

from typing import Optional, Dict, Any


class LatticeError(Exception):
    """Base exception for all Lattice SDK errors"""
    
    def __init__(
        self, 
        message: str, 
        code: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.message = message
        self.code = code or "LATTICE_ERROR"
        self.context = context or {}
    
    def __str__(self):
        return f"{self.code}: {self.message}"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary"""
        return {
            "error": self.code,
            "message": self.message,
            "context": self.context
        }


class AuthenticationError(LatticeError):
    """Raised when authentication fails"""
    
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, "AUTHENTICATION_ERROR")


class AuthorizationError(LatticeError):
    """Raised when user lacks required permissions"""
    
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, "AUTHORIZATION_ERROR")


class ProjectNotFoundError(LatticeError):
    """Raised when a project is not found"""
    
    def __init__(self, project_id: Optional[str] = None):
        message = f"Project not found: {project_id}" if project_id else "Project not found"
        super().__init__(message, "PROJECT_NOT_FOUND")
        self.context = {"project_id": project_id} if project_id else {}


class MutationError(LatticeError):
    """Raised when a mutation operation fails"""
    
    def __init__(
        self, 
        message: str, 
        mutation_id: Optional[str] = None,
        stage: Optional[str] = None
    ):
        super().__init__(message, "MUTATION_ERROR")
        self.context = {
            "mutation_id": mutation_id,
            "stage": stage
        }


class ValidationError(LatticeError):
    """Raised when input validation fails"""
    
    def __init__(
        self, 
        message: str, 
        field: Optional[str] = None,
        value: Optional[Any] = None
    ):
        super().__init__(message, "VALIDATION_ERROR")
        self.context = {
            "field": field,
            "value": str(value) if value is not None else None
        }


class NetworkError(LatticeError):
    """Raised when network operations fail"""
    
    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message, "NETWORK_ERROR")
        self.context = {"status_code": status_code} if status_code else {}


class RateLimitError(LatticeError):
    """Raised when rate limits are exceeded"""
    
    def __init__(
        self, 
        message: str = "Rate limit exceeded", 
        retry_after: Optional[int] = None
    ):
        super().__init__(message, "RATE_LIMIT_ERROR")
        self.context = {"retry_after": retry_after} if retry_after else {}


class ConfigurationError(LatticeError):
    """Raised when SDK configuration is invalid"""
    
    def __init__(self, message: str, setting: Optional[str] = None):
        super().__init__(message, "CONFIGURATION_ERROR")
        self.context = {"setting": setting} if setting else {}


class WebSocketError(LatticeError):
    """Raised when WebSocket operations fail"""
    
    def __init__(self, message: str, connection_id: Optional[str] = None):
        super().__init__(message, "WEBSOCKET_ERROR")
        self.context = {"connection_id": connection_id} if connection_id else {}


class TimeoutError(LatticeError):
    """Raised when operations timeout"""
    
    def __init__(self, message: str = "Operation timed out", timeout: Optional[int] = None):
        super().__init__(message, "TIMEOUT_ERROR")
        self.context = {"timeout": timeout} if timeout else {}


class OrganizationError(LatticeError):
    """Raised when organization operations fail"""
    
    def __init__(
        self, 
        message: str, 
        organization_id: Optional[str] = None
    ):
        super().__init__(message, "ORGANIZATION_ERROR")
        self.context = {"organization_id": organization_id} if organization_id else {}


class SubscriptionError(LatticeError):
    """Raised when subscription-related operations fail"""
    
    def __init__(
        self, 
        message: str, 
        subscription_id: Optional[str] = None,
        plan: Optional[str] = None
    ):
        super().__init__(message, "SUBSCRIPTION_ERROR")
        self.context = {
            "subscription_id": subscription_id,
            "plan": plan
        }


class APIKeyError(LatticeError):
    """Raised when API key operations fail"""
    
    def __init__(self, message: str, key_id: Optional[str] = None):
        super().__init__(message, "API_KEY_ERROR")
        self.context = {"key_id": key_id} if key_id else {}