"""
Error-related Pydantic schemas.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

from app.schemas.base import BaseSchema, TimestampedSchema, PaginationParams


class ErrorSeverity(str, Enum):
    """Error severity levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ErrorStatus(str, Enum):
    """Error status."""
    DETECTED = "detected"
    ANALYZING = "analyzing"
    FIXING = "fixing"
    RESOLVED = "resolved"
    IGNORED = "ignored"
    FALSE_POSITIVE = "false_positive"


class ErrorCategory(str, Enum):
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


class ErrorBase(BaseSchema):
    """Base error schema."""

    title: str = Field(..., min_length=1, max_length=255, description="Error title")
    description: Optional[str] = Field(None, description="Error description")
    severity: ErrorSeverity = Field(..., description="Error severity")
    status: ErrorStatus = Field(ErrorStatus.DETECTED, description="Error status")
    category: Optional[ErrorCategory] = Field(None, description="Error category")

    # Source information
    source: str = Field(..., min_length=1, max_length=100, description="Error source")
    source_id: Optional[str] = Field(None, description="Source system ID")
    source_type: Optional[str] = Field(None, description="Source type")
    source_url: Optional[str] = Field(None, description="Source URL")

    # Error details
    stack_trace: Optional[str] = Field(None, description="Stack trace")
    error_type: Optional[str] = Field(None, description="Error type")
    error_code: Optional[str] = Field(None, description="Error code")
    error_message: Optional[str] = Field(None, description="Error message")

    # Location information
    file_path: Optional[str] = Field(None, description="File path")
    line_number: Optional[int] = Field(None, ge=1, description="Line number")
    function_name: Optional[str] = Field(None, description="Function name")
    class_name: Optional[str] = Field(None, description="Class name")

    # Environment information
    environment: Optional[str] = Field(None, description="Environment")
    version: Optional[str] = Field(None, description="Application version")
    release: Optional[str] = Field(None, description="Release version")

    # User information
    user_id: Optional[str] = Field(None, description="Affected user ID")
    session_id: Optional[str] = Field(None, description="Session ID")
    url: Optional[str] = Field(None, description="Request URL")

    # Additional data
    context: Dict[str, Any] = Field(default_factory=dict, description="Context data")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadata")
    tags: List[str] = Field(default_factory=list, description="Tags")

    # Assignment
    assigned_to_id: Optional[int] = Field(None, description="Assigned user ID")

    @validator('line_number')
    def validate_line_number(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Line number must be positive')
        return v


class ErrorCreate(ErrorBase):
    """Error creation schema."""

    project_id: int = Field(..., description="Project ID")


class ErrorUpdate(BaseSchema):
    """Error update schema."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    severity: Optional[ErrorSeverity] = None
    status: Optional[ErrorStatus] = None
    category: Optional[ErrorCategory] = None
    assigned_to_id: Optional[int] = None
    context: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None


class ErrorResolve(BaseSchema):
    """Error resolution schema."""

    resolution_method: str = Field(..., description="Resolution method")
    resolution_notes: Optional[str] = Field(None, description="Resolution notes")


class ErrorAssign(BaseSchema):
    """Error assignment schema."""

    assigned_to_id: int = Field(..., description="User ID to assign to")
    notes: Optional[str] = Field(None, description="Assignment notes")


class ErrorIgnore(BaseSchema):
    """Error ignore schema."""

    reason: Optional[str] = Field(None, description="Ignore reason")
    false_positive: bool = Field(False, description="Mark as false positive")


class ErrorBulkAction(BaseSchema):
    """Bulk error action schema."""

    error_ids: List[int] = Field(..., description="Error IDs to act on")
    action: str = Field(..., regex="^(assign|resolve|ignore|delete)$", description="Action to perform")
    params: Dict[str, Any] = Field(default_factory=dict, description="Action parameters")


class ErrorResponse(TimestampedSchema):
    """Error response schema."""

    title: str
    description: Optional[str]
    severity: ErrorSeverity
    status: ErrorStatus
    category: Optional[ErrorCategory]

    # Project ownership
    project_id: int

    # Source information
    source: str
    source_id: Optional[str]
    source_type: Optional[str]
    source_url: Optional[str]

    # Error details
    stack_trace: Optional[str]
    error_type: Optional[str]
    error_code: Optional[str]
    error_message: Optional[str]

    # Location information
    file_path: Optional[str]
    line_number: Optional[int]
    function_name: Optional[str]
    class_name: Optional[str]

    # Environment information
    environment: Optional[str]
    version: Optional[str]
    release: Optional[str]

    # User information
    user_id: Optional[str]
    session_id: Optional[str]
    url: Optional[str]

    # Assignment and ownership
    assigned_to_id: Optional[int]

    # Resolution tracking
    resolved_at: Optional[datetime]
    resolved_by_id: Optional[int]
    resolution_method: Optional[str]
    resolution_notes: Optional[str]

    # AI analysis
    ai_analysis: Optional[Dict[str, Any]]
    ai_confidence: Optional[int]
    ai_model_version: Optional[str]
    ai_suggestions: List[Dict[str, Any]]

    # Impact metrics
    affected_users: int
    occurrence_count: int
    first_seen_at: datetime
    last_seen_at: datetime

    # Additional data
    context: Dict[str, Any]
    metadata: Dict[str, Any]
    tags: List[str]

    # Calculated fields
    is_critical: bool = False
    is_resolved: bool = False
    is_open: bool = True
    duration_open: Optional[int] = None
    occurrence_frequency: float = 0.0
    priority_score: float = 0.0

    class Config:
        from_attributes = True


class ErrorListParams(PaginationParams):
    """Error list parameters."""

    project_id: Optional[int] = None
    severity: Optional[ErrorSeverity] = None
    status: Optional[ErrorStatus] = None
    category: Optional[ErrorCategory] = None
    source: Optional[str] = None
    environment: Optional[str] = None
    assigned_to_id: Optional[int] = None
    is_assigned: Optional[bool] = None
    has_ai_analysis: Optional[bool] = None
    tag: Optional[str] = None
    search: Optional[str] = None


class ErrorAnalysis(BaseSchema):
    """Error analysis schema."""

    root_cause: str = Field(..., description="Root cause analysis")
    impact_assessment: str = Field(..., description="Impact assessment")
    suggested_fixes: List[str] = Field(..., description="Suggested fixes")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    risk_level: str = Field(..., description="Risk level")
    estimated_effort: str = Field(..., description="Estimated effort")
    related_errors: List[str] = Field(default_factory=list, description="Related errors")
    prevention_suggestions: List[str] = Field(default_factory=list, description="Prevention suggestions")
    tags: List[str] = Field(default_factory=list, description="Suggested tags")
    category: Optional[str] = Field(None, description="Error category")
    subcategory: Optional[str] = Field(None, description="Error subcategory")


class ErrorAnalysisResponse(BaseSchema):
    """Error analysis response."""

    error_id: int
    analysis: ErrorAnalysis
    processing_time_ms: int
    model_used: str
    analysis_timestamp: datetime


class ErrorOccurrence(BaseSchema):
    """Error occurrence schema."""

    error_id: int = Field(..., description="Error ID")
    timestamp: datetime = Field(..., description="Occurrence timestamp")
    environment: Optional[str] = None
    version: Optional[str] = None
    release: Optional[str] = None
    request_id: Optional[str] = None
    session_id: Optional[str] = None
    url: Optional[str] = None
    user_id: Optional[str] = None
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    duration_ms: Optional[int] = None
    context: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ErrorStatistics(BaseSchema):
    """Error statistics schema."""

    total_errors: int
    critical_errors: int
    high_errors: int
    medium_errors: int
    low_errors: int
    resolved_errors: int
    open_errors: int
    avg_resolution_time: Optional[float]
    avg_first_response_time: Optional[float]
    error_rate_trend: List[Dict[str, Any]]
    top_error_types: List[Dict[str, Any]]
    affected_projects: int


class ErrorMetrics(BaseSchema):
    """Error metrics over time."""

    date: datetime
    total_errors: int
    critical_errors: int
    resolved_errors: int
    resolution_rate: float
    avg_resolution_time: float
    unique_users_affected: int


class ErrorPattern(BaseSchema):
    """Error pattern analysis."""

    pattern: str = Field(..., description="Pattern description")
    frequency: int = Field(..., description="Pattern frequency")
    severity_distribution: Dict[str, int]
    common_locations: List[Dict[str, Any]]
    common_environments: List[Dict[str, Any]]
    suggested_fixes: List[str]
    prevention_strategies: List[str]


class ErrorDuplicate(BaseSchema):
    """Error duplicate detection."""

    original_error_id: int
    duplicate_error_ids: List[int]
    similarity_score: float
    duplicate_reasoning: str
    action: str = Field(..., regex="^(merge|keep_separate)$")


class ErrorExport(BaseSchema):
    """Error export parameters."""

    format: str = Field("csv", regex="^(csv|json|xlsx)$")
    filters: Dict[str, Any] = Field(default_factory=dict)
    fields: List[str] = Field(default_factory=list)
    include_context: bool = False
    include_stack_trace: bool = True


class ErrorImport(BaseSchema):
    """Error import parameters."""

    source: str = Field(..., description="Import source")
    format: str = Field("json", regex="^(json|csv|xml)$")
    data: List[Dict[str, Any]] = Field(..., description="Error data")
    project_id: int = Field(..., description="Target project ID")
    dry_run: bool = Field(False, description="Dry run without importing")


class ErrorWebhook(BaseSchema):
    """Error webhook payload."""

    event_type: str = Field(..., description="Event type")
    event_id: str = Field(..., description="Event ID")
    project_id: int = Field(..., description="Project ID")
    error: Dict[str, Any] = Field(..., description="Error data")
    context: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(..., description="Event timestamp")


class ErrorAlert(BaseSchema):
    """Error alert configuration."""

    name: str = Field(..., description="Alert name")
    description: Optional[str] = None
    project_id: int = Field(..., description="Project ID")
    conditions: Dict[str, Any] = Field(..., description="Alert conditions")
    channels: List[str] = Field(..., description="Alert channels")
    enabled: bool = Field(True, description="Alert enabled")
    throttle_minutes: int = Field(15, description="Throttle minutes")
    metadata: Dict[str, Any] = Field(default_factory=dict)