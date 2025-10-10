"""
Fix-related Pydantic schemas.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

from app.schemas.base import BaseSchema, TimestampedSchema, PaginationParams


class FixType(str, Enum):
    """Fix types."""
    AUTOMATIC = "automatic"
    MANUAL = "manual"
    SUGGESTED = "suggested"
    HYBRID = "hybrid"


class FixStatus(str, Enum):
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


class FixRiskLevel(str, Enum):
    """Fix risk levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class FixBase(BaseSchema):
    """Base fix schema."""

    error_id: int = Field(..., description="Error ID")
    title: Optional[str] = Field(None, description="Fix title")
    description: Optional[str] = Field(None, description="Fix description")

    # Fix classification
    fix_type: FixType = Field(FixType.AUTOMATIC, description="Fix type")
    risk_level: FixRiskLevel = Field(FixRiskLevel.MEDIUM, description="Risk level")

    # Generated content
    generated_code: Optional[str] = Field(None, description="Generated code")
    code_diff: Optional[str] = Field(None, description="Code diff")
    file_paths: List[str] = Field(default_factory=list, description="File paths")

    # Fix analysis
    root_cause: Optional[str] = Field(None, description="Root cause")
    fix_approach: Optional[str] = Field(None, description="Fix approach")
    side_effects: List[str] = Field(default_factory=list, description="Side effects")
    dependencies: List[str] = Field(default_factory=list, description="Dependencies")
    prerequisites: List[str] = Field(default_factory=list, description="Prerequisites")

    # AI metrics
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Confidence score")
    quality_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Quality score")
    risk_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Risk score")
    complexity_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Complexity score")

    # Additional metadata
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadata")
    tags: List[str] = Field(default_factory=list, description="Tags")


class FixCreate(FixBase):
    """Fix creation schema."""

    project_id: int = Field(..., description="Project ID")


