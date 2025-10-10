"""
Base Pydantic schemas.
"""

from pydantic import BaseModel, Field
from typing import Any, Dict, Optional, List
from datetime import datetime


class BaseSchema(BaseModel):
    """Base schema with common fields."""

    class Config:
        from_attributes = True
        populate_by_name = True
        str_strip_whitespace = True
        validate_assignment = True
        use_enum_values = True


class TimestampedSchema(BaseSchema):
    """Schema with timestamp fields."""

    id: int
    uuid: str
    created_at: datetime
    updated_at: Optional[datetime] = None


class PaginationParams(BaseModel):
    """Pagination parameters."""

    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(20, ge=1, le=100, description="Page size")
    sort_by: Optional[str] = Field(None, description="Field to sort by")
    sort_order: Optional[str] = Field("asc", regex="^(asc|desc)$", description="Sort order")

    @property
    def offset(self) -> int:
        """Calculate offset for pagination."""
        return (self.page - 1) * self.size


class PaginatedResponse(BaseModel):
    """Paginated response wrapper."""

    items: List[Any]
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_prev: bool

    @classmethod
    def create(
        cls,
        items: List[Any],
        total: int,
        page: int,
        size: int
    ) -> "PaginatedResponse":
        """Create paginated response."""
        pages = (total + size - 1) // size
        return cls(
            items=items,
            total=total,
            page=page,
            size=size,
            pages=pages,
            has_next=page < pages,
            has_prev=page > 1
        )


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "healthy"
    service: str
    version: str
    environment: str
    database: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ErrorResponse(BaseModel):
    """Error response."""

    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SuccessResponse(BaseModel):
    """Success response."""

    success: bool = True
    message: str
    data: Optional[Any] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class FilterParams(BaseModel):
    """Common filter parameters."""

    search: Optional[str] = Field(None, description="Search term")
    created_from: Optional[datetime] = Field(None, description="Filter by creation date (from)")
    created_to: Optional[datetime] = Field(None, description="Filter by creation date (to)")
    updated_from: Optional[datetime] = Field(None, description="Filter by update date (from)")
    updated_to: Optional[datetime] = Field(None, description="Filter by update date (to)")


class MetadataResponse(BaseModel):
    """Metadata response."""

    metadata: Dict[str, Any]
    total_count: Optional[int] = None
    filters_applied: Optional[List[str]] = None
    execution_time_ms: Optional[float] = None