"""
Project model and related functionality.
"""

from sqlalchemy import Column, String, Boolean, Text, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ENUM
from enum import Enum as PyEnum

from app.models.base import BaseModel


class ProjectStatus(PyEnum):
    """Project status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    DELETED = "deleted"


class Project(BaseModel):
    """Project model."""

    # Basic information
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Organization ownership
    organization_id = Column(Integer, ForeignKey("organization.id"), nullable=False, index=True)

    # Repository information
    repository_url = Column(String(500), nullable=True)
    repository_provider = Column(String(50), nullable=True)  # github, gitlab, bitbucket
    repository_owner = Column(String(255), nullable=True)
    repository_name = Column(String(255), nullable=True)
    default_branch = Column(String(100), default="main", nullable=False)

    # Technology stack
    language = Column(String(100), nullable=True, index=True)
    framework = Column(String(100), nullable=True, index=True)
    platform = Column(String(100), nullable=True, index=True)  # web, mobile, desktop, api
    runtime = Column(String(100), nullable=True)  # node, python, java, etc.

    # Project configuration
    settings = Column(JSON, default={})
    metadata = Column(JSON, default={})
    environment_variables = Column(JSON, default={})  # Encrypted in production

    # Status and visibility
    status = Column(
        ENUM(ProjectStatus, name="project_status"),
        default=ProjectStatus.ACTIVE,
        nullable=False,
        index=True
    )
    is_public = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Team and collaboration
    lead_developer_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    team_members = Column(JSON, default=[])  # Array of user IDs and roles

    # Build and deployment
    build_command = Column(Text, nullable=True)
    test_command = Column(Text, nullable=True)
    deploy_command = Column(Text, nullable=True)
    ci_cd_config = Column(JSON, default={})

    # Monitoring and error tracking
    error_tracking_enabled = Column(Boolean, default=True, nullable=False)
    error_tracking_config = Column(JSON, default={})
    monitoring_enabled = Column(Boolean, default=False, nullable=False)
    monitoring_config = Column(JSON, default={})

    # Integration settings
    integrations = Column(JSON, default={})  # Connected services and their config
    webhooks = Column(JSON, default=[])  # Webhook configurations

    # Analytics and metrics
    last_error_at = Column(DateTime(timezone=True), nullable=True)
    total_errors = Column(Integer, default=0, nullable=False)
    total_fixes = Column(Integer, default=0, nullable=False)
    last_fix_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    organization = relationship("Organization", back_populates="projects")
    lead_developer = relationship("User", foreign_keys=[lead_developer_id])
    errors = relationship("Error", back_populates="project", cascade="all, delete-orphan")
    fixes = relationship("Fix", back_populates="project", cascade="all, delete-orphan")
    integrations_list = relationship("Integration", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project(id={self.id}, name={self.name}, org_id={self.organization_id})>"

    @property
    def is_active_project(self) -> bool:
        """Check if project is active."""
        return self.status == ProjectStatus.ACTIVE and self.is_active

    @property
    def has_repository(self) -> bool:
        """Check if project has repository configured."""
        return bool(self.repository_url and self.repository_provider)

    @property
    def repository_full_name(self) -> str:
        """Get full repository name."""
        if self.repository_owner and self.repository_name:
            return f"{self.repository_owner}/{self.repository_name}"
        return None

    def get_setting(self, key: str, default=None):
        """Get project setting."""
        return self.settings.get(key, default)

    def set_setting(self, key: str, value):
        """Set project setting."""
        self.settings[key] = value

    def get_integration_config(self, integration_name: str, default=None):
        """Get integration configuration."""
        return self.integrations.get(integration_name, default)

    def set_integration_config(self, integration_name: str, config: dict):
        """Set integration configuration."""
        self.integrations[integration_name] = config

    def add_team_member(self, user_id: int, role: str = "developer"):
        """Add team member to project."""
        if not self.team_members:
            self.team_members = []

        # Remove existing entry for user if exists
        self.team_members = [
            member for member in self.team_members
            if member.get("user_id") != user_id
        ]

        # Add new member
        self.team_members.append({
            "user_id": user_id,
            "role": role,
            "added_at": datetime.utcnow().isoformat()
        })

    def remove_team_member(self, user_id: int):
        """Remove team member from project."""
        if self.team_members:
            self.team_members = [
                member for member in self.team_members
                if member.get("user_id") != user_id
            ]

    def get_team_member_role(self, user_id: int) -> str:
        """Get role of team member."""
        if not self.team_members:
            return None

        for member in self.team_members:
            if member.get("user_id") == user_id:
                return member.get("role")
        return None

    def is_team_member(self, user_id: int) -> bool:
        """Check if user is team member."""
        return self.get_team_member_role(user_id) is not None

    def can_user_access(self, user_id: int, required_role: str = "developer") -> bool:
        """Check if user can access project with required role."""
        user_role = self.get_team_member_role(user_id)
        if not user_role:
            return False

        # Define role hierarchy
        role_hierarchy = {
            "viewer": 1,
            "developer": 2,
            "maintainer": 3,
            "owner": 4
        }

        user_level = role_hierarchy.get(user_role, 0)
        required_level = role_hierarchy.get(required_role, 0)

        return user_level >= required_level

    def update_error_metrics(self):
        """Update error metrics."""
        from datetime import datetime, timezone
        self.last_error_at = datetime.now(timezone.utc)
        self.total_errors += 1

    def update_fix_metrics(self):
        """Update fix metrics."""
        from datetime import datetime, timezone
        self.last_fix_at = datetime.now(timezone.utc)
        self.total_fixes += 1

    def get_error_rate(self) -> float:
        """Calculate error rate (errors per day)."""
        if not self.created_at:
            return 0.0

        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        days_active = (now - self.created_at).days or 1

        return self.total_errors / days_active

    def get_fix_success_rate(self) -> float:
        """Calculate fix success rate."""
        if self.total_errors == 0:
            return 0.0
        return (self.total_fixes / self.total_errors) * 100

    def to_dict_with_metrics(self):
        """Convert to dictionary with calculated metrics."""
        data = self.to_dict()
        data.update({
            "error_rate": self.get_error_rate(),
            "fix_success_rate": self.get_fix_success_rate(),
            "is_active_project": self.is_active_project,
            "has_repository": self.has_repository,
            "repository_full_name": self.repository_full_name,
        })
        return data


class ProjectEnvironment(BaseModel):
    """Project environment model for different deployment environments."""

    project_id = Column(Integer, ForeignKey("project.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)  # development, staging, production
    description = Column(Text, nullable=True)

    # Environment configuration
    variables = Column(JSON, default={})  # Environment variables (encrypted)
    config = Column(JSON, default={})  # Environment-specific configuration

    # Deployment settings
    auto_deploy = Column(Boolean, default=False, nullable=False)
    deployment_url = Column(String(500), nullable=True)
    health_check_url = Column(String(500), nullable=True)

    # Monitoring
    error_tracking_enabled = Column(Boolean, default=True, nullable=False)
    monitoring_enabled = Column(Boolean, default=False, nullable=False)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    last_deployed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    project = relationship("Project", backref="environments")

    def __repr__(self):
        return f"<ProjectEnvironment(id={self.id}, project_id={self.project_id}, name={self.name})>"