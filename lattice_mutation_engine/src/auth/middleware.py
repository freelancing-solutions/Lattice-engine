"""
Authentication and Authorization Middleware for Lattice Engine Multi-Tenancy

This module provides FastAPI middleware and dependencies for handling
multi-tenant authentication, authorization, and role-based access control (RBAC).
"""

import jwt
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any, Union
from uuid import UUID
from functools import wraps

from fastapi import HTTPException, Depends, Request, Header, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import and_

from src.models.user_models import UserTable, OrganizationTable, OrganizationMemberTable, UserRole, UserStatus
from src.models.api_key_models import APIKeyTable, APIKeyStatus, APIKeyScope
from src.models.project_models import ProjectTable, ProjectStatus
from src.models.refresh_token_models import RefreshTokenTable, verify_refresh_token
from src.config.settings import config as engine_config


# Security scheme
security = HTTPBearer(auto_error=False)


class AuthenticationError(HTTPException):
    """Authentication failed"""
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(status_code=401, detail=detail)


class AuthorizationError(HTTPException):
    """Authorization failed"""
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(status_code=403, detail=detail)


class TenantContext:
    """Context object containing authenticated user and tenant information"""
    
    def __init__(
        self,
        user: UserTable,
        organization: Optional[OrganizationTable] = None,
        project: Optional[ProjectTable] = None,
        api_key: Optional[APIKeyTable] = None,
        permissions: List[str] = None
    ):
        self.user = user
        self.organization = organization
        self.project = project
        self.api_key = api_key
        self.permissions = permissions or []
        self.is_api_key_auth = api_key is not None
    
    @property
    def user_id(self) -> UUID:
        return self.user.id
    
    @property
    def organization_id(self) -> Optional[UUID]:
        return self.organization.id if self.organization else None
    
    @property
    def project_id(self) -> Optional[UUID]:
        return self.project.id if self.project else None
    
    @property
    def user_role(self) -> UserRole:
        if self.organization:
            # Get role from organization membership
            member = next(
                (m for m in self.organization.members if m.user_id == self.user.id),
                None
            )
            return UserRole(member.role) if member else UserRole.VIEWER
        return UserRole.VIEWER
    
    def has_permission(self, permission: str, resource_id: Optional[str] = None) -> bool:
        """Check if user has specific permission"""
        if self.is_api_key_auth and self.api_key:
            # Check API key scopes
            return any(
                scope.permission == permission 
                for scope in self.api_key.scopes
                if not resource_id or scope.resource_id == resource_id or scope.resource_id == "*"
            )
        
        # Check user permissions based on role
        return permission in self.permissions
    
    def can_access_organization(self, org_id: UUID) -> bool:
        """Check if user can access specific organization"""
        return self.organization_id == org_id
    
    def can_access_project(self, project_id: UUID) -> bool:
        """Check if user can access specific project"""
        if not self.organization:
            return False
        
        # Check if project belongs to user's organization
        return any(p.id == project_id for p in self.organization.projects)
    
    def is_organization_admin(self) -> bool:
        """Check if user is organization admin or owner"""
        return self.user_role in [UserRole.OWNER, UserRole.ADMIN]
    
    def can_manage_users(self) -> bool:
        """Check if user can manage other users"""
        return self.user_role in [UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER]


