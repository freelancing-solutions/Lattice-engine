"""
Data Models for Lattice MCP SDK

Pydantic models for API communication and data validation.
"""

from datetime import datetime
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field, validator
from enum import Enum


class UserRole(str, Enum):
    """User roles within an organization"""
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"


class UserStatus(str, Enum):
    """User account status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class OrganizationStatus(str, Enum):
    """Organization status"""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    TRIAL = "trial"


class ProjectStatus(str, Enum):
    """Project status"""
    ACTIVE = "active"
    ARCHIVED = "archived"
    DRAFT = "draft"


class MutationStatus(str, Enum):
    """Mutation execution status"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"


# User Models
class User(BaseModel):
    """User model"""
    id: str
    email: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    status: UserStatus = UserStatus.ACTIVE
    role: UserRole = UserRole.MEMBER
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None
    
    class Config:
        use_enum_values = True


# Organization Models
class Organization(BaseModel):
    """Organization model"""
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    status: OrganizationStatus = OrganizationStatus.ACTIVE
    created_at: datetime
    updated_at: datetime
    member_count: int = 0
    project_count: int = 0
    
    class Config:
        use_enum_values = True


# Project Models
class Project(BaseModel):
    """Project model"""
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    organization_id: str
    status: ProjectStatus = ProjectStatus.ACTIVE
    spec_content: Optional[str] = None
    spec_version: int = 1
    created_at: datetime
    updated_at: datetime
    created_by: str
    mutation_count: int = 0
    
    class Config:
        use_enum_values = True


# Mutation Models
class MutationRequest(BaseModel):
    """Request to propose a mutation"""
    project_id: str
    operation_type: str = Field(..., description="Type of mutation operation")
    changes: Dict[str, Any] = Field(..., description="Changes to apply")
    description: Optional[str] = Field(None, description="Human-readable description")
    auto_approve: bool = Field(False, description="Whether to auto-approve this mutation")
    
    @validator('operation_type')
    def validate_operation_type(cls, v):
        allowed_operations = [
            'create', 'update', 'delete', 'refactor', 
            'optimize', 'fix', 'enhance', 'migrate'
        ]
        if v not in allowed_operations:
            raise ValueError(f'Operation type must be one of: {allowed_operations}')
        return v


class Mutation(BaseModel):
    """Mutation model"""
    id: str
    project_id: str
    operation_type: str
    changes: Dict[str, Any]
    description: Optional[str] = None
    status: MutationStatus = MutationStatus.PENDING
    created_at: datetime
    updated_at: datetime
    created_by: str
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    executed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    execution_log: List[str] = Field(default_factory=list)
    
    class Config:
        use_enum_values = True


class MutationResponse(BaseModel):
    """Response from mutation proposal"""
    status: str
    mutation_id: str
    requires_approval: bool = True
    estimated_duration: Optional[int] = None  # seconds
    risk_level: str = "medium"  # low, medium, high
    affected_files: List[str] = Field(default_factory=list)
    preview_url: Optional[str] = None
    
    @validator('risk_level')
    def validate_risk_level(cls, v):
        if v not in ['low', 'medium', 'high']:
            raise ValueError('Risk level must be low, medium, or high')
        return v


# API Response Models
class APIResponse(BaseModel):
    """Base API response model"""
    success: bool = True
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ListResponse(APIResponse):
    """Response for list operations"""
    total: int
    page: int = 1
    per_page: int = 50
    has_more: bool = False


class ProjectListResponse(ListResponse):
    """Response for project list"""
    projects: List[Project]


class MutationListResponse(ListResponse):
    """Response for mutation list"""
    mutations: List[Mutation]


# WebSocket Models
class WebSocketMessage(BaseModel):
    """WebSocket message model"""
    type: str
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class MutationStatusUpdate(BaseModel):
    """Mutation status update via WebSocket"""
    mutation_id: str
    status: MutationStatus
    progress: Optional[int] = None  # 0-100
    message: Optional[str] = None
    log_entry: Optional[str] = None
    
    class Config:
        use_enum_values = True


# Configuration Models
class SDKConfig(BaseModel):
    """SDK configuration model"""
    base_url: str = "http://localhost:8000"
    api_key: Optional[str] = None
    timeout: int = 30
    max_retries: int = 3
    auto_retry: bool = True
    debug: bool = False
    
    @validator('base_url')
    def validate_base_url(cls, v):
        if not v.startswith(('http://', 'https://')):
            raise ValueError('Base URL must start with http:// or https://')
        return v.rstrip('/')


# Error Models
class ErrorDetail(BaseModel):
    """Error detail model"""
    code: str
    message: str
    field: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = False
    error: str
    details: List[ErrorDetail] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_id: Optional[str] = None