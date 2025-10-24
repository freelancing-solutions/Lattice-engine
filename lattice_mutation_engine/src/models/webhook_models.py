"""
Webhook models for database persistence and API contracts
"""

from datetime import datetime
from enum import Enum
from typing import Dict, Any, List, Optional
import uuid
import hmac
import hashlib

from pydantic import BaseModel, Field, validator
from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class WebhookStatus(str, Enum):
    """Webhook status values"""
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    ERROR = "ERROR"


class WebhookDeliveryStatus(str, Enum):
    """Webhook delivery status values"""
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    RETRYING = "RETRYING"


class WebhookEventType(str, Enum):
    """Webhook event types"""
    MUTATION_CREATED = "mutation.created"
    MUTATION_APPROVED = "mutation.approved"
    MUTATION_DEPLOYED = "mutation.deployed"
    MUTATION_REJECTED = "mutation.rejected"
    DEPLOYMENT_CREATED = "deployment.created"
    DEPLOYMENT_COMPLETED = "deployment.completed"
    DEPLOYMENT_FAILED = "deployment.failed"
    APPROVAL_REQUESTED = "approval.requested"
    APPROVAL_RESPONDED = "approval.responded"
    SPEC_CREATED = "spec.created"
    SPEC_UPDATED = "spec.updated"
    TASK_COMPLETED = "task.completed"


class WebhookTable(Base):
    """SQLAlchemy model for webhooks"""
    __tablename__ = "webhooks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    url = Column(String(1000), nullable=False)
    events = Column(JSON, nullable=False)  # List of event types
    secret = Column(Text, nullable=False)  # Encrypted secret
    active = Column(Boolean, default=True, nullable=False)
    headers = Column(JSON, nullable=True)  # Custom headers dict
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_triggered_at = Column(DateTime, nullable=True)
    total_deliveries = Column(Integer, default=0, nullable=False)
    successful_deliveries = Column(Integer, default=0, nullable=False)
    failed_deliveries = Column(Integer, default=0, nullable=False)

    # Relationships
    organization = relationship("OrganizationTable", back_populates="webhooks")
    creator = relationship("UserTable", back_populates="created_webhooks")
    deliveries = relationship("WebhookDeliveryTable", back_populates="webhook", cascade="all, delete-orphan")


class WebhookDeliveryTable(Base):
    """SQLAlchemy model for webhook delivery attempts"""
    __tablename__ = "webhook_deliveries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    webhook_id = Column(UUID(as_uuid=True), ForeignKey("webhooks.id"), nullable=False)
    event_type = Column(String(100), nullable=False)
    payload = Column(JSON, nullable=False)
    status = Column(String(50), nullable=False, default=WebhookDeliveryStatus.PENDING)
    attempts = Column(Integer, default=0, nullable=False)
    max_attempts = Column(Integer, default=3, nullable=False)
    response_status_code = Column(Integer, nullable=True)
    response_body = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    next_retry_at = Column(DateTime, nullable=True)

    # Relationships
    webhook = relationship("WebhookTable", back_populates="deliveries")


# Pydantic models for API

class WebhookBase(BaseModel):
    """Base webhook model"""
    name: str = Field(..., min_length=3, max_length=255)
    url: str = Field(..., min_length=10, max_length=1000)
    events: List[WebhookEventType] = Field(..., min_items=1)
    secret: Optional[str] = Field(None, min_length=16, max_length=255)
    active: Optional[bool] = Field(True)
    headers: Optional[Dict[str, str]] = Field(None)

    @validator('url')
    def validate_url(cls, v):
        if not v.startswith('https://'):
            raise ValueError('Webhook URL must use HTTPS')
        return v

    @validator('secret')
    def validate_secret_length(cls, v):
        if v and len(v) < 16:
            raise ValueError('Secret must be at least 16 characters long')
        return v


class WebhookCreate(WebhookBase):
    """Webhook creation model"""
    organization_id: Optional[str] = None  # Will be set from context
    created_by: Optional[str] = None  # Will be set from context


class WebhookUpdate(BaseModel):
    """Webhook update model"""
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    url: Optional[str] = Field(None, min_length=10, max_length=1000)
    events: Optional[List[WebhookEventType]] = Field(None, min_items=1)
    active: Optional[bool] = None
    headers: Optional[Dict[str, str]] = None

    @validator('url')
    def validate_url(cls, v):
        if v and not v.startswith('https://'):
            raise ValueError('Webhook URL must use HTTPS')
        return v


class Webhook(WebhookBase):
    """Complete webhook model"""
    id: str
    organization_id: str
    created_by: str
    created_at: datetime
    updated_at: datetime
    last_triggered_at: Optional[datetime] = None
    total_deliveries: int
    successful_deliveries: int
    failed_deliveries: int

    class Config:
        orm_mode = True


class WebhookDelivery(BaseModel):
    """Webhook delivery model"""
    id: str
    webhook_id: str
    event_type: str
    payload: Dict[str, Any]
    status: WebhookDeliveryStatus
    attempts: int
    max_attempts: int
    response_status_code: Optional[int] = None
    response_body: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    next_retry_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class WebhookTest(BaseModel):
    """Webhook test result model"""
    webhook_id: str
    event_type: str = "webhook.test"
    payload: Dict[str, Any]
    status: WebhookDeliveryStatus
    attempts: int = 1
    response_status_code: Optional[int] = None
    response_body: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime


# Helper functions for signature handling

def generate_signature(payload: str, secret: str) -> str:
    """
    Generate HMAC-SHA256 signature for webhook payload

    Args:
        payload: JSON string payload
        secret: Webhook secret

    Returns:
        Hexadecimal signature
    """
    return hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()


def verify_signature(payload: str, signature: str, secret: str) -> bool:
    """
    Verify webhook signature using timing-safe comparison

    Args:
        payload: JSON string payload
        signature: Received signature
        secret: Webhook secret

    Returns:
        True if signature is valid
    """
    expected_signature = generate_signature(payload, secret)
    return hmac.compare_digest(expected_signature, signature)


def get_event_display_name(event_type: str) -> str:
    """
    Get human-readable display name for event type

    Args:
        event_type: Event type string

    Returns:
        Display name
    """
    display_names = {
        WebhookEventType.MUTATION_CREATED: "Mutation Created",
        WebhookEventType.MUTATION_APPROVED: "Mutation Approved",
        WebhookEventType.MUTATION_DEPLOYED: "Mutation Deployed",
        WebhookEventType.MUTATION_REJECTED: "Mutation Rejected",
        WebhookEventType.DEPLOYMENT_CREATED: "Deployment Created",
        WebhookEventType.DEPLOYMENT_COMPLETED: "Deployment Completed",
        WebhookEventType.DEPLOYMENT_FAILED: "Deployment Failed",
        WebhookEventType.APPROVAL_REQUESTED: "Approval Requested",
        WebhookEventType.APPROVAL_RESPONDED: "Approval Responded",
        WebhookEventType.SPEC_CREATED: "Spec Created",
        WebhookEventType.SPEC_UPDATED: "Spec Updated",
        WebhookEventType.TASK_COMPLETED: "Task Completed",
        "webhook.test": "Webhook Test"
    }
    return display_names.get(event_type, event_type)