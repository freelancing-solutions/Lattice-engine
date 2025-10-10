"""
Fix model and related functionality.
"""

from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, DateTime, Float, JSON, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ENUM, UUID
from sqlalchemy import Index
from enum import Enum as PyEnum
from typing import Optional, List

from app.models.base import BaseModel


class FixType(PyEnum):
    """Fix types."""
    AUTOMATIC = "automatic"
    MANUAL = "manual"
    SUGGESTED = "suggested"
    HYBRID = "hybrid"


class FixStatus(PyEnum):
    """Fix status."""
    PENDING = "pending"
    ANALYZING = "analyzing"
    GENERATING = "generating"
    TESTING = "testing"
    READY = "ready"
    APPROVED = "approved"
    REJECTED = "rejected"
    APPLIED = "applied"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"
    CANCELLED = "cancelled"


class FixRiskLevel(PyEnum):
    """Fix risk levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Fix(BaseModel):
    """Fix model."""

    # Basic information
    error_id = Column(Integer, ForeignKey("error.id"), nullable=False, index=True)
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)

    # Project ownership
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False, index=True)

    # Fix classification
    fix_type = Column(
        ENUM(FixType, name="fix_type"),
        default=FixType.AUTOMATIC,
        nullable=False,
        index=True
    )
    status = Column(
        ENUM(FixStatus, name="fix_status"),
        default=FixStatus.PENDING,
        nullable=False,
        index=True
    )
    risk_level = Column(
        ENUM(FixRiskLevel, name="fix_risk_level"),
        default=FixRiskLevel.MEDIUM,
        nullable=False,
        index=True
    )

    # Generated content
    generated_code = Column(Text, nullable=True)
    code_diff = Column(Text, nullable=True)
    file_paths = Column(ARRAY(String), default=[])
    files_modified = Column(JSON, default=[])

    # AI confidence and quality metrics
    confidence_score = Column(Float, nullable=True)  # 0.0-1.0
    quality_score = Column(Float, nullable=True)  # 0.0-1.0
    risk_score = Column(Float, nullable=True)  # 0.0-1.0
    complexity_score = Column(Float, nullable=True)  # 0.0-1.0

    # Testing results
    test_results = Column(JSON, default={})
    test_coverage = Column(Float, nullable=True)  # 0.0-100.0
    test_passed = Column(Boolean, nullable=True, default=False)
    tests_run = Column(Integer, default=0, nullable=False)
    tests_failed = Column(Integer, default=0, nullable=False)

    # Application tracking
    applied_at = Column(DateTime(timezone=True), nullable=True, index=True)
    applied_by_id = Column(Integer, ForeignKey("user.id"), nullable=True, index=True)
    applied_commit_hash = Column(String(40), nullable=True)  # Git commit hash
    applied_branch = Column(String(255), nullable=True)

    # Review and approval
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by_id = Column(Integer, ForeignKey("user.id"), nullable=True, index=True)
    approved = Column(Boolean, nullable=True, default=False)
    approval_notes = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)

    # Rollback information
    rolled_back_at = Column(DateTime(timezone=True), nullable=True)
    rollback_reason = Column(Text, nullable=True)
    rollback_commit_hash = Column(String(40), nullable=True)
    rollback_applied_by_id = Column(Integer, ForeignKey("user.id"), nullable=True)

    # Fix analysis and metadata
    root_cause = Column(Text, nullable=True)
    fix_approach = Column(Text, nullable=True)
    side_effects = Column(JSON, default=[])
    dependencies = Column(JSON, default=[])
    prerequisites = Column(JSON, default=[])

    # Performance and impact
    estimated_time = Column(Integer, nullable=True)  # Estimated time in minutes
    actual_time = Column(Integer, nullable=True)  # Actual time taken in minutes
    performance_impact = Column(JSON, default={})
    business_impact = Column(JSON, default={})

    # AI model information
    ai_model_version = Column(String(50), nullable=True)
    ai_prompt_version = Column(String(50), nullable=True)
    ai_processing_time_ms = Column(Integer, nullable=True)

    # Validation results
    validation_results = Column(JSON, default={})
    security_scan_results = Column(JSON, default={})
    code_quality_metrics = Column(JSON, default={})

    # Additional metadata
    metadata = Column(JSON, default={})
    tags = Column(ARRAY(String), default=[])

    # Relationships
    error = relationship("Error", back_populates="fixes")
    project = relationship("Project", back_populates="fixes")
    applied_by = relationship("User", foreign_keys=[applied_by_id], back_populates="applied_fixes")
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id], back_populates="reviewed_fixes")
    rollback_applied_by = relationship("User", foreign_keys=[rollback_applied_by_id])
    test_results_list = relationship("FixTestResult", back_populates="fix", cascade="all, delete-orphan")
    approvals = relationship("FixApproval", back_populates="fix", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Fix(id={self.id}, error_id={self.error_id}, status={self.status.value})>"

    @property
    def is_ready(self) -> bool:
        """Check if fix is ready for application."""
        return self.status == FixStatus.READY

    @property
    def is_approved(self) -> bool:
        """Check if fix is approved."""
        return self.approved and self.status in [FixStatus.READY, FixStatus.APPROVED]

    @property
    def is_applied(self) -> bool:
        """Check if fix has been applied."""
        return self.status == FixStatus.APPLIED

    @property
    def is_rolled_back(self) -> bool:
        """Check if fix has been rolled back."""
        return self.status == FixStatus.ROLLED_BACK

    @property
    def is_high_risk(self) -> bool:
        """Check if fix is high risk."""
        return self.risk_level in [FixRiskLevel.HIGH, FixRiskLevel.CRITICAL]

    @property
    def requires_approval(self) -> bool:
        """Check if fix requires approval."""
        return self.is_high_risk or self.confidence_score < 0.8

    @property
    def can_auto_apply(self) -> bool:
        """Check if fix can be automatically applied."""
        return (
            self.is_approved and
            not self.is_high_risk and
            self.confidence_score >= 0.8 and
            self.quality_score >= 0.7 and
            self.test_passed
        )

    def get_file_path_list(self) -> List[str]:
        """Get list of file paths."""
        if self.file_paths:
            return self.file_paths
        elif self.files_modified:
            return [file.get('path') for file in self.files_modified if file.get('path')]
        return []

    def add_file_path(self, file_path: str):
        """Add file path to fix."""
        if not self.file_paths:
            self.file_paths = []
        if file_path not in self.file_paths:
            self.file_paths.append(file_path)

    def get_metadata_value(self, key: str, default=None):
        """Get value from metadata."""
        return self.metadata.get(key, default) if self.metadata else default

    def set_metadata_value(self, key: str, value):
        """Set value in metadata."""
        if not self.metadata:
            self.metadata = {}
        self.metadata[key] = value

    def add_tag(self, tag: str):
        """Add tag to fix."""
        if not self.tags:
            self.tags = []
        if tag not in self.tags:
            self.tags.append(tag)

    def remove_tag(self, tag: str):
        """Remove tag from fix."""
        if self.tags and tag in self.tags:
            self.tags.remove(tag)

    def approve(self, approved_by_id: int, notes: str = None):
        """Approve fix."""
        self.approved = True
        self.reviewed_by_id = approved_by_id
        self.reviewed_at = datetime.utcnow()
        self.approval_notes = notes
        if self.status == FixStatus.READY:
            self.status = FixStatus.APPROVED

    def reject(self, reviewed_by_id: int, reason: str):
        """Reject fix."""
        self.approved = False
        self.reviewed_by_id = reviewed_by_id
        self.reviewed_at = datetime.utcnow()
        self.rejection_reason = reason
        self.status = FixStatus.REJECTED

    def apply(self, applied_by_id: int, commit_hash: str = None, branch: str = None):
        """Mark fix as applied."""
        from datetime import datetime, timezone
        self.status = FixStatus.APPLIED
        self.applied_at = datetime.now(timezone.utc)
        self.applied_by_id = applied_by_id
        if commit_hash:
            self.applied_commit_hash = commit_hash
        if branch:
            self.applied_branch = branch

    def rollback(self, rollback_reason: str, rollback_applied_by_id: int, commit_hash: str = None):
        """Rollback applied fix."""
        from datetime import datetime, timezone
        self.status = FixStatus.ROLLED_BACK
        self.rolled_back_at = datetime.now(timezone.utc)
        self.rollback_reason = rollback_reason
        self.rollback_applied_by_id = rollback_applied_by_id
        if commit_hash:
            self.rollback_commit_hash = commit_hash

    def calculate_priority_score(self) -> float:
        """Calculate priority score for fix."""
        # Base score from error severity
        if self.error:
            error_priority = self.error.calculate_priority_score()
        else:
            error_priority = 1.0

        # Adjust based on fix confidence
        confidence_multiplier = self.confidence_score or 0.5

        # Adjust based on risk level
        risk_multipliers = {
            FixRiskLevel.LOW: 1.2,
            FixRiskLevel.MEDIUM: 1.0,
            FixRiskLevel.HIGH: 0.8,
            FixRiskLevel.CRITICAL: 0.6,
        }
        risk_multiplier = risk_multipliers.get(self.risk_level, 1.0)

        return error_priority * confidence_multiplier * risk_multiplier

    def get_test_summary(self) -> dict:
        """Get test results summary."""
        return {
            "tests_run": self.tests_run,
            "tests_failed": self.tests_failed,
            "tests_passed": self.tests_run - self.tests_failed,
            "test_coverage": self.test_coverage,
            "success_rate": (self.tests_run - self.tests_failed) / max(self.tests_run, 1) * 100,
            "all_tests_passed": self.test_passed
        }

    def to_dict_with_metrics(self):
        """Convert to dictionary with calculated metrics."""
        data = self.to_dict()
        data.update({
            "is_ready": self.is_ready,
            "is_approved": self.is_approved,
            "is_applied": self.is_applied,
            "is_rolled_back": self.is_rolled_back,
            "is_high_risk": self.is_high_risk,
            "requires_approval": self.requires_approval,
            "can_auto_apply": self.can_auto_apply,
            "priority_score": self.calculate_priority_score(),
            "test_summary": self.get_test_summary(),
            "file_path_list": self.get_file_path_list(),
        })
        return data


class FixTestResult(BaseModel):
    """Individual test result for fixes."""

    fix_id = Column(Integer, ForeignKey("fix.id"), nullable=False, index=True)

    # Test information
    test_name = Column(String(255), nullable=False)
    test_type = Column(String(50), nullable=True)  # unit, integration, e2e, etc.
    test_suite = Column(String(255), nullable=True)

    # Test results
    status = Column(String(20), nullable=False)  # passed, failed, skipped, error
    duration_ms = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    stack_trace = Column(Text, nullable=True)

    # Test metadata
    test_file = Column(String(500), nullable=True)
    test_line = Column(Integer, nullable=True)
    assertion_message = Column(Text, nullable=True)

    # Relationships
    fix = relationship("Fix", back_populates="test_results_list")

    def __repr__(self):
        return f"<FixTestResult(id={self.id}, fix_id={self.fix_id}, test_name={self.test_name}, status={self.status})>"


class FixApproval(BaseModel):
    """Fix approval record."""

    fix_id = Column(Integer, ForeignKey("fix.id"), nullable=False, index=True)
    approver_id = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)

    # Approval details
    decision = Column(String(20), nullable=False)  # approved, rejected, requested_changes
    reason = Column(Text, nullable=True)
    confidence_level = Column(Integer, nullable=True)  # 1-5
    risk_assessment = Column(Text, nullable=True)

    # Approval conditions
    conditions = Column(JSON, default=[])
    required_changes = Column(JSON, default=[])
    follow_up_required = Column(Boolean, default=False)

    # Relationships
    fix = relationship("Fix", back_populates="approvals")
    approver = relationship("User", backref="fix_approvals")

    def __repr__(self):
        return f"<FixApproval(id={self.id}, fix_id={self.fix_id}, decision={self.decision})>"


# Indexes for performance optimization
Index('idx_fixes_error_status', Fix.error_id, Fix.status)
Index('idx_fixes_project_status', Fix.project_id, Fix.status)
Index('idx_fixes_type_status', Fix.fix_type, Fix.status)
Index('idx_fixes_applied_at', Fix.applied_at.desc())
Index('idx_fixes_confidence', Fix.confidence_score.desc())
Index('idx_fixes_risk_level', Fix.risk_level, Fix.status)
Index('idx_fixes_reviewed_by', Fix.reviewed_by_id, Fix.status)
Index('idx_fixes_applied_by', Fix.applied_by_id, Fix.status)