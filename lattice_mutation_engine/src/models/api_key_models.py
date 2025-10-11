"""
API Key Models for Lattice Engine Multi-Tenancy

This module defines API key management models for the Lattice Engine
SaaS platform, providing organization-scoped API keys with granular permissions.
"""

from datetime import datetime, timezone, timedelta
from enum import Enum
from typing import Optional, List, Set
from uuid import UUID, uuid4
import secrets
import hashlib

from pydantic import BaseModel, Field, validator
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID as PGUUID, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

from src.models.user_models import Base


class APIKeyScope(str, Enum):
    """API key scopes/permissions"""
    # Spec management
    SPECS_READ = "specs:read"
    SPECS_WRITE = "specs:write"
    SPECS_DELETE = "specs:delete"
    
    # Mutation management
    MUTATIONS_READ = "mutations:read"
    MUTATIONS_WRITE = "mutations:write"
    MUTATIONS_EXECUTE = "mutations:execute"
    
    # Project management
    PROJECTS_READ = "projects:read"
    PROJECTS_WRITE = "projects:write"
    PROJECTS_DELETE = "projects:delete"
    
    # Organization management (admin only)
    ORG_READ = "org:read"
    ORG_WRITE = "org:write"
    ORG_MEMBERS = "org:members"
    
    # API key management (admin only)
    APIKEYS_READ = "apikeys:read"
    APIKEYS_WRITE = "apikeys:write"
    APIKEYS_DELETE = "apikeys:delete"
    
    # Usage and analytics
    USAGE_READ = "usage:read"
    
    # WebSocket connections
    WEBSOCKET_CONNECT = "websocket:connect"


class APIKeyStatus(str, Enum):
    """API key status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    REVOKED = "revoked"
    EXPIRED = "expired"


# SQLAlchemy Models
class APIKeyTable(Base):
    """SQLAlchemy API Key table model"""
    __tablename__ = "api_keys"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Key data
    key_hash = Column(String(64), unique=True, nullable=False, index=True)  # SHA-256 hash
    key_prefix = Column(String(10), nullable=False, index=True)  # First 8 chars for identification
    
    # Scoping
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    project_id = Column(PGUUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)  # If None, org-wide
    created_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Permissions
    scopes = Column(ARRAY(String), nullable=False, default=list)
    
    # Status and lifecycle
    status = Column(String(20), nullable=False, default=APIKeyStatus.ACTIVE.value)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    last_used = Column(DateTime(timezone=True), nullable=True)
    usage_count = Column(String, default="0")  # Store as string to handle large numbers
    
    # Rate limiting
    rate_limit_per_minute = Column(String, nullable=True)  # Requests per minute
    rate_limit_per_hour = Column(String, nullable=True)    # Requests per hour
    rate_limit_per_day = Column(String, nullable=True)     # Requests per day
    
    # Metadata
    metadata = Column(JSON, default=dict)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    revoked_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    revoked_reason = Column(Text, nullable=True)
    
    # Relationships
    organization = relationship("OrganizationTable", back_populates="api_keys")
    project = relationship("ProjectTable", back_populates="api_keys")
    creator = relationship("UserTable", foreign_keys=[created_by])
    revoker = relationship("UserTable", foreign_keys=[revoked_by])
    usage_logs = relationship("APIKeyUsageLogTable", back_populates="api_key")


class APIKeyUsageLogTable(Base):
    """SQLAlchemy API Key Usage Log table model"""
    __tablename__ = "api_key_usage_logs"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    api_key_id = Column(PGUUID(as_uuid=True), ForeignKey("api_keys.id"), nullable=False)
    
    # Request details
    endpoint = Column(String(255), nullable=False)
    method = Column(String(10), nullable=False)
    status_code = Column(String, nullable=False)
    response_time_ms = Column(String, nullable=True)
    
    # Client information
    ip_address = Column(String(45), nullable=True)  # IPv6 compatible
    user_agent = Column(Text, nullable=True)
    
    # Metadata
    request_id = Column(String(100), nullable=True)
    metadata = Column(JSON, default=dict)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    api_key = relationship("APIKeyTable", back_populates="usage_logs")


# Pydantic Models
class APIKeyBase(BaseModel):
    """Base API key model"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    scopes: List[APIKeyScope] = Field(default_factory=list)
    expires_in_days: Optional[int] = Field(None, ge=1, le=365)
    rate_limit_per_minute: Optional[int] = Field(None, ge=1, le=10000)
    rate_limit_per_hour: Optional[int] = Field(None, ge=1, le=100000)
    rate_limit_per_day: Optional[int] = Field(None, ge=1, le=1000000)
    
    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('API key name cannot be empty')
        return v.strip()
    
    @validator('scopes')
    def validate_scopes(cls, v):
        if not v:
            raise ValueError('At least one scope must be specified')
        return list(set(v))  # Remove duplicates


