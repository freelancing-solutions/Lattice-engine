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
    p_signature: str  # For webhook signature verification
    checkout: Optional[Dict[str, Any]] = None  # Checkout data
    subscription_payment_id: Optional[str] = None
    initial_payment: Optional[bool] = None
    instalments: Optional[int] = None
    order_id: Optional[str] = None
    balance_currency: Optional[str] = None
    balance_earnings: Optional[str] = None
    balance_fee: Optional[str] = None
    balance_gross: Optional[str] = None
    balance_tax: Optional[str] = None
    payment_method: Optional[str] = None
    payment_tax: Optional[str] = None
    plan_name: Optional[str] = None
    receipt_url: Optional[str] = None
    update_url: Optional[str] = None


class PaddleSubscriptionCreated(PaddleWebhook):
    """Webhook model for subscription_created event"""
    pass


class PaddleSubscriptionUpdated(PaddleWebhook):
    """Webhook model for subscription_updated event"""
    pass


class PaddleSubscriptionCancelled(PaddleWebhook):
    """Webhook model for subscription_cancelled event"""
    pass


class PaddlePaymentSuccess(PaddleWebhook):
    """Webhook model for subscription_payment_success event"""
    pass


class PaddlePaymentFailed(PaddleWebhook):
    """Webhook model for subscription_payment_failed event"""
    pass


class PaymentMethod(BaseModel):
    """Model for payment method information"""
    id: str
    type: str  # 'card' | 'paypal'
    last4: Optional[str] = None
    brand: Optional[str] = None  # 'visa', 'mastercard', 'amex', etc.
    expiry_month: Optional[int] = None
    expiry_year: Optional[int] = None
    is_default: bool = False