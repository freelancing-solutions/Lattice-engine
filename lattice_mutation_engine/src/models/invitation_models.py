"""
Organization invitation models for Lattice Engine

This module defines SQLAlchemy models and Pydantic schemas for managing
organization member invitations with token-based acceptance flow.
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4
import secrets

from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship

from src.models.user_models import UserTable, OrganizationTable, UserRole
from src.core.database import Base


class InvitationStatus(str, Enum):
    """Invitation status enumeration"""
    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class OrganizationInvitationTable(Base):
    """SQLAlchemy model for organization invitations"""

    __tablename__ = "organization_invitations"

    # Primary key
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Foreign keys
    organization_id = Column(PG_UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    invited_by = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Invitation details
    email = Column(String(255), nullable=False, index=True)
    role = Column(SQLEnum(UserRole), nullable=False)
    token = Column(String(255), nullable=False, unique=True, index=True)
    status = Column(SQLEnum(InvitationStatus), nullable=False, default=InvitationStatus.PENDING)
    message = Column(Text, nullable=True)

    # Timestamps
    expires_at = Column(DateTime, nullable=False, default=lambda: datetime.utcnow() + timedelta(days=7))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    accepted_at = Column(DateTime, nullable=True)

    # Relationships
    organization = relationship("OrganizationTable", back_populates="invitations")
    inviter = relationship("UserTable", foreign_keys=[invited_by])

    def generate_invitation_token(self) -> str:
        """Generate a secure invitation token"""
        self.token = secrets.token_urlsafe(32)
        return self.token

    def is_expired(self) -> bool:
        """Check if invitation has expired"""
        return datetime.utcnow() > self.expires_at

    def can_be_accepted(self) -> bool:
        """Check if invitation can be accepted"""
        return (
            self.status == InvitationStatus.PENDING and
            not self.is_expired()
        )


# Pydantic models for API serialization
class InvitationBase(BaseModel):
    """Base invitation model"""
    email: EmailStr
    role: UserRole
    message: Optional[str] = None


class InvitationCreate(InvitationBase):
    """Model for creating invitations"""
    organization_id: UUID
    invited_by: UUID


class InvitationUpdate(BaseModel):
    """Model for updating invitations"""
    status: Optional[InvitationStatus] = None


class Invitation(InvitationBase):
    """Complete invitation model"""
    id: UUID
    organization_id: UUID
    invited_by: UUID
    token: str
    status: InvitationStatus
    expires_at: datetime
    created_at: datetime
    accepted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InvitationAccept(BaseModel):
    """Model for accepting invitations"""
    token: str


# Update OrganizationTable to include invitations relationship
# This is handled in user_models.py by adding the back_populates relationship