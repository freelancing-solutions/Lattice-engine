"""
User and Organization Models for Lattice Engine Multi-Tenancy

This module defines the core user and organization models for the Lattice Engine
SaaS platform, providing multi-tenancy support with PostgreSQL ORM integration.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, EmailStr, validator
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class UserRole(str, Enum):
    """User roles within an organization"""
    OWNER = "owner"
    ADMIN = "admin"
    DEVELOPER = "developer"
    VIEWER = "viewer"


class OrganizationPlan(str, Enum):
    """Organization subscription plans"""
    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class UserStatus(str, Enum):
    """User account status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"


class OrganizationStatus(str, Enum):
    """Organization status"""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    TRIAL = "trial"
    CANCELLED = "cancelled"


# SQLAlchemy Models
class UserTable(Base):
    """SQLAlchemy User table model"""
    __tablename__ = "users"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default=UserStatus.PENDING_VERIFICATION.value)
    email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    organization_memberships = relationship("OrganizationMemberTable", back_populates="user")
    owned_organizations = relationship("OrganizationTable", back_populates="owner")


class OrganizationTable(Base):
    """SQLAlchemy Organization table model"""
    __tablename__ = "organizations"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    owner_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    plan = Column(String(50), nullable=False, default=OrganizationPlan.FREE.value)
    status = Column(String(50), nullable=False, default=OrganizationStatus.ACTIVE.value)
    max_projects = Column(Integer, default=3)  # Based on plan
    max_members = Column(Integer, default=5)   # Based on plan
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    owner = relationship("UserTable", back_populates="owned_organizations")
    members = relationship("OrganizationMemberTable", back_populates="organization")
    projects = relationship("ProjectTable", back_populates="organization")
    api_keys = relationship("APIKeyTable", back_populates="organization")
    subscriptions = relationship("SubscriptionTable", back_populates="organization")


class OrganizationMemberTable(Base):
    """SQLAlchemy Organization Member table model"""
    __tablename__ = "organization_members"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role = Column(String(50), nullable=False, default=UserRole.DEVELOPER.value)
    invited_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    invited_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    joined_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    organization = relationship("OrganizationTable", back_populates="members")
    user = relationship("UserTable", back_populates="organization_memberships")


# Pydantic Models
class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)
    
    @validator('full_name')
    def validate_full_name(cls, v):
        if not v.strip():
            raise ValueError('Full name cannot be empty')
        return v.strip()


class UserCreate(UserBase):
    """User creation model"""
    password: str = Field(..., min_length=8, max_length=128)
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UserUpdate(BaseModel):
    """User update model"""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    status: Optional[UserStatus] = None


class User(UserBase):
    """Complete user model"""
    id: UUID
    status: UserStatus
    email_verified: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        
    def is_active(self) -> bool:
        """Check if user is active"""
        return self.status == UserStatus.ACTIVE and self.email_verified
    
    def can_login(self) -> bool:
        """Check if user can login"""
        return self.status in [UserStatus.ACTIVE] and self.email_verified


class OrganizationBase(BaseModel):
    """Base organization model"""
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=3, max_length=100, regex=r'^[a-z0-9-]+$')
    description: Optional[str] = Field(None, max_length=1000)
    
    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Organization name cannot be empty')
        return v.strip()
    
    @validator('slug')
    def validate_slug(cls, v):
        if not v.strip():
            raise ValueError('Organization slug cannot be empty')
        return v.strip().lower()


class OrganizationCreate(OrganizationBase):
    """Organization creation model"""
    pass


class OrganizationUpdate(BaseModel):
    """Organization update model"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[OrganizationStatus] = None


class Organization(OrganizationBase):
    """Complete organization model"""
    id: UUID
    owner_id: UUID
    plan: OrganizationPlan
    status: OrganizationStatus
    max_projects: int
    max_members: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
    
    def is_active(self) -> bool:
        """Check if organization is active"""
        return self.status in [OrganizationStatus.ACTIVE, OrganizationStatus.TRIAL]
    
    def can_add_project(self, current_project_count: int) -> bool:
        """Check if organization can add more projects"""
        return self.is_active() and current_project_count < self.max_projects
    
    def can_add_member(self, current_member_count: int) -> bool:
        """Check if organization can add more members"""
        return self.is_active() and current_member_count < self.max_members
    
    def get_plan_limits(self) -> dict:
        """Get plan-specific limits"""
        limits = {
            OrganizationPlan.FREE: {"projects": 3, "members": 5, "api_calls": 1000},
            OrganizationPlan.STARTER: {"projects": 10, "members": 15, "api_calls": 10000},
            OrganizationPlan.PROFESSIONAL: {"projects": 50, "members": 50, "api_calls": 100000},
            OrganizationPlan.ENTERPRISE: {"projects": -1, "members": -1, "api_calls": -1}  # Unlimited
        }
        return limits.get(self.plan, limits[OrganizationPlan.FREE])


class OrganizationMemberBase(BaseModel):
    """Base organization member model"""
    role: UserRole = UserRole.DEVELOPER


class OrganizationMemberCreate(OrganizationMemberBase):
    """Organization member creation model"""
    user_id: UUID
    organization_id: UUID


class OrganizationMemberUpdate(BaseModel):
    """Organization member update model"""
    role: Optional[UserRole] = None


class OrganizationMember(OrganizationMemberBase):
    """Complete organization member model"""
    id: UUID
    organization_id: UUID
    user_id: UUID
    invited_by: Optional[UUID] = None
    invited_at: datetime
    joined_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
    
    def is_admin(self) -> bool:
        """Check if member has admin privileges"""
        return self.role in [UserRole.OWNER, UserRole.ADMIN]
    
    def can_manage_projects(self) -> bool:
        """Check if member can manage projects"""
        return self.role in [UserRole.OWNER, UserRole.ADMIN, UserRole.DEVELOPER]
    
    def can_manage_members(self) -> bool:
        """Check if member can manage other members"""
        return self.role in [UserRole.OWNER, UserRole.ADMIN]


class UserWithOrganizations(User):
    """User model with organization memberships"""
    organizations: List[Organization] = []
    
    class Config:
        from_attributes = True


class OrganizationWithMembers(Organization):
    """Organization model with member details"""
    members: List[OrganizationMember] = []
    owner: User
    
    class Config:
        from_attributes = True