class APIKeyCreate(APIKeyBase):
    """API key creation model"""
    organization_id: UUID
    project_id: Optional[UUID] = None


class APIKeyUpdate(BaseModel):
    """API key update model"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[APIKeyStatus] = None
    scopes: Optional[List[APIKeyScope]] = None
    rate_limit_per_minute: Optional[int] = Field(None, ge=1, le=10000)
    rate_limit_per_hour: Optional[int] = Field(None, ge=1, le=100000)
    rate_limit_per_day: Optional[int] = Field(None, ge=1, le=1000000)


class APIKey(APIKeyBase):
    """Complete API key model (without the actual key)"""
    id: UUID
    key_prefix: str
    organization_id: UUID
    project_id: Optional[UUID] = None
    created_by: UUID
    status: APIKeyStatus
    expires_at: Optional[datetime] = None
    last_used: Optional[datetime] = None
    usage_count: int
    created_at: datetime
    updated_at: datetime
    revoked_at: Optional[datetime] = None
    revoked_by: Optional[UUID] = None
    revoked_reason: Optional[str] = None
    metadata: dict
    
    class Config:
        from_attributes = True
    
    def is_active(self) -> bool:
        """Check if API key is active and not expired"""
        if self.status != APIKeyStatus.ACTIVE:
            return False
        
        if self.expires_at and datetime.now(timezone.utc) > self.expires_at:
            return False
        
        return True
    
    def is_expired(self) -> bool:
        """Check if API key is expired"""
        if not self.expires_at:
            return False
        return datetime.now(timezone.utc) > self.expires_at
    
    def days_until_expiry(self) -> Optional[int]:
        """Get days until API key expires"""
        if not self.expires_at:
            return None
        delta = self.expires_at - datetime.now(timezone.utc)
        return max(0, delta.days)
    
    def has_scope(self, scope: APIKeyScope) -> bool:
        """Check if API key has specific scope"""
        return scope in self.scopes
    
    def has_any_scope(self, scopes: List[APIKeyScope]) -> bool:
        """Check if API key has any of the specified scopes"""
        return any(scope in self.scopes for scope in scopes)
    
    def has_all_scopes(self, scopes: List[APIKeyScope]) -> bool:
        """Check if API key has all specified scopes"""
        return all(scope in self.scopes for scope in scopes)
    
    def can_access_project(self, project_id: UUID) -> bool:
        """Check if API key can access specific project"""
        # Organization-wide keys can access all projects in the org
        if self.project_id is None:
            return True
        # Project-specific keys can only access their project
        return self.project_id == project_id


class APIKeyWithSecret(APIKey):
    """API key model with the actual secret (only returned on creation)"""
    key: str
    
    class Config:
        from_attributes = True


class APIKeyUsageLogBase(BaseModel):
    """Base API key usage log model"""
    endpoint: str = Field(..., min_length=1, max_length=255)
    method: str = Field(..., min_length=1, max_length=10)
    status_code: int = Field(..., ge=100, le=599)
    response_time_ms: Optional[int] = Field(None, ge=0)
    ip_address: Optional[str] = Field(None, max_length=45)
    user_agent: Optional[str] = Field(None, max_length=1000)
    request_id: Optional[str] = Field(None, max_length=100)
    metadata: dict = Field(default_factory=dict)


class APIKeyUsageLogCreate(APIKeyUsageLogBase):
    """API key usage log creation model"""
    api_key_id: UUID


class APIKeyUsageLog(APIKeyUsageLogBase):
    """Complete API key usage log model"""
    id: UUID
    api_key_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class APIKeyUsageStats(BaseModel):
    """API key usage statistics"""
    api_key_id: UUID
    total_requests: int
    requests_last_24h: int
    requests_last_7d: int
    requests_last_30d: int
    avg_response_time_ms: Optional[float] = None
    error_rate_percent: Optional[float] = None
    most_used_endpoints: List[dict] = Field(default_factory=list)
    last_used: Optional[datetime] = None


# Utility functions for API key generation
def generate_api_key() -> tuple[str, str, str]:
    """
    Generate a new API key with prefix and hash.
    
    Returns:
        tuple: (full_key, key_prefix, key_hash)
    """
    # Generate a secure random key
    key_bytes = secrets.token_bytes(32)  # 256 bits
    key_b64 = secrets.token_urlsafe(32)  # URL-safe base64
    
    # Create the full key with prefix
    full_key = f"lte_{key_b64}"
    
    # Extract prefix (first 8 characters after lte_)
    key_prefix = full_key[:12]  # "lte_" + 8 chars
    
    # Create hash for storage
    key_hash = hashlib.sha256(full_key.encode()).hexdigest()
    
    return full_key, key_prefix, key_hash


def hash_api_key(key: str) -> str:
    """Hash an API key for secure storage"""
    return hashlib.sha256(key.encode()).hexdigest()


def verify_api_key(key: str, stored_hash: str) -> bool:
    """Verify an API key against its stored hash"""
    return hash_api_key(key) == stored_hash


# Scope groups for easier management
SCOPE_GROUPS = {
    "read_only": [
        APIKeyScope.SPECS_READ,
        APIKeyScope.MUTATIONS_READ,
        APIKeyScope.PROJECTS_READ,
        APIKeyScope.ORG_READ,
        APIKeyScope.USAGE_READ
    ],
    "developer": [
        APIKeyScope.SPECS_READ,
        APIKeyScope.SPECS_WRITE,
        APIKeyScope.MUTATIONS_READ,
        APIKeyScope.MUTATIONS_WRITE,
        APIKeyScope.MUTATIONS_EXECUTE,
        APIKeyScope.PROJECTS_READ,
        APIKeyScope.WEBSOCKET_CONNECT
    ],
    "admin": [
        APIKeyScope.SPECS_READ,
        APIKeyScope.SPECS_WRITE,
        APIKeyScope.SPECS_DELETE,
        APIKeyScope.MUTATIONS_READ,
        APIKeyScope.MUTATIONS_WRITE,
        APIKeyScope.MUTATIONS_EXECUTE,
        APIKeyScope.PROJECTS_READ,
        APIKeyScope.PROJECTS_WRITE,
        APIKeyScope.PROJECTS_DELETE,
        APIKeyScope.ORG_READ,
        APIKeyScope.ORG_WRITE,
        APIKeyScope.ORG_MEMBERS,
        APIKeyScope.APIKEYS_READ,
        APIKeyScope.APIKEYS_WRITE,
        APIKeyScope.APIKEYS_DELETE,
        APIKeyScope.USAGE_READ,
        APIKeyScope.WEBSOCKET_CONNECT
    ]
}


def get_scopes_for_role(role: str) -> List[APIKeyScope]:
    """Get default scopes for a role"""
    return SCOPE_GROUPS.get(role, SCOPE_GROUPS["read_only"])


# Rate limiting helpers
class RateLimitConfig(BaseModel):
    """Rate limiting configuration"""
    per_minute: Optional[int] = None
    per_hour: Optional[int] = None
    per_day: Optional[int] = None
    
    def is_within_limits(self, current_usage: dict) -> bool:
        """Check if current usage is within rate limits"""
        if self.per_minute and current_usage.get('per_minute', 0) >= self.per_minute:
            return False
        if self.per_hour and current_usage.get('per_hour', 0) >= self.per_hour:
            return False
        if self.per_day and current_usage.get('per_day', 0) >= self.per_day:
            return False
        return True
    
    def get_reset_times(self) -> dict:
        """Get reset times for each limit"""
        now = datetime.now(timezone.utc)
        return {
            'per_minute': now.replace(second=0, microsecond=0) + timedelta(minutes=1),
            'per_hour': now.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1),
            'per_day': now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
        }