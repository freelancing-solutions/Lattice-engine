"""
User model and related functionality.
"""

from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ENUM
from enum import Enum as PyEnum
from typing import Optional

from app.models.base import BaseModel


class UserRole(PyEnum):
    """User roles."""
    ADMIN = "admin"
    DEVELOPER = "developer"
    USER = "user"
    VIEWER = "viewer"


class UserStatus(PyEnum):
    """User status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class User(BaseModel):
    """User model."""

    # Basic information
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    password_hash = Column(String(255), nullable=False)

    # User roles and status
    role = Column(
        ENUM(UserRole, name="user_role"),
        default=UserRole.USER,
        nullable=False,
        index=True
    )
    status = Column(
        ENUM(UserStatus, name="user_status"),
        default=UserStatus.ACTIVE,
        nullable=False,
        index=True
    )

    # Profile information
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    timezone = Column(String(50), default="UTC")
    language = Column(String(10), default="en")

    # Preferences and settings
    preferences = Column(Text, default="{}")  # JSON string
    notification_settings = Column(Text, default="{}")  # JSON string

    # Authentication
    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)

    # Organization membership
    current_organization_id = Column(Integer, ForeignKey("organization.id"), nullable=True)
    current_organization = relationship("Organization", foreign_keys=[current_organization_id])

    # Relationships
    owned_organizations = relationship("Organization", back_populates="owner", foreign_keys="Organization.owner_id")
    user_organizations = relationship("UserOrganization", back_populates="user", cascade="all, delete-orphan")
    organizations = relationship("Organization", secondary="user_organization", back_populates="users")
    assigned_errors = relationship("Error", back_populates="assigned_to")
    applied_fixes = relationship("Fix", foreign_keys="Fix.applied_by_id", back_populates="applied_by")
    reviewed_fixes = relationship("Fix", foreign_keys="Fix.reviewed_by_id", back_populates="reviewed_by")
    notifications = relationship("Notification", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role.value})>"

    @property
    def is_admin(self) -> bool:
        """Check if user is admin."""
        return self.role == UserRole.ADMIN

    @property
    def is_developer(self) -> bool:
        """Check if user is developer or higher."""
        return self.role in [UserRole.ADMIN, UserRole.DEVELOPER]

    def has_permission(self, permission: str) -> bool:
        """Check if user has specific permission."""
        permission_map = {
            "read_all": [UserRole.ADMIN, UserRole.DEVELOPER],
            "write_all": [UserRole.ADMIN],
            "manage_users": [UserRole.ADMIN],
            "manage_organizations": [UserRole.ADMIN],
            "approve_fixes": [UserRole.ADMIN, UserRole.DEVELOPER],
            "assign_errors": [UserRole.ADMIN, UserRole.DEVELOPER],
            "view_analytics": [UserRole.ADMIN, UserRole.DEVELOPER],
        }
        return self.role in permission_map.get(permission, [])

    def get_preference(self, key: str, default=None):
        """Get user preference."""
        import json
        try:
            preferences = json.loads(self.preferences or "{}")
            return preferences.get(key, default)
        except (json.JSONDecodeError, TypeError):
            return default

    def set_preference(self, key: str, value):
        """Set user preference."""
        import json
        try:
            preferences = json.loads(self.preferences or "{}")
            preferences[key] = value
            self.preferences = json.dumps(preferences)
        except (json.JSONDecodeError, TypeError):
            self.preferences = json.dumps({key: value})

    def get_notification_setting(self, key: str, default=None):
        """Get notification setting."""
        import json
        try:
            settings = json.loads(self.notification_settings or "{}")
            return settings.get(key, default)
        except (json.JSONDecodeError, TypeError):
            return default

    def set_notification_setting(self, key: str, value):
        """Set notification setting."""
        import json
        try:
            settings = json.loads(self.notification_settings or "{}")
            settings[key] = value
            self.notification_settings = json.dumps(settings)
        except (json.JSONDecodeError, TypeError):
            self.notification_settings = json.dumps({key: value})


class UserSession(BaseModel):
    """User session model for authentication."""

    user_id = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)
    token = Column(String(255), unique=True, nullable=False, index=True)
    refresh_token = Column(String(255), unique=True, nullable=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    device_info = Column(Text, nullable=True)  # JSON string
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", backref="sessions")

    def __repr__(self):
        return f"<UserSession(id={self.id}, user_id={self.user_id}, expires_at={self.expires_at})>"


class APIKey(BaseModel):
    """API key model for programmatic access."""

    user_id = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    key_hash = Column(String(255), unique=True, nullable=False, index=True)
    key_prefix = Column(String(10), nullable=False)  # First few characters for display
    scopes = Column(Text, default="[]")  # JSON array of scopes
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    usage_count = Column(Integer, default=0, nullable=False)

    # Relationships
    user = relationship("User", backref="api_keys")

    def __repr__(self):
        return f"<APIKey(id={self.id}, user_id={self.user_id}, name={self.name})>"