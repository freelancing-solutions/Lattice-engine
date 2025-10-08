"""
Subscription Models for Lattice Engine with Paddle.com Integration

This module defines subscription and billing models for the Lattice Engine
SaaS platform, integrating with Paddle.com for payment processing.
"""

from datetime import datetime, timezone, timedelta
from enum import Enum
from typing import Optional, Dict, Any, List
from uuid import UUID, uuid4
from decimal import Decimal

from pydantic import BaseModel, Field, validator
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, Integer, Numeric, JSON
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

from .user_models import Base, OrganizationPlan


class SubscriptionStatus(str, Enum):
    """Subscription status from Paddle"""
    ACTIVE = "active"
    TRIALING = "trialing"
    PAST_DUE = "past_due"
    PAUSED = "paused"
    DELETED = "deleted"
    CANCELLED = "cancelled"


class BillingInterval(str, Enum):
    """Billing intervals"""
    MONTHLY = "monthly"
    YEARLY = "yearly"


class PaymentStatus(str, Enum):
    """Payment status"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class InvoiceStatus(str, Enum):
    """Invoice status"""
    DRAFT = "draft"
    OPEN = "open"
    PAID = "paid"
    VOID = "void"
    UNCOLLECTIBLE = "uncollectible"


# SQLAlchemy Models
class PlanTable(Base):
    """SQLAlchemy Plan table model"""
    __tablename__ = "plans"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(100), nullable=False)
    slug = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    paddle_product_id = Column(String(100), nullable=False, unique=True)
    paddle_price_id_monthly = Column(String(100), nullable=True)
    paddle_price_id_yearly = Column(String(100), nullable=True)
    
    # Pricing
    price_monthly = Column(Numeric(10, 2), nullable=False)  # In USD
    price_yearly = Column(Numeric(10, 2), nullable=True)    # In USD
    
    # Limits
    max_projects = Column(Integer, default=3)
    max_members = Column(Integer, default=5)
    max_api_calls_monthly = Column(Integer, default=1000)
    max_specs_per_project = Column(Integer, default=10)
    
    # Features (JSON field for flexibility)
    features = Column(JSON, default=dict)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    subscriptions = relationship("SubscriptionTable", back_populates="plan")


class SubscriptionTable(Base):
    """SQLAlchemy Subscription table model"""
    __tablename__ = "subscriptions"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    plan_id = Column(PGUUID(as_uuid=True), ForeignKey("plans.id"), nullable=False)
    
    # Paddle integration
    paddle_subscription_id = Column(String(100), unique=True, nullable=False, index=True)
    paddle_customer_id = Column(String(100), nullable=False)
    
    status = Column(String(50), nullable=False, default=SubscriptionStatus.ACTIVE.value)
    billing_interval = Column(String(20), nullable=False, default=BillingInterval.MONTHLY.value)
    
    # Billing periods
    current_period_start = Column(DateTime(timezone=True), nullable=False)
    current_period_end = Column(DateTime(timezone=True), nullable=False)
    trial_start = Column(DateTime(timezone=True), nullable=True)
    trial_end = Column(DateTime(timezone=True), nullable=True)
    
    # Cancellation
    cancel_at_period_end = Column(Boolean, default=False)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    
    # Paddle webhook data
    paddle_data = Column(JSON, default=dict)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    organization = relationship("OrganizationTable", back_populates="subscriptions")
    plan = relationship("PlanTable", back_populates="subscriptions")
    invoices = relationship("InvoiceTable", back_populates="subscription")
    usage_records = relationship("UsageRecordTable", back_populates="subscription")


class InvoiceTable(Base):
    """SQLAlchemy Invoice table model"""
    __tablename__ = "invoices"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    subscription_id = Column(PGUUID(as_uuid=True), ForeignKey("subscriptions.id"), nullable=False)
    
    # Paddle integration
    paddle_invoice_id = Column(String(100), unique=True, nullable=False, index=True)
    paddle_transaction_id = Column(String(100), nullable=True)
    
    # Invoice details
    invoice_number = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default=InvoiceStatus.DRAFT.value)
    amount_total = Column(Numeric(10, 2), nullable=False)
    amount_subtotal = Column(Numeric(10, 2), nullable=False)
    amount_tax = Column(Numeric(10, 2), default=0)
    currency = Column(String(3), default="USD")
    
    # Dates
    invoice_date = Column(DateTime(timezone=True), nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    
    # Paddle data
    paddle_data = Column(JSON, default=dict)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    subscription = relationship("SubscriptionTable", back_populates="invoices")


class UsageRecordTable(Base):
    """SQLAlchemy Usage Record table model for tracking API usage"""
    __tablename__ = "usage_records"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    subscription_id = Column(PGUUID(as_uuid=True), ForeignKey("subscriptions.id"), nullable=False)
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    # Usage tracking
    metric_name = Column(String(100), nullable=False)  # 'api_calls', 'specs_created', etc.
    quantity = Column(Integer, nullable=False, default=1)
    
    # Time period
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    
    # Metadata
    metadata = Column(JSON, default=dict)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    subscription = relationship("SubscriptionTable", back_populates="usage_records")


# Pydantic Models
class PlanBase(BaseModel):
    """Base plan model"""
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=50, regex=r'^[a-z0-9-]+$')
    description: Optional[str] = Field(None, max_length=1000)
    price_monthly: Decimal = Field(..., ge=0)
    price_yearly: Optional[Decimal] = Field(None, ge=0)
    max_projects: int = Field(default=3, ge=1)
    max_members: int = Field(default=5, ge=1)
    max_api_calls_monthly: int = Field(default=1000, ge=100)
    max_specs_per_project: int = Field(default=10, ge=1)
    features: Dict[str, Any] = Field(default_factory=dict)


class PlanCreate(PlanBase):
    """Plan creation model"""
    paddle_product_id: str = Field(..., min_length=1, max_length=100)
    paddle_price_id_monthly: Optional[str] = Field(None, max_length=100)
    paddle_price_id_yearly: Optional[str] = Field(None, max_length=100)


class Plan(PlanBase):
    """Complete plan model"""
    id: UUID
    paddle_product_id: str
    paddle_price_id_monthly: Optional[str] = None
    paddle_price_id_yearly: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
    
    def get_price(self, interval: BillingInterval) -> Optional[Decimal]:
        """Get price for billing interval"""
        if interval == BillingInterval.MONTHLY:
            return self.price_monthly
        elif interval == BillingInterval.YEARLY and self.price_yearly:
            return self.price_yearly
        return None
    
    def get_yearly_savings(self) -> Optional[Decimal]:
        """Calculate yearly savings percentage"""
        if self.price_yearly and self.price_monthly:
            yearly_monthly = self.price_monthly * 12
            savings = (yearly_monthly - self.price_yearly) / yearly_monthly * 100
            return round(savings, 1)
        return None


class SubscriptionBase(BaseModel):
    """Base subscription model"""
    billing_interval: BillingInterval = BillingInterval.MONTHLY


class SubscriptionCreate(SubscriptionBase):
    """Subscription creation model"""
    organization_id: UUID
    plan_id: UUID
    paddle_subscription_id: str
    paddle_customer_id: str


class SubscriptionUpdate(BaseModel):
    """Subscription update model"""
    status: Optional[SubscriptionStatus] = None
    cancel_at_period_end: Optional[bool] = None
    paddle_data: Optional[Dict[str, Any]] = None


class Subscription(SubscriptionBase):
    """Complete subscription model"""
    id: UUID
    organization_id: UUID
    plan_id: UUID
    paddle_subscription_id: str
    paddle_customer_id: str
    status: SubscriptionStatus
    current_period_start: datetime
    current_period_end: datetime
    trial_start: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    cancel_at_period_end: bool
    cancelled_at: Optional[datetime] = None
    paddle_data: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
    
    def is_active(self) -> bool:
        """Check if subscription is currently active"""
        active_statuses = [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]
        return (
            self.status in active_statuses and
            self.current_period_end > datetime.now(timezone.utc)
        )
    
    def is_trial(self) -> bool:
        """Check if subscription is in trial period"""
        if not self.trial_end:
            return False
        return (
            self.status == SubscriptionStatus.TRIALING and
            datetime.now(timezone.utc) < self.trial_end
        )
    
    def days_until_expiry(self) -> int:
        """Get days until subscription expires"""
        delta = self.current_period_end - datetime.now(timezone.utc)
        return max(0, delta.days)
    
    def days_remaining_in_trial(self) -> int:
        """Get days remaining in trial"""
        if not self.trial_end:
            return 0
        delta = self.trial_end - datetime.now(timezone.utc)
        return max(0, delta.days)
    
    def can_use_features(self) -> bool:
        """Check if subscription allows feature usage"""
        return self.is_active() and not self.status == SubscriptionStatus.PAST_DUE


class InvoiceBase(BaseModel):
    """Base invoice model"""
    invoice_number: str
    amount_total: Decimal = Field(..., ge=0)
    amount_subtotal: Decimal = Field(..., ge=0)
    amount_tax: Decimal = Field(default=Decimal('0'), ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    invoice_date: datetime
    due_date: Optional[datetime] = None


class InvoiceCreate(InvoiceBase):
    """Invoice creation model"""
    subscription_id: UUID
    paddle_invoice_id: str
    paddle_transaction_id: Optional[str] = None
    status: InvoiceStatus = InvoiceStatus.DRAFT


class Invoice(InvoiceBase):
    """Complete invoice model"""
    id: UUID
    subscription_id: UUID
    paddle_invoice_id: str
    paddle_transaction_id: Optional[str] = None
    status: InvoiceStatus
    paid_at: Optional[datetime] = None
    paddle_data: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
    
    def is_paid(self) -> bool:
        """Check if invoice is paid"""
        return self.status == InvoiceStatus.PAID and self.paid_at is not None
    
    def is_overdue(self) -> bool:
        """Check if invoice is overdue"""
        if not self.due_date or self.is_paid():
            return False
        return datetime.now(timezone.utc) > self.due_date


class UsageRecordBase(BaseModel):
    """Base usage record model"""
    metric_name: str = Field(..., min_length=1, max_length=100)
    quantity: int = Field(default=1, ge=1)
    period_start: datetime
    period_end: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)


class UsageRecordCreate(UsageRecordBase):
    """Usage record creation model"""
    subscription_id: UUID
    organization_id: UUID


class UsageRecord(UsageRecordBase):
    """Complete usage record model"""
    id: UUID
    subscription_id: UUID
    organization_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class SubscriptionWithPlan(Subscription):
    """Subscription model with plan details"""
    plan: Plan
    
    class Config:
        from_attributes = True


class UsageSummary(BaseModel):
    """Usage summary for a subscription period"""
    subscription_id: UUID
    organization_id: UUID
    period_start: datetime
    period_end: datetime
    metrics: Dict[str, int] = Field(default_factory=dict)  # metric_name -> total_quantity
    
    def is_over_limit(self, plan: Plan) -> Dict[str, bool]:
        """Check which metrics are over plan limits"""
        over_limits = {}
        
        api_calls = self.metrics.get('api_calls', 0)
        over_limits['api_calls'] = api_calls > plan.max_api_calls_monthly
        
        specs_created = self.metrics.get('specs_created', 0)
        # This would need to be calculated per project
        
        return over_limits


# Paddle Webhook Models
class PaddleWebhookEvent(BaseModel):
    """Base Paddle webhook event model"""
    event_type: str
    event_id: str
    occurred_at: datetime
    data: Dict[str, Any]
    
    class Config:
        extra = "allow"


class PaddleSubscriptionEvent(PaddleWebhookEvent):
    """Paddle subscription webhook event"""
    
    def get_subscription_id(self) -> str:
        """Extract subscription ID from webhook data"""
        return self.data.get('id', '')
    
    def get_customer_id(self) -> str:
        """Extract customer ID from webhook data"""
        return self.data.get('customer_id', '')
    
    def get_status(self) -> str:
        """Extract subscription status from webhook data"""
        return self.data.get('status', '')


# Default plans configuration
DEFAULT_PLANS = [
    {
        "name": "Free",
        "slug": "free",
        "description": "Perfect for getting started with Lattice Engine",
        "price_monthly": Decimal('0'),
        "price_yearly": None,
        "max_projects": 3,
        "max_members": 5,
        "max_api_calls_monthly": 1000,
        "max_specs_per_project": 10,
        "features": {
            "basic_agents": True,
            "spec_sync": True,
            "community_support": True,
            "advanced_agents": False,
            "priority_support": False,
            "custom_integrations": False,
            "audit_logs": False
        }
    },
    {
        "name": "Starter",
        "slug": "starter",
        "description": "For small teams building with Lattice Engine",
        "price_monthly": Decimal('29'),
        "price_yearly": Decimal('290'),  # 2 months free
        "max_projects": 10,
        "max_members": 15,
        "max_api_calls_monthly": 10000,
        "max_specs_per_project": 50,
        "features": {
            "basic_agents": True,
            "spec_sync": True,
            "community_support": True,
            "advanced_agents": True,
            "priority_support": False,
            "custom_integrations": False,
            "audit_logs": False
        }
    },
    {
        "name": "Professional",
        "slug": "professional",
        "description": "For growing teams with advanced needs",
        "price_monthly": Decimal('99'),
        "price_yearly": Decimal('990'),  # 2 months free
        "max_projects": 50,
        "max_members": 50,
        "max_api_calls_monthly": 100000,
        "max_specs_per_project": 200,
        "features": {
            "basic_agents": True,
            "spec_sync": True,
            "community_support": True,
            "advanced_agents": True,
            "priority_support": True,
            "custom_integrations": True,
            "audit_logs": True
        }
    },
    {
        "name": "Enterprise",
        "slug": "enterprise",
        "description": "For large organizations with custom requirements",
        "price_monthly": Decimal('299'),
        "price_yearly": Decimal('2990'),  # 2 months free
        "max_projects": -1,  # Unlimited
        "max_members": -1,   # Unlimited
        "max_api_calls_monthly": -1,  # Unlimited
        "max_specs_per_project": -1,  # Unlimited
        "features": {
            "basic_agents": True,
            "spec_sync": True,
            "community_support": True,
            "advanced_agents": True,
            "priority_support": True,
            "custom_integrations": True,
            "audit_logs": True,
            "dedicated_support": True,
            "custom_sla": True
        }
    }
]