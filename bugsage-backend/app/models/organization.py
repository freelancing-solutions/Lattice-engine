"""
Organization model and related functionality.
"""

from sqlalchemy import Column, String, Boolean, Text, Integer, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ENUM
from enum import Enum as PyEnum
from typing import List

from app.models.base import BaseModel


class OrganizationPlan(PyEnum):
    """Organization subscription plans."""
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class OrganizationStatus(PyEnum):
    """Organization status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    TRIAL = "trial"


# Association table for organization users
organization_users = Table(
    'user_organization',
    BaseModel.metadata,
    Column('id', Integer, primary_key=True),
    Column('organization_id', Integer, ForeignKey('organization.id'), nullable=False),
    Column('user_id', Integer, ForeignKey('user.id'), nullable=False),
    Column('role', String(50), default='member', nullable=False),
    Column('joined_at', DateTime(timezone=True), server_default='now()', nullable=False),
    Column('invited_by', Integer, ForeignKey('user.id'), nullable=True),
    Column('is_active', Boolean, default=True, nullable=False),
    # Add unique constraint
    schema=None
)


class Organization(BaseModel):
    """Organization model."""

    # Basic information
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    website = Column(String(500), nullable=True)

    # Visual branding
    logo_url = Column(String(500), nullable=True)
    primary_color = Column(String(7), default="#3b82f6")  # Hex color
    secondary_color = Column(String(7), default="#10b981")  # Hex color

    # Subscription and billing
    plan = Column(
        ENUM(OrganizationPlan, name="organization_plan"),
        default=OrganizationPlan.FREE,
        nullable=False,
        index=True
    )
    status = Column(
        ENUM(OrganizationStatus, name="organization_status"),
        default=OrganizationStatus.TRIAL,
        nullable=False,
        index=True
    )
    trial_ends_at = Column(DateTime(timezone=True), nullable=True)
    subscription_ends_at = Column(DateTime(timezone=True), nullable=True)

    # Limits and quotas
    max_users = Column(Integer, default=5, nullable=False)
    max_projects = Column(Integer, default=3, nullable=False)
    max_api_calls_per_month = Column(Integer, default=10000, nullable=False)

    # Settings and configuration
    settings = Column(Text, default="{}")  # JSON string
    metadata = Column(Text, default="{}")  # JSON string

    # Ownership and management
    owner_id = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)
    billing_contact_id = Column(Integer, ForeignKey("user.id"), nullable=True)

    # Relationships
    owner = relationship("User", foreign_keys=[owner_id], back_populates="owned_organizations")
    billing_contact = relationship("User", foreign_keys=[billing_contact_id])
    users = relationship(
        "User",
        secondary=organization_users,
        back_populates="organizations"
    )
    projects = relationship("Project", back_populates="organization", cascade="all, delete-orphan")
    integrations = relationship("Integration", back_populates="organization", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="organization", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Organization(id={self.id}, name={self.name}, plan={self.plan.value})>"

    @property
    def is_enterprise(self) -> bool:
        """Check if organization has enterprise plan."""
        return self.plan == OrganizationPlan.ENTERPRISE

    @property
    def is_pro(self) -> bool:
        """Check if organization has pro plan or higher."""
        return self.plan in [OrganizationPlan.PRO, OrganizationPlan.ENTERPRISE]

    @property
    def is_trial(self) -> bool:
        """Check if organization is in trial period."""
        return self.status == OrganizationStatus.TRIAL

    @property
    def trial_days_remaining(self) -> int:
        """Get remaining trial days."""
        if not self.trial_ends_at:
            return 0
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        if now > self.trial_ends_at:
            return 0
        return (self.trial_ends_at - now).days

    def get_setting(self, key: str, default=None):
        """Get organization setting."""
        import json
        try:
            settings = json.loads(self.settings or "{}")
            return settings.get(key, default)
        except (json.JSONDecodeError, TypeError):
            return default

    def set_setting(self, key: str, value):
        """Set organization setting."""
        import json
        try:
            settings = json.loads(self.settings or "{}")
            settings[key] = value
            self.settings = json.dumps(settings)
        except (json.JSONDecodeError, TypeError):
            self.settings = json.dumps({key: value})

    def can_add_user(self) -> bool:
        """Check if organization can add more users."""
        from app.models.user import User
        current_user_count = len([u for u in self.users if u.is_active])
        return current_user_count < self.max_users

    def can_add_project(self) -> bool:
        """Check if organization can add more projects."""
        current_project_count = len([p for p in self.projects if p.is_active])
        return current_project_count < self.max_projects

    def upgrade_plan(self, new_plan: OrganizationPlan):
        """Upgrade organization plan."""
        self.plan = new_plan

        # Update limits based on plan
        if new_plan == OrganizationPlan.PRO:
            self.max_users = 50
            self.max_projects = 20
            self.max_api_calls_per_month = 100000
        elif new_plan == OrganizationPlan.ENTERPRISE:
            self.max_users = 1000
            self.max_projects = 1000
            self.max_api_calls_per_month = 10000000

    def add_user(self, user, role: str = "member"):
        """Add user to organization."""
        if user not in self.users:
            self.users.append(user)
            # Note: In a real implementation, you'd create a UserOrganization record
            return True
        return False

    def remove_user(self, user):
        """Remove user from organization."""
        if user in self.users:
            self.users.remove(user)
            return True
        return False


class OrganizationInvitation(BaseModel):
    """Organization invitation model."""

    organization_id = Column(Integer, ForeignKey("organization.id"), nullable=False, index=True)
    invited_by_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    role = Column(String(50), default="member", nullable=False)
    token = Column(String(255), unique=True, nullable=False, index=True)
    status = Column(String(20), default="pending", nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    message = Column(Text, nullable=True)

    # Relationships
    organization = relationship("Organization", backref="invitations")
    invited_by = relationship("User", foreign_keys=[invited_by_id])

    def __repr__(self):
        return f"<OrganizationInvitation(id={self.id}, email={self.email}, status={self.status})>"