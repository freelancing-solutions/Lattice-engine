"""
Project Models for Lattice Engine Multi-Tenancy

This module defines project models for the Lattice Engine SaaS platform,
providing organization-scoped projects for spec and mutation management.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, validator
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

from src.models.user_models import Base


class ProjectStatus(str, Enum):
    """Project status"""
    ACTIVE = "active"
    ARCHIVED = "archived"
    SUSPENDED = "suspended"


class SpecSyncStatus(str, Enum):
    """Spec synchronization status"""
    ENABLED = "enabled"
    DISABLED = "disabled"
    ERROR = "error"
    SYNCING = "syncing"


class MutationStatus(str, Enum):
    """Mutation status within a project"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    APPROVED = "approved"
    REJECTED = "rejected"


# SQLAlchemy Models
class ProjectTable(Base):
    """SQLAlchemy Project table model"""
    __tablename__ = "projects"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), nullable=False, index=True)  # Unique within organization
    description = Column(Text, nullable=True)
    
    # Organization scoping
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    created_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Project settings
    status = Column(String(20), nullable=False, default=ProjectStatus.ACTIVE.value)
    
    # Spec synchronization
    spec_sync_enabled = Column(Boolean, default=True)
    spec_sync_status = Column(String(20), default=SpecSyncStatus.ENABLED.value)
    spec_sync_directory = Column(String(500), nullable=True)  # Local directory path
    spec_sync_last_run = Column(DateTime(timezone=True), nullable=True)
    spec_sync_error = Column(Text, nullable=True)
    
    # Repository integration
    repository_url = Column(String(500), nullable=True)
    repository_branch = Column(String(100), default="main")
    repository_token_encrypted = Column(Text, nullable=True)  # Encrypted access token
    
    # Project configuration
    settings = Column(JSON, default=dict)
    
    # Statistics
    total_specs = Column(Integer, default=0)
    total_mutations = Column(Integer, default=0)
    last_mutation_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    archived_at = Column(DateTime(timezone=True), nullable=True)
    archived_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Relationships
    organization = relationship("OrganizationTable", back_populates="projects")
    creator = relationship("UserTable", foreign_keys=[created_by])
    archiver = relationship("UserTable", foreign_keys=[archived_by])
    specs = relationship("SpecTable", back_populates="project")
    mutations = relationship("ProjectMutationTable", back_populates="project")
    api_keys = relationship("APIKeyTable", back_populates="project")