class AuthService:
    """Authentication and authorization service"""
    
    def __init__(self, db_session_factory=None):
        self.db_session_factory = db_session_factory
        self.jwt_secret = engine_config.jwt_secret or "your-secret-key"
        self.jwt_algorithm = "HS256"
        self.jwt_expiry_minutes = engine_config.jwt_access_token_expire_minutes
    
    def get_db(self) -> Session:
        """Get database session"""
        if not self.db_session_factory:
            raise HTTPException(status_code=500, detail="Database session factory not initialized")
        return self.db_session_factory()
    
    def create_jwt_token(self, user: UserTable, organization_id: Optional[UUID] = None) -> str:
        """Create JWT token for user"""
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "name": user.full_name,
            "org_id": str(organization_id) if organization_id else None,
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=self.jwt_expiry_minutes)
        }

        return jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)

    def create_refresh_token(self, user: UserTable) -> tuple[str, datetime]:
        """Create a refresh token for user"""
        from src.models.refresh_token_models import generate_refresh_token, create_refresh_token_expiry

        refresh_token, refresh_token_hash = generate_refresh_token()
        expires_at = create_refresh_token_expiry()

        return refresh_token, expires_at

    def verify_refresh_token(self, token: str, db: Session) -> Optional[UserTable]:
        """Verify refresh token and return user if valid"""
        from src.models.refresh_token_models import hash_refresh_token

        token_hash = hash_refresh_token(token)

        # Find refresh token in database
        db_token = db.query(RefreshTokenTable).filter(
            RefreshTokenTable.token_hash == token_hash
        ).first()

        if not db_token:
            return None

        # Check if token is expired or revoked
        if not db_token.is_valid():
            return None

        # Get user
        user = db.query(UserTable).filter(UserTable.id == db_token.user_id).first()
        if not user or not user.can_login():
            return None

        # Update last used timestamp
        db_token.last_used_at = datetime.now(timezone.utc)
        db.commit()

        return user
    
    def verify_jwt_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise AuthenticationError("Token has expired")
        except jwt.InvalidTokenError:
            raise AuthenticationError("Invalid token")
    
    def hash_api_key(self, key: str) -> str:
        """Hash API key for storage"""
        return hashlib.sha256(key.encode()).hexdigest()
    
    def verify_api_key(self, key: str, hashed_key: str) -> bool:
        """Verify API key against hash"""
        return hashlib.sha256(key.encode()).hexdigest() == hashed_key
    
    def authenticate_jwt(self, token: str) -> TenantContext:
        """Authenticate user via JWT token"""
        payload = self.verify_jwt_token(token)
        
        with self.get_db() as db:
            user = db.query(UserTable).filter(
                and_(
                    UserTable.id == UUID(payload["sub"]),
                    UserTable.status == UserStatus.ACTIVE
                )
            ).first()
            
            if not user:
                raise AuthenticationError("User not found or inactive")
            
            organization = None
            if payload.get("org_id"):
                organization = db.query(OrganizationTable).filter(
                    OrganizationTable.id == UUID(payload["org_id"])
                ).first()
            
            # Get user permissions based on role
            permissions = self._get_user_permissions(user, organization)
            
            return TenantContext(
                user=user,
                organization=organization,
                permissions=permissions
            )
    
    def authenticate_api_key(self, api_key: str) -> TenantContext:
        """Authenticate user via API key"""
        key_hash = self.hash_api_key(api_key)
        
        with self.get_db() as db:
            api_key_record = db.query(APIKeyTable).filter(
                and_(
                    APIKeyTable.key_hash == key_hash,
                    APIKeyTable.status == APIKeyStatus.ACTIVE
                )
            ).first()
            
            if not api_key_record:
                raise AuthenticationError("Invalid API key")
            
            # Check expiration
            if api_key_record.expires_at and api_key_record.expires_at < datetime.now(timezone.utc):
                raise AuthenticationError("API key has expired")
            
            # Update last used timestamp
            api_key_record.last_used_at = datetime.now(timezone.utc)
            api_key_record.usage_count += 1
            db.commit()
            
            # Get user and organization
            user = db.query(UserTable).filter(UserTable.id == api_key_record.user_id).first()
            organization = db.query(OrganizationTable).filter(
                OrganizationTable.id == api_key_record.organization_id
            ).first()
            
            if not user or user.status != UserStatus.ACTIVE:
                raise AuthenticationError("User not found or inactive")
            
            return TenantContext(
                user=user,
                organization=organization,
                api_key=api_key_record
            )
    
    def _get_user_permissions(self, user: UserTable, organization: Optional[OrganizationTable]) -> List[str]:
        """Get user permissions based on role and organization membership"""
        permissions = []
        
        if not organization:
            return permissions
        
        # Find user's role in organization
        member = next(
            (m for m in organization.members if m.user_id == user.id),
            None
        )
        
        if not member:
            return permissions
        
        role = UserRole(member.role)
        
        # Define permissions by role
        if role == UserRole.OWNER:
            permissions = [
                "organization:manage",
                "users:manage",
                "projects:manage",
                "api_keys:manage",
                "billing:manage",
                "specs:read", "specs:write", "specs:delete",
                "mutations:read", "mutations:write", "mutations:approve",
                "approvals:manage",
                "agents:read", "agents:write", "agents:delete", "agents:manage"
            ]
        elif role == UserRole.ADMIN:
            permissions = [
                "users:manage",
                "projects:manage",
                "api_keys:manage",
                "specs:read", "specs:write", "specs:delete",
                "mutations:read", "mutations:write", "mutations:approve",
                "approvals:manage",
                "agents:read", "agents:write", "agents:delete"
            ]
        elif role == UserRole.MANAGER:
            permissions = [
                "users:invite",
                "projects:read", "projects:write",
                "specs:read", "specs:write",
                "mutations:read", "mutations:write", "mutations:approve",
                "approvals:approve",
                "agents:read", "agents:write"
            ]
        elif role == UserRole.DEVELOPER:
            permissions = [
                "projects:read",
                "specs:read", "specs:write",
                "mutations:read", "mutations:write",
                "agents:read"
            ]
        elif role == UserRole.VIEWER:
            permissions = [
                "projects:read",
                "specs:read",
                "mutations:read",
                "agents:read"
            ]
        
        return permissions


# Global auth service instance
auth_service = None


def init_auth_service(db_session_factory=None):
    """Initialize authentication service"""
    global auth_service
    auth_service = AuthService(db_session_factory)


def get_auth_service() -> AuthService:
    """Get authentication service instance"""
    if not auth_service:
        raise HTTPException(status_code=500, detail="Authentication service not initialized")
    return auth_service