class FixUpdate(BaseSchema):
    """Fix update schema."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    risk_level: Optional[FixRiskLevel] = None
    generated_code: Optional[str] = None
    code_diff: Optional[str] = None
    file_paths: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None


class FixApprove(BaseSchema):
    """Fix approval schema."""

    approved: bool = Field(..., description="Approval decision")
    notes: Optional[str] = Field(None, description="Approval notes")
    confidence_level: Optional[int] = Field(None, ge=1, le=5, description="Confidence level")
    conditions: List[str] = Field(default_factory=list, description="Approval conditions")


class FixReject(BaseSchema):
    """Fix rejection schema."""

    reason: str = Field(..., description="Rejection reason")
    confidence_level: Optional[int] = Field(None, ge=1, le=5, description="Confidence level")
    required_changes: List[str] = Field(default_factory=list, description="Required changes")


class FixApply(BaseSchema):
    """Fix application schema."""

    commit_hash: Optional[str] = Field(None, description="Git commit hash")
    branch: Optional[str] = Field(None, description="Branch name")
    notes: Optional[str] = Field(None, description="Application notes")


class FixRollback(BaseSchema):
    """Fix rollback schema."""

    reason: str = Field(..., description="Rollback reason")
    commit_hash: Optional[str] = Field(None, description="Rollback commit hash")
    notes: Optional[str] = Field(None, description="Rollback notes")


class FixTestResult(BaseSchema):
    """Fix test result schema."""

    test_name: str = Field(..., description="Test name")
    test_type: Optional[str] = Field(None, description="Test type")
    test_suite: Optional[str] = Field(None, description="Test suite")
    status: str = Field(..., description="Test status")
    duration_ms: Optional[int] = Field(None, description="Test duration")
    error_message: Optional[str] = Field(None, description="Error message")
    stack_trace: Optional[str] = Field(None, description="Stack trace")
    test_file: Optional[str] = Field(None, description="Test file")
    test_line: Optional[int] = Field(None, description="Test line")
    assertion_message: Optional[str] = Field(None, description="Assertion message")


class FixBulkAction(BaseSchema):
    """Bulk fix action schema."""

    fix_ids: List[int] = Field(..., description="Fix IDs to act on")
    action: str = Field(..., regex="^(approve|reject|apply|rollback|cancel|delete)$", description="Action to perform")
    params: Dict[str, Any] = Field(default_factory=dict, description="Action parameters")


class FixGenerate(BaseSchema):
    """Fix generation schema."""

    error_id: int = Field(..., description="Error ID")
    fix_type: FixType = Field(FixType.AUTOMATIC, description="Fix type")
    auto_apply: bool = Field(False, description="Auto-apply if confidence is high")
    review_required: bool = Field(True, description="Require human review")
    context: Dict[str, Any] = Field(default_factory=dict, description="Additional context")


class FixValidate(BaseSchema):
    """Fix validation schema."""

    fix_id: int = Field(..., description="Fix ID")
    validation_level: str = Field("standard", regex="^(basic|standard|comprehensive)$", description="Validation level")
    include_security_scan: bool = Field(True, description="Include security scan")
    include_performance_test: bool = Field(False, description="Include performance test")
    context: Dict[str, Any] = Field(default_factory=dict, description="Validation context")


class FixResponse(TimestampedSchema):
    """Fix response schema."""

    error_id: int
    project_id: int
    title: Optional[str]
    description: Optional[str]

    # Fix classification
    fix_type: FixType
    status: FixStatus
    risk_level: FixRiskLevel

    # Generated content
    generated_code: Optional[str]
    code_diff: Optional[str]
    file_paths: List[str]
    files_modified: List[Dict[str, Any]]

    # AI metrics
    confidence_score: Optional[float]
    quality_score: Optional[float]
    risk_score: Optional[float]
    complexity_score: Optional[float]

    # Testing results
    test_results: Dict[str, Any]
    test_coverage: Optional[float]
    test_passed: Optional[bool]
    tests_run: int
    tests_failed: int

    # Application tracking
    applied_at: Optional[datetime]
    applied_by_id: Optional[int]
    applied_commit_hash: Optional[str]
    applied_branch: Optional[str]

    # Review and approval
    reviewed_at: Optional[datetime]
    reviewed_by_id: Optional[int]
    approved: Optional[bool]
    approval_notes: Optional[str]
    rejection_reason: Optional[str]

    # Rollback information
    rolled_back_at: Optional[datetime]
    rollback_reason: Optional[str]
    rollback_commit_hash: Optional[str]

    # Fix analysis
    root_cause: Optional[str]
    fix_approach: Optional[str]
    side_effects: List[str]
    dependencies: List[str]
    prerequisites: List[str]

    # Performance and impact
    estimated_time: Optional[int]
    actual_time: Optional[int]
    performance_impact: Dict[str, Any]
    business_impact: Dict[str, Any]

    # AI model information
    ai_model_version: Optional[str]
    ai_prompt_version: Optional[str]
    ai_processing_time_ms: Optional[int]

    # Additional metadata
    metadata: Dict[str, Any]
    tags: List[str]

    # Calculated fields
    is_ready: bool = False
    is_approved: bool = False
    is_applied: bool = False
    is_rolled_back: bool = False
    is_high_risk: bool = False
    requires_approval: bool = False
    can_auto_apply: bool = False
    priority_score: float = 0.0
    test_summary: Dict[str, Any] = {}

    class Config:
        from_attributes = True


class FixListParams(PaginationParams):
    """Fix list parameters."""

    error_id: Optional[int] = None
    project_id: Optional[int] = None
    fix_type: Optional[FixType] = None
    status: Optional[FixStatus] = None
    risk_level: Optional[FixRiskLevel] = None
    applied_by_id: Optional[int] = None
    reviewed_by_id: Optional[int] = None
    is_approved: Optional[bool] = None
    is_applied: Optional[bool] = None
    requires_approval: Optional[bool] = None
    tag: Optional[str] = None
    search: Optional[str] = None


class FixValidationResult(BaseSchema):
    """Fix validation result."""

    fix_id: int
    validation_passed: bool
    code_quality_score: float
    security_score: float
    performance_score: float
    maintainability_score: float
    issues: List[Dict[str, Any]]
    suggestions: List[str]
    test_coverage: float
    breaking_changes: List[str]
    security_concerns: List[str]
    performance_issues: List[str]
    overall_recommendation: str
    confidence_score: float
    validation_metadata: Dict[str, Any]


class FixTestSummary(BaseSchema):
    """Fix test summary."""

    tests_run: int
    tests_failed: int
    tests_passed: int
    test_coverage: Optional[float]
    success_rate: float
    all_tests_passed: bool
    test_results: List[FixTestResult]


class FixApproval(BaseSchema):
    """Fix approval record."""

    approver_id: int
    decision: str
    reason: Optional[str]
    confidence_level: int
    risk_assessment: Optional[str]
    conditions: List[str]
    required_changes: List[str]
    follow_up_required: bool


class FixApplication(BaseSchema):
    """Fix application details."""

    fix_id: int
    applied_by_id: int
    commit_hash: Optional[str]
    branch: Optional[str]
    application_method: str
    application_time_ms: int
    rollback_available: bool
    rollback_instructions: Optional[str]
    monitoring_required: bool
    monitoring_metrics: List[str]


class FixMetrics(BaseSchema):
    """Fix metrics over time."""

    date: datetime
    total_fixes: int
    applied_fixes: int
    successful_fixes: int
    failed_fixes: int
    rolled_back_fixes: int
    avg_confidence: float
    avg_quality: float
    avg_processing_time: float
    auto_apply_rate: float
    approval_rate: float


class FixTemplate(BaseSchema):
    """Fix template for common patterns."""

    name: str = Field(..., description="Template name")
    description: Optional[str] = Field(None, description="Template description")
    category: str = Field(..., description="Template category")
    pattern: str = Field(..., description="Error pattern")
    fix_template: str = Field(..., description="Fix template")
    confidence_threshold: float = Field(0.8, description="Confidence threshold")
    auto_apply: bool = Field(False, description="Auto-apply eligible")
    tags: List[str] = Field(default_factory=list, description="Tags")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadata")


class FixExport(BaseSchema):
    """Fix export parameters."""

    format: str = Field("csv", regex="^(csv|json|xlsx)$")
    filters: Dict[str, Any] = Field(default_factory=dict)
    fields: List[str] = Field(default_factory=list)
    include_code: bool = Field(False, description="Include generated code")
    include_tests: bool = Field(True, description="Include test results")


class FixImport(BaseSchema):
    """Fix import parameters."""

    source: str = Field(..., description="Import source")
    format: str = Field("json", regex="^(json|csv|xml)$")
    data: List[Dict[str, Any]] = Field(..., description="Fix data")
    project_id: int = Field(..., description="Target project ID")
    dry_run: bool = Field(False, description="Dry run without importing")


class FixWebhook(BaseSchema):
    """Fix webhook payload."""

    event_type: str = Field(..., description="Event type")
    fix_id: int = Field(..., description="Fix ID")
    project_id: int = Field(..., description="Project ID")
    fix_data: Dict[str, Any] = Field(..., description="Fix data")
    context: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(..., description="Event timestamp")