"""
Error model and related functionality.
"""

from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, DateTime, Float, JSON, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ENUM, UUID, VECTOR
from sqlalchemy import Index, func
from enum import Enum as PyEnum
from typing import Optional, List

from app.models.base import BaseModel


class ErrorSeverity(PyEnum):
    """Error severity levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ErrorStatus(PyEnum):
    """Error status."""
    DETECTED = "detected"
    ANALYZING = "analyzing"
    FIXING = "fixing"
    RESOLVED = "resolved"
    IGNORED = "ignored"
    FALSE_POSITIVE = "false_positive"


class ErrorCategory(PyEnum):
    """Error categories."""
    SYNTAX = "syntax"
    RUNTIME = "runtime"
    LOGIC = "logic"
    PERFORMANCE = "performance"
    SECURITY = "security"
    INTEGRATION = "integration"
    CONFIGURATION = "configuration"
    NETWORK = "network"
    DATABASE = "database"
    UI = "ui"
    OTHER = "other"


class Error(BaseModel):
    """Error model."""

    # Basic information
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    severity = Column(
        ENUM(ErrorSeverity, name="error_severity"),
        nullable=False,
        index=True
    )
    status = Column(
        ENUM(ErrorStatus, name="error_status"),
        default=ErrorStatus.DETECTED,
        nullable=False,
        index=True
    )
    category = Column(
        ENUM(ErrorCategory, name="error_category"),
        nullable=True,
        index=True
    )

    # Project ownership
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False, index=True)

    # Source information
    source = Column(String(100), nullable=False, index=True)  # sentry, github, manual, etc.
    source_id = Column(String(255), nullable=True, index=True)  # External ID
    source_type = Column(String(50), nullable=True)  # error, exception, warning, etc.
    source_url = Column(String(500), nullable=True)  # URL to error in source system

    # Error details
    stack_trace = Column(Text, nullable=True)
    error_type = Column(String(255), nullable=True)  # Exception type
    error_code = Column(String(100), nullable=True)  # HTTP status code, error code, etc.
    error_message = Column(Text, nullable=True)

    # Context and metadata
    context = Column(JSON, default={})
    metadata = Column(JSON, default={})
    tags = Column(ARRAY(String), default=[])

    # Location information
    file_path = Column(String(1000), nullable=True)
    line_number = Column(Integer, nullable=True)
    column_number = Column(Integer, nullable=True)
    function_name = Column(String(255), nullable=True)
    class_name = Column(String(255), nullable=True)
    module_name = Column(String(255), nullable=True)

    # Environment information
    environment = Column(String(50), nullable=True, index=True)  # production, staging, development
    version = Column(String(100), nullable=True)  # Application version
    release = Column(String(100), nullable=True)  # Release identifier
    build_number = Column(String(100), nullable=True)

    # User information
    user_id = Column(String(255), nullable=True)  # Affected user ID
    user_agent = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)  # IPv6 compatible
    session_id = Column(String(255), nullable=True)
    request_id = Column(String(255), nullable=True)
    url = Column(String(2000), nullable=True)

    # Assignment and ownership
    assigned_to_id = Column(Integer, ForeignKey("user.id"), nullable=True, index=True)
    assigned_team_id = Column(Integer, nullable=True)  # Team ID if team assignment is used

    # Resolution tracking
    resolved_at = Column(DateTime(timezone=True), nullable=True, index=True)
    resolved_by_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    resolution_method = Column(String(50), nullable=True)  # automatic, manual, ignored
    resolution_notes = Column(Text, nullable=True)
    false_positive_reason = Column(Text, nullable=True)

    # AI analysis
    ai_analysis = Column(JSON, nullable=True)
    ai_confidence = Column(Integer, nullable=True)  # 0-100
    ai_model_version = Column(String(50), nullable=True)
    ai_suggestions = Column(JSON, default=[])
    ai_processed_at = Column(DateTime(timezone=True), nullable=True)

    # Impact metrics
    affected_users = Column(Integer, default=0, nullable=False)
    occurrence_count = Column(Integer, default=1, nullable=False)
    first_seen_at = Column(DateTime(timezone=True), nullable=False, index=True)
    last_seen_at = Column(DateTime(timezone=True), nullable=False, index=True)
    peak_occurrence_time = Column(DateTime(timezone=True), nullable=True)

    # Performance impact
    response_time_ms = Column(Integer, nullable=True)
    memory_usage_mb = Column(Float, nullable=True)
    cpu_usage_percent = Column(Float, nullable=True)

    # Business impact
    revenue_impact = Column(Float, nullable=True)  # Estimated revenue impact
    user_impact_score = Column(Float, nullable=True)  # 0-1 scale
    business_impact_level = Column(String(20), nullable=True)  # low, medium, high, critical

    # Vector embedding for similarity search
    embedding = Column(VECTOR(1536), nullable=True)

    # Similarity and grouping
    similar_errors = Column(JSON, default=[])  # IDs of similar errors
    error_group_id = Column(Integer, nullable=True)  # Group ID for similar errors
    is_duplicate = Column(Boolean, default=False, nullable=False)
    parent_error_id = Column(Integer, ForeignKey("error.id"), nullable=True)

    # Relationships
    project = relationship("Project", back_populates="errors")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id], back_populates="assigned_errors")
    resolved_by = relationship("User", foreign_keys=[resolved_by_id])
    fixes = relationship("Fix", back_populates="error", cascade="all, delete-orphan")
    occurrences = relationship("ErrorOccurrence", back_populates="error", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="error", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Error(id={self.id}, title={self.title}, severity={self.severity.value})>"

    @property
    def is_critical(self) -> bool:
        """Check if error is critical."""
        return self.severity == ErrorSeverity.CRITICAL

    @property
    def is_resolved(self) -> bool:
        """Check if error is resolved."""
        return self.status == ErrorStatus.RESOLVED

    @property
    def is_open(self) -> bool:
        """Check if error is open (not resolved or ignored)."""
        return self.status not in [ErrorStatus.RESOLVED, ErrorStatus.IGNORED, ErrorStatus.FALSE_POSITIVE]

    @property
    def duration_open(self) -> Optional[int]:
        """Get duration error has been open in hours."""
        if not self.first_seen_at:
            return None

        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        end_time = self.resolved_at or now
        return int((end_time - self.first_seen_at).total_seconds() / 3600)

    @property
    def occurrence_frequency(self) -> float:
        """Calculate occurrence frequency per day."""
        if not self.first_seen_at or not self.last_seen_at:
            return 0.0

        days = (self.last_seen_at - self.first_seen_at).days or 1
        return self.occurrence_count / days

    def get_context_value(self, key: str, default=None):
        """Get value from context."""
        return self.context.get(key, default) if self.context else default

    def get_metadata_value(self, key: str, default=None):
        """Get value from metadata."""
        return self.metadata.get(key, default) if self.metadata else default

    def add_tag(self, tag: str):
        """Add tag to error."""
        if not self.tags:
            self.tags = []
        if tag not in self.tags:
            self.tags.append(tag)

    def remove_tag(self, tag: str):
        """Remove tag from error."""
        if self.tags and tag in self.tags:
            self.tags.remove(tag)

    def update_occurrence(self):
        """Update occurrence count and timestamp."""
        from datetime import datetime, timezone
        self.occurrence_count += 1
        self.last_seen_at = datetime.now(timezone.utc)

        # Update peak occurrence time if this is the highest frequency
        if self.occurrence_frequency > self.get_metadata_value('peak_frequency', 0):
            self.set_metadata_value('peak_frequency', self.occurrence_frequency)
            self.peak_occurrence_time = self.last_seen_at

    def assign_to_user(self, user_id: int):
        """Assign error to user."""
        self.assigned_to_id = user_id

    def resolve(self, resolved_by_id: int, resolution_method: str = "manual", notes: str = None):
        """Mark error as resolved."""
        from datetime import datetime, timezone
        self.status = ErrorStatus.RESOLVED
        self.resolved_at = datetime.now(timezone.utc)
        self.resolved_by_id = resolved_by_id
        self.resolution_method = resolution_method
        if notes:
            self.resolution_notes = notes

    def ignore(self, reason: str = None):
        """Mark error as ignored."""
        self.status = ErrorStatus.IGNORED
        if reason:
            self.false_positive_reason = reason

    def mark_false_positive(self, reason: str):
        """Mark error as false positive."""
        self.status = ErrorStatus.FALSE_POSITIVE
        self.false_positive_reason = reason

    def calculate_priority_score(self) -> float:
        """Calculate priority score based on various factors."""
        # Base score from severity
        severity_scores = {
            ErrorSeverity.LOW: 1.0,
            ErrorSeverity.MEDIUM: 2.0,
            ErrorSeverity.HIGH: 3.0,
            ErrorSeverity.CRITICAL: 4.0,
        }
        base_score = severity_scores.get(self.severity, 1.0)

        # Multiply by occurrence frequency (capped at 10)
        frequency_multiplier = min(self.occurrence_frequency, 10.0)

        # Multiply by affected users (capped at 100)
        user_multiplier = min(self.affected_users, 100.0) / 10.0

        # Business impact multiplier
        business_impact_scores = {
            'low': 1.0,
            'medium': 1.5,
            'high': 2.0,
            'critical': 3.0,
        }
        business_multiplier = business_impact_scores.get(self.business_impact_level, 1.0)

        return base_score * frequency_multiplier * user_multiplier * business_multiplier

    def to_dict_with_metrics(self):
        """Convert to dictionary with calculated metrics."""
        data = self.to_dict()
        data.update({
            "is_critical": self.is_critical,
            "is_resolved": self.is_resolved,
            "is_open": self.is_open,
            "duration_open": self.duration_open,
            "occurrence_frequency": self.occurrence_frequency,
            "priority_score": self.calculate_priority_score(),
        })
        return data


class ErrorOccurrence(BaseModel):
    """Individual error occurrence for time-series tracking."""

    error_id = Column(Integer, ForeignKey("error.id"), nullable=False, index=True)

    # Occurrence details
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    environment = Column(String(50), nullable=True, index=True)
    version = Column(String(100), nullable=True)
    release = Column(String(100), nullable=True)

    # Request information
    request_id = Column(String(255), nullable=True)
    session_id = Column(String(255), nullable=True)
    url = Column(String(2000), nullable=True)
    method = Column(String(10), nullable=True)
    status_code = Column(Integer, nullable=True)

    # User information
    user_id = Column(String(255), nullable=True, index=True)
    user_agent = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)

    # Performance metrics
    duration_ms = Column(Integer, nullable=True)
    memory_usage_mb = Column(Float, nullable=True)
    cpu_usage_percent = Column(Float, nullable=True)

    # Additional context
    context = Column(JSON, default={})
    metadata = Column(JSON, default={})

    # Partition key for time-based partitioning
    partition_date = Column(Date, nullable=False, index=True)

    # Relationships
    error = relationship("Error", back_populates="occurrences")

    def __repr__(self):
        return f"<ErrorOccurrence(id={self.id}, error_id={self.error_id}, timestamp={self.timestamp})>"


# Indexes for performance optimization
Index('idx_errors_project_status', Error.project_id, Error.status)
Index('idx_errors_severity_status', Error.severity, Error.status)
Index('idx_errors_created_at', Error.created_at.desc())
Index('idx_errors_last_seen_at', Error.last_seen_at.desc())
Index('idx_errors_first_seen_at', Error.first_seen_at.desc())
Index('idx_errors_source_id', Error.source, Error.source_id)
Index('idx_errors_project_severity', Error.project_id, Error.severity)
Index('idx_errors_environment_status', Error.environment, Error.status)

# Full-text search index
Index('idx_errors_search', Error.title, Error.description, Error.error_message,
      postgresql_using='gin', postgresql_ops={
          'title': 'gin_trgm_ops',
          'description': 'gin_trgm_ops',
          'error_message': 'gin_trgm_ops'
      })

# Composite index for occurrence tracking
Index('idx_error_occurrences_error_timestamp', ErrorOccurrence.error_id, ErrorOccurrence.timestamp.desc())
Index('idx_error_occurrences_partition_date', ErrorOccurrence.partition_date, ErrorOccurrence.timestamp.desc())