# FastAPI Dependencies
async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
) -> TenantContext:
    """
    Get current authenticated user from JWT token or API key.
    
    Priority:
    1. X-API-Key header
    2. Authorization Bearer token
    3. Legacy API key verification (for backward compatibility)
    """
    auth_svc = get_auth_service()
    
    # Try API key authentication first
    if x_api_key:
        return auth_svc.authenticate_api_key(x_api_key)
    
    # Try JWT authentication
    if credentials and credentials.credentials:
        return auth_svc.authenticate_jwt(credentials.credentials)
    
    # Legacy API key support (from existing verify_api_key function)
    if engine_config.api_keys and x_api_key in engine_config.api_keys:
        # Create a minimal context for legacy API keys
        # This is for backward compatibility only
        from src.models.user_models import UserTable
        
        # Create a system user for legacy API keys
        system_user = UserTable(
            id=UUID("00000000-0000-0000-0000-000000000000"),
            email="system@lattice.local",
            name="System User",
            status=UserStatus.ACTIVE
        )
        
        return TenantContext(
            user=system_user,
            permissions=["*"]  # Full permissions for legacy keys
        )
    
    raise AuthenticationError("Authentication required")


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
) -> Optional[TenantContext]:
    """Get current user if authenticated, otherwise return None"""
    try:
        return await get_current_user(credentials, x_api_key)
    except HTTPException:
        return None


def require_permission(permission: str, resource_param: Optional[str] = None):
    """
    Decorator to require specific permission.
    
    Args:
        permission: Required permission (e.g., "specs:write")
        resource_param: Parameter name containing resource ID for scoped permissions
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get tenant context from function parameters
            context = None
            for arg in args:
                if isinstance(arg, TenantContext):
                    context = arg
                    break
            
            if not context:
                # Try to get from kwargs
                context = kwargs.get('current_user')
            
            if not context:
                raise AuthenticationError("Authentication required")
            
            # Get resource ID if specified
            resource_id = None
            if resource_param and resource_param in kwargs:
                resource_id = kwargs[resource_param]
            
            # Check permission
            if not context.has_permission(permission, resource_id):
                raise AuthorizationError(f"Permission '{permission}' required")
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_organization_access(func):
    """Decorator to require organization access"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        context = kwargs.get('current_user')
        if not context or not context.organization:
            raise AuthorizationError("Organization access required")
        return await func(*args, **kwargs)
    return wrapper


def require_project_access(project_param: str = "project_id"):
    """
    Decorator to require project access.
    
    Args:
        project_param: Parameter name containing project ID
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            context = kwargs.get('current_user')
            if not context:
                raise AuthenticationError("Authentication required")
            
            project_id = kwargs.get(project_param)
            if not project_id:
                raise HTTPException(status_code=400, detail=f"Missing {project_param}")
            
            if not context.can_access_project(UUID(project_id)):
                raise AuthorizationError("Project access denied")
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


# Utility functions for backward compatibility
def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """
    Legacy API key verification for backward compatibility.
    
    This function maintains compatibility with existing endpoints
    while the new authentication system is being integrated.
    """
    if engine_config.api_keys and x_api_key not in engine_config.api_keys:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True


def get_organization_context(
    current_user: TenantContext = Depends(get_current_user),
    organization_id: Optional[str] = Query(None)
) -> TenantContext:
    """
    Get organization context, optionally switching to a different organization
    if the user has access to multiple organizations.
    """
    if not organization_id:
        return current_user
    
    # TODO: Implement organization switching logic
    # For now, just verify the user has access to the requested organization
    if not current_user.can_access_organization(UUID(organization_id)):
        raise AuthorizationError("Organization access denied")
    
    return current_user


def get_project_context(
    current_user: TenantContext = Depends(get_current_user),
    project_id: str = Query(...)
) -> TenantContext:
    """Get project context and verify access"""
    if not current_user.can_access_project(UUID(project_id)):
        raise AuthorizationError("Project access denied")
    
    # Load project into context
    auth_svc = get_auth_service()
    with auth_svc.get_db() as db:
        project = db.query(ProjectTable).filter(
            and_(
                ProjectTable.id == UUID(project_id),
                ProjectTable.status == ProjectStatus.ACTIVE
            )
        ).first()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        current_user.project = project
    
    return current_user


# Rate limiting utilities
class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        self.requests = {}
    
    def is_allowed(self, key: str, limit: int, window_seconds: int) -> bool:
        """Check if request is allowed under rate limit"""
        now = datetime.now(timezone.utc)
        window_start = now - timedelta(seconds=window_seconds)
        
        if key not in self.requests:
            self.requests[key] = []
        
        # Clean old requests
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if req_time > window_start
        ]
        
        # Check limit
        if len(self.requests[key]) >= limit:
            return False
        
        # Add current request
        self.requests[key].append(now)
        return True


# Global rate limiter
rate_limiter = RateLimiter()


def rate_limit(requests_per_minute: int = 60):
    """Rate limiting decorator"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get user context for rate limiting key
            context = kwargs.get('current_user')
            if context:
                key = f"user:{context.user_id}"
            else:
                # Fallback to IP-based limiting
                request = kwargs.get('request')
                if request:
                    key = f"ip:{request.client.host}"
                else:
                    key = "anonymous"
            
            if not rate_limiter.is_allowed(key, requests_per_minute, 60):
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator