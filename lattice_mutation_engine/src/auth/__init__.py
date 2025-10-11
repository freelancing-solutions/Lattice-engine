"""
Authentication module for Lattice Engine Multi-Tenancy

This module provides authentication and authorization components
for the Lattice Engine SaaS platform.
"""

from src.auth.middleware import (
    AuthService,
    TenantContext,
    AuthenticationError,
    AuthorizationError,
    get_current_user,
    get_current_user_optional,
    get_organization_context,
    get_project_context,
    require_permission,
    require_organization_access,
    require_project_access,
    verify_api_key,
    rate_limit,
    init_auth_service,
    get_auth_service
)

__all__ = [
    "AuthService",
    "TenantContext", 
    "AuthenticationError",
    "AuthorizationError",
    "get_current_user",
    "get_current_user_optional",
    "get_organization_context",
    "get_project_context",
    "require_permission",
    "require_organization_access", 
    "require_project_access",
    "verify_api_key",
    "rate_limit",
    "init_auth_service",
    "get_auth_service"
]