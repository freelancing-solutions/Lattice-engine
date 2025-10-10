"""
User-related Pydantic schemas.
"""

from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

from app.schemas.base import BaseSchema, TimestampedSchema, PaginationParams


class UserRole(str, Enum):
    """User roles."""
    ADMIN = "admin"
    DEVELOPER = "developer"
    USER = "user"
    VIEWER = "viewer"


class UserStatus(str, Enum):
    """User status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class UserBase(BaseSchema):
    """Base user schema."""

    email: EmailStr = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=100, description="Username")
    full_name: Optional[str] = Field(None, max_length=255, description="Full name")
    role: UserRole = Field(UserRole.USER, description="User role")
    status: UserStatus = Field(UserStatus.ACTIVE, description="User status")
    avatar_url: Optional[str] = Field(None, description="Avatar URL")
    bio: Optional[str] = Field(None, description="User biography")
    timezone: str = Field("UTC", description="User timezone")
    language: str = Field("en", description="User language")


class UserCreate(UserBase):
    """User creation schema."""

    password: str = Field(..., min_length=8, max_length=255, description="Password")
    confirm_password: str = Field(..., description="Confirm password")

    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

    @validator('username')
    def validate_username(cls, v):
        if not v.isalnum() and '_' not in v:
            raise ValueError('Username must be alphanumeric or contain underscores')
        return v.lower()


class UserUpdate(BaseSchema):
    """User update schema."""

    full_name: Optional[str] = Field(None, max_length=255)
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    notification_settings: Optional[Dict[str, Any]] = None


class UserLogin(BaseSchema):
    """User login schema."""

    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., description="Password")
    remember_me: bool = Field(False, description="Remember me")


class UserRegister(UserCreate):
    """User registration schema."""

    accept_terms: bool = Field(..., description="Accept terms of service")
    accept_privacy: bool = Field(..., description="Accept privacy policy")


class UserResponse(TimestampedSchema):
    """User response schema."""

    email: str
    username: str
    full_name: Optional[str]
    role: UserRole
    status: UserStatus
    avatar_url: Optional[str]
    bio: Optional[str]
    timezone: str
    language: str
    is_verified: bool
    is_active: bool
    last_login_at: Optional[datetime]
    email_verified_at: Optional[datetime]
    current_organization_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class UserDetailResponse(UserResponse):
    """Detailed user response."""

    preferences: Dict[str, Any] = Field(default_factory=dict)
    notification_settings: Dict[str, Any] = Field(default_factory=dict)
    organizations: List[Dict[str, Any]] = Field(default_factory=list)
    permissions: List[str] = Field(default_factory=list)
    api_keys_count: int = 0
    sessions_count: int = 0


class UserListParams(PaginationParams):
    """User list parameters."""

    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    is_verified: Optional[bool] = None
    is_active: Optional[bool] = None
    organization_id: Optional[int] = None
    search: Optional[str] = None


class UserChangePassword(BaseSchema):
    """User password change schema."""

    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, max_length=255, description="New password")
    confirm_password: str = Field(..., description="Confirm new password")

    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v


class UserResetPassword(BaseSchema):
    """User password reset schema."""

    email: EmailStr = Field(..., description="Email address")


class UserSetPassword(BaseSchema):
    """User set password schema."""

    token: str = Field(..., description="Reset token")
    new_password: str = Field(..., min_length=8, max_length=255, description="New password")
    confirm_password: str = Field(..., description="Confirm new password")

    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v


class UserPreferences(BaseSchema):
    """User preferences schema."""

    theme: str = Field("light", regex="^(light|dark|auto)$")
    notifications_email: bool = True
    notifications_push: bool = True
    notifications_sms: bool = False
    language: str = Field("en", min_length=2, max_length=10)
    timezone: str = Field("UTC")
    date_format: str = Field("%Y-%m-%d")
    time_format: str = Field("%H:%M")
    auto_save: bool = True
    auto_refresh: bool = True
    items_per_page: int = Field(20, ge=10, le=100)


class UserNotificationSettings(BaseSchema):
    """User notification settings schema."""

    email_notifications: bool = True
    push_notifications: bool = True
    sms_notifications: bool = False
    in_app_notifications: bool = True

    # Notification types
    error_notifications: bool = True
    fix_notifications: bool = True
    system_notifications: bool = True
    security_notifications: bool = True
    billing_notifications: bool = True

    # Frequency settings
    daily_digest: bool = False
    weekly_summary: bool = True
    monthly_report: bool = False


class UserSessionResponse(TimestampedSchema):
    """User session response."""

    token: str
    refresh_token: Optional[str]
    expires_at: datetime
    is_active: bool
    device_info: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime


class UserAPIKeyCreate(BaseSchema):
    """API key creation schema."""

    name: str = Field(..., min_length=1, max_length=255)
    scopes: List[str] = Field(default_factory=list)
    expires_at: Optional[datetime] = None


class UserAPIKeyResponse(TimestampedSchema):
    """API key response."""

    name: str
    key_prefix: str
    scopes: List[str]
    is_active: bool
    expires_at: Optional[datetime]
    last_used_at: Optional[datetime]
    usage_count: int
    created_at: datetime


class UserStats(BaseSchema):
    """User statistics."""

    total_errors: int = 0
    total_fixes: int = 0
    total_projects: int = 0
    total_organizations: int = 0
    this_month_errors: int = 0
    this_month_fixes: int = 0
    avg_resolution_time: Optional[float] = None
    success_rate: Optional[float] = None


class UserActivity(BaseSchema):
    """User activity."""

    date: datetime
    errors_assigned: int = 0
    fixes_applied: int = 0
    fixes_reviewed: int = 0
    projects_active: int = 0
    actions_taken: int = 0


class UserPublicProfile(BaseSchema):
    """Public user profile."""

    username: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    role: UserRole
    joined_at: datetime
    total_contributions: int = 0
    total_fixes: int = 0
    total_errors_resolved: int = 0