class SpecTable(Base):
    """SQLAlchemy Spec table model"""
    __tablename__ = "specs"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    file_path = Column(String(1000), nullable=False)  # Relative path within project
    
    # Project scoping
    project_id = Column(PGUUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    
    # Spec content
    content = Column(Text, nullable=False)
    content_hash = Column(String(64), nullable=False, index=True)  # SHA-256 hash
    
    # File metadata
    file_size = Column(Integer, nullable=False)
    file_modified_at = Column(DateTime(timezone=True), nullable=False)
    
    # Sync metadata
    last_synced_at = Column(DateTime(timezone=True), nullable=False)
    sync_source = Column(String(50), default="file_system")  # file_system, git, manual
    
    # Validation
    is_valid = Column(Boolean, default=True)
    validation_errors = Column(JSON, default=list)
    last_validated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    metadata = Column(JSON, default=dict)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    project = relationship("ProjectTable", back_populates="specs")
    mutations = relationship("ProjectMutationTable", back_populates="target_spec")


class ProjectMutationTable(Base):
    """SQLAlchemy Project Mutation table model"""
    __tablename__ = "project_mutations"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Project scoping
    project_id = Column(PGUUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    target_spec_id = Column(PGUUID(as_uuid=True), ForeignKey("specs.id"), nullable=True)
    
    # Mutation request details
    mutation_type = Column(String(50), nullable=False)  # create, update, delete, refactor
    description = Column(Text, nullable=False)
    requested_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Status and workflow
    status = Column(String(20), nullable=False, default=MutationStatus.PENDING.value)
    priority = Column(String(10), default="medium")  # low, medium, high, urgent
    
    # Mutation data
    mutation_data = Column(JSON, nullable=False)  # The actual mutation request
    proposed_changes = Column(JSON, default=dict)  # Proposed changes from agents
    
    # Approval workflow
    requires_approval = Column(Boolean, default=True)
    approved_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Execution
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    execution_log = Column(JSON, default=list)
    error_message = Column(Text, nullable=True)
    
    # Results
    result_data = Column(JSON, default=dict)
    files_changed = Column(JSON, default=list)  # List of files that were modified
    
    # Metadata
    metadata = Column(JSON, default=dict)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    project = relationship("ProjectTable", back_populates="mutations")
    target_spec = relationship("SpecTable", back_populates="mutations")
    requester = relationship("UserTable", foreign_keys=[requested_by])
    approver = relationship("UserTable", foreign_keys=[approved_by])


# Pydantic Models
class ProjectBase(BaseModel):
    """Base project model"""
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=3, max_length=100, regex=r'^[a-z0-9-]+$')
    description: Optional[str] = Field(None, max_length=1000)
    spec_sync_enabled: bool = True
    spec_sync_directory: Optional[str] = Field(None, max_length=500)
    repository_url: Optional[str] = Field(None, max_length=500)
    repository_branch: str = Field(default="main", max_length=100)
    settings: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Project name cannot be empty')
        return v.strip()
    
    @validator('slug')
    def validate_slug(cls, v):
        if not v.strip():
            raise ValueError('Project slug cannot be empty')
        return v.strip().lower()


class ProjectCreate(ProjectBase):
    """Project creation model"""
    organization_id: UUID


class ProjectUpdate(BaseModel):
    """Project update model"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[ProjectStatus] = None
    spec_sync_enabled: Optional[bool] = None
    spec_sync_directory: Optional[str] = Field(None, max_length=500)
    repository_url: Optional[str] = Field(None, max_length=500)
    repository_branch: Optional[str] = Field(None, max_length=100)
    settings: Optional[Dict[str, Any]] = None


class Project(ProjectBase):
    """Complete project model"""
    id: UUID
    organization_id: UUID
    created_by: UUID
    status: ProjectStatus
    spec_sync_status: SpecSyncStatus
    spec_sync_last_run: Optional[datetime] = None
    spec_sync_error: Optional[str] = None
    total_specs: int
    total_mutations: int
    last_mutation_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    archived_at: Optional[datetime] = None
    archived_by: Optional[UUID] = None
    
    class Config:
        from_attributes = True
    
    def is_active(self) -> bool:
        """Check if project is active"""
        return self.status == ProjectStatus.ACTIVE
    
    def can_sync_specs(self) -> bool:
        """Check if project can sync specs"""
        return (
            self.is_active() and 
            self.spec_sync_enabled and 
            self.spec_sync_status != SpecSyncStatus.ERROR
        )
    
    def get_sync_health(self) -> str:
        """Get sync health status"""
        if not self.spec_sync_enabled:
            return "disabled"
        
        if self.spec_sync_status == SpecSyncStatus.ERROR:
            return "error"
        
        if not self.spec_sync_last_run:
            return "never_synced"
        
        # Check if last sync was more than 24 hours ago
        hours_since_sync = (datetime.now(timezone.utc) - self.spec_sync_last_run).total_seconds() / 3600
        if hours_since_sync > 24:
            return "stale"
        
        return "healthy"


class SpecBase(BaseModel):
    """Base spec model"""
    name: str = Field(..., min_length=1, max_length=255)
    file_path: str = Field(..., min_length=1, max_length=1000)
    content: str = Field(..., min_length=1)
    file_size: int = Field(..., ge=0)
    file_modified_at: datetime
    sync_source: str = Field(default="file_system", max_length=50)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Spec name cannot be empty')
        return v.strip()
    
    @validator('file_path')
    def validate_file_path(cls, v):
        if not v.strip():
            raise ValueError('File path cannot be empty')
        # Normalize path separators
        return v.strip().replace('\\', '/')


class SpecCreate(SpecBase):
    """Spec creation model"""
    project_id: UUID


class SpecUpdate(BaseModel):
    """Spec update model"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    file_size: Optional[int] = Field(None, ge=0)
    file_modified_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None


class Spec(SpecBase):
    """Complete spec model"""
    id: UUID
    project_id: UUID
    content_hash: str
    last_synced_at: datetime
    is_valid: bool
    validation_errors: List[str]
    last_validated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
    
    def needs_validation(self) -> bool:
        """Check if spec needs validation"""
        if not self.last_validated_at:
            return True
        
        # Re-validate if content was updated after last validation
        return self.updated_at > self.last_validated_at
    
    def is_recently_synced(self, hours: int = 1) -> bool:
        """Check if spec was recently synced"""
        if not self.last_synced_at:
            return False
        
        hours_since_sync = (datetime.now(timezone.utc) - self.last_synced_at).total_seconds() / 3600
        return hours_since_sync <= hours


class ProjectMutationBase(BaseModel):
    """Base project mutation model"""
    mutation_type: str = Field(..., min_length=1, max_length=50)
    description: str = Field(..., min_length=1, max_length=2000)
    mutation_data: Dict[str, Any] = Field(..., min_items=1)
    priority: str = Field(default="medium", regex=r'^(low|medium|high|urgent)$')
    requires_approval: bool = True
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('description')
    def validate_description(cls, v):
        if not v.strip():
            raise ValueError('Mutation description cannot be empty')
        return v.strip()


class ProjectMutationCreate(ProjectMutationBase):
    """Project mutation creation model"""
    project_id: UUID
    target_spec_id: Optional[UUID] = None


class ProjectMutationUpdate(BaseModel):
    """Project mutation update model"""
    status: Optional[MutationStatus] = None
    priority: Optional[str] = Field(None, regex=r'^(low|medium|high|urgent)$')
    proposed_changes: Optional[Dict[str, Any]] = None
    rejection_reason: Optional[str] = Field(None, max_length=1000)
    execution_log: Optional[List[Dict[str, Any]]] = None
    error_message: Optional[str] = Field(None, max_length=2000)
    result_data: Optional[Dict[str, Any]] = None
    files_changed: Optional[List[str]] = None


class ProjectMutation(ProjectMutationBase):
    """Complete project mutation model"""
    id: UUID
    project_id: UUID
    target_spec_id: Optional[UUID] = None
    requested_by: UUID
    status: MutationStatus
    proposed_changes: Dict[str, Any]
    approved_by: Optional[UUID] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    execution_log: List[Dict[str, Any]]
    error_message: Optional[str] = None
    result_data: Dict[str, Any]
    files_changed: List[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
    
    def is_pending_approval(self) -> bool:
        """Check if mutation is pending approval"""
        return (
            self.requires_approval and 
            self.status == MutationStatus.PENDING and 
            not self.approved_by
        )
    
    def can_be_executed(self) -> bool:
        """Check if mutation can be executed"""
        if self.requires_approval:
            return self.status == MutationStatus.APPROVED
        return self.status == MutationStatus.PENDING
    
    def is_completed(self) -> bool:
        """Check if mutation is completed"""
        return self.status in [MutationStatus.COMPLETED, MutationStatus.FAILED, MutationStatus.CANCELLED]
    
    def get_duration(self) -> Optional[int]:
        """Get mutation execution duration in seconds"""
        if not self.started_at or not self.completed_at:
            return None
        return int((self.completed_at - self.started_at).total_seconds())


class ProjectWithStats(Project):
    """Project model with additional statistics"""
    pending_mutations: int = 0
    failed_mutations: int = 0
    invalid_specs: int = 0
    sync_errors: int = 0
    
    class Config:
        from_attributes = True


class ProjectSummary(BaseModel):
    """Project summary for dashboard"""
    id: UUID
    name: str
    slug: str
    organization_id: UUID
    status: ProjectStatus
    total_specs: int
    total_mutations: int
    pending_mutations: int
    last_mutation_at: Optional[datetime] = None
    spec_sync_status: SpecSyncStatus
    created_at: datetime
    
    class Config:
        from_attributes = True


# Project settings schemas
class ProjectSettings(BaseModel):
    """Project settings configuration"""
    # Mutation settings
    auto_approve_safe_mutations: bool = False
    require_approval_for_deletions: bool = True
    max_concurrent_mutations: int = 3
    
    # Spec sync settings
    sync_interval_minutes: int = 60
    ignore_patterns: List[str] = Field(default_factory=lambda: ["*.tmp", "*.log", ".git/*"])
    include_patterns: List[str] = Field(default_factory=lambda: ["*.md", "*.json", "*.yaml", "*.yml"])
    
    # Validation settings
    validate_on_sync: bool = True
    validation_rules: List[str] = Field(default_factory=list)
    
    # Notification settings
    notify_on_mutation_complete: bool = True
    notify_on_sync_errors: bool = True
    notification_channels: List[str] = Field(default_factory=list)  # email, slack, webhook
    
    class Config:
        extra = "allow"  # Allow additional settings


# Utility functions
def generate_project_slug(name: str, organization_id: UUID) -> str:
    """Generate a unique project slug from name"""
    import re
    
    # Convert to lowercase and replace spaces/special chars with hyphens
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower().strip())
    slug = slug.strip('-')
    
    # Ensure minimum length
    if len(slug) < 3:
        slug = f"project-{slug}"
    
    # Truncate if too long
    if len(slug) > 100:
        slug = slug[:100].rstrip('-')
    
    return slug


def validate_spec_content(content: str, file_path: str) -> tuple[bool, List[str]]:
    """
    Validate spec content based on file type.
    
    Returns:
        tuple: (is_valid, list_of_errors)
    """
    errors = []
    
    try:
        # Basic validation - check if content is not empty
        if not content.strip():
            errors.append("Spec content cannot be empty")
            return False, errors
        
        # File type specific validation
        file_ext = file_path.lower().split('.')[-1] if '.' in file_path else ''
        
        if file_ext in ['json']:
            import json
            try:
                json.loads(content)
            except json.JSONDecodeError as e:
                errors.append(f"Invalid JSON: {str(e)}")
        
        elif file_ext in ['yaml', 'yml']:
            try:
                import yaml
                yaml.safe_load(content)
            except yaml.YAMLError as e:
                errors.append(f"Invalid YAML: {str(e)}")
        
        # Check for common issues
        if len(content) > 10 * 1024 * 1024:  # 10MB limit
            errors.append("Spec content exceeds maximum size limit (10MB)")
        
        return len(errors) == 0, errors
        
    except Exception as e:
        errors.append(f"Validation error: {str(e)}")
        return False, errors