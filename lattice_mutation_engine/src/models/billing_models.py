"""
Billing and subscription models for Paddle.com integration.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
import uuid


class PaddleEventType(str, Enum):
    SUBSCRIPTION_CREATED = "subscription_created"
    SUBSCRIPTION_UPDATED = "subscription_updated"
    SUBSCRIPTION_CANCELLED = "subscription_cancelled"
    SUBSCRIPTION_PAYMENT_SUCCESS = "subscription_payment_success"
    SUBSCRIPTION_PAYMENT_FAILED = "subscription_payment_failed"


class PaddleWebhook(BaseModel):
    """Model for incoming Paddle webhooks"""
    alert_id: str
    alert_name: PaddleEventType
    cancel_url: Optional[str] = None
    checkout_id: Optional[str] = None
    currency: Optional[str] = None
    customer_name: Optional[str] = None
    email: Optional[str] = None
    event_time: datetime
    marketing_consent: Optional[bool] = None
    next_bill_date: Optional[str] = None
    passthrough: Optional[str] = None  # JSON string with our custom data
    quantity: Optional[int] = None
    status: Optional[str] = None
    subscription_id: Optional[str] = None
    subscription_plan_id: Optional[str] = None
    unit_price: Optional[str] = None
    user_id: Optional[str] = None
    
    #