"""
Refresh Token Models for Lattice Engine Authentication

This module defines the refresh token models for JWT token refresh functionality
with database persistence and security utilities.
"""

import hashlib
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple
from uuid import UUID, uuid4

from pydantic import BaseModel, Field
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship

from .user_models import Base, UserTable


# SQLAlchemy Models
class RefreshTokenTable(Base):
    """SQLAlchemy Refresh Token table model"""
    __tablename__ = "refresh_tokens"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    token_hash = Column(String(255), unique=True, nullable=False, index=True)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_used_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("UserTable", backref="refresh_tokens")


# Pydantic Models
class RefreshTokenCreate(BaseModel):
    """Refresh token creation model"""
    user_id: UUID
    organization_id: Optional[UUID] = None
    expires_at: datetime

    class Config:
        from_attributes = True


class RefreshToken(BaseModel):
    """Complete refresh token model"""
    id: UUID
    token_hash: str
    user_id: UUID
    organization_id: Optional[UUID] = None
    expires_at: datetime
    revoked: bool
    revoked_at: Optional[datetime] = None
    created_at: datetime
    last_used_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    def is_expired(self) -> bool:
        """Check if token is expired"""
        return datetime.now(timezone.utc) > self.expires_at

    def is_revoked(self) -> bool:
        """Check if token is revoked"""
        return self.revoked or (self.revoked_at is not None)

    def is_valid(self) -> bool:
        """Check if token is valid (not expired and not revoked)"""
        return not self.is_expired() and not self.is_revoked()


# Utility Functions
def generate_refresh_token() -> Tuple[str, str]:
    """
    Generate a cryptographically secure refresh token and its hash.

    Returns:
        Tuple of (token, token_hash)
    """
    # Generate 32-byte cryptographically secure random token
    token = secrets.token_urlsafe(32)
    token_hash = hash_refresh_token(token)
    return token, token_hash


def hash_refresh_token(token: str) -> str:
    """
    Hash a refresh token using SHA-256.

    Args:
        token: Plain refresh token

    Returns:
        SHA-256 hash of the token
    """
    return hashlib.sha256(token.encode()).hexdigest()


def verify_refresh_token(token: str, stored_hash: str) -> bool:
    """
    Verify a refresh token against its stored hash.

    Args:
        token: Plain refresh token to verify
        stored_hash: Stored hash to verify against

    Returns:
        True if token matches hash, False otherwise
    """
    return hash_refresh_token(token) == stored_hash


def create_refresh_token_expiry(days: int = 30) -> datetime:
    """
    Create a refresh token expiry datetime.

    Args:
        days: Number of days until expiry (default: 30)

    Returns:
        Expiry datetime in UTC
    """
    return datetime.now(timezone.utc) + timedelta(days=days)