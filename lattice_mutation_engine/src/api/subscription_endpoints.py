"""
Subscription management endpoints for Lattice Engine

This module provides API endpoints for managing subscriptions, plans,
and usage metrics with Paddle.com integration.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import and_

from src.models.subscription_models import (
    Plan, Subscription, SubscriptionCreate, SubscriptionUpdate,
    SubscriptionWithPlan, PlanTable, SubscriptionTable
)
from src.core.database import get_db
from src.auth.middleware import get_current_user, TenantContext
from src.billing.paddle_service import get_paddle_service
from src.billing.usage_tracker import UsageTracker
from src.config.settings import config as engine_config

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])

# Response models
class CheckoutSessionResponse(BaseModel):
    """Response model for checkout session creation"""
    checkout_url: str

class UpdateSubscriptionRequest(BaseModel):
    """Request model for updating subscription"""
    plan_id: str
    addons: Optional[List[str]] = None

class CreateCheckoutRequest(BaseModel):
    """Request model for creating checkout session"""
    plan_id: str
    billing_interval: str  # 'monthly' or 'yearly'

class UsageResponse(BaseModel):
    """Response model for usage metrics"""
    current: Dict[str, Any]
    history: List[Dict[str, Any]]

class CancelSubscriptionResponse(BaseModel):
    """Response model for subscription cancellation"""
    success: bool
    message: str

# Helper functions
def _get_paddle_service():
    """Get Paddle service instance"""
    return get_paddle_service()

def _get_usage_tracker(db: Session) -> UsageTracker:
    """Get usage tracker instance"""
    return UsageTracker(db)

def _subscription_to_dict(subscription: SubscriptionTable, plan: PlanTable) -> Dict[str, Any]:
    """Convert subscription and plan to dictionary"""
    return {
        "id": str(subscription.id),
        "organization_id": str(subscription.organization_id),
        "plan_id": str(subscription.plan_id),
        "paddle_subscription_id": subscription.paddle_subscription_id,
        "paddle_customer_id": subscription.paddle_customer_id,
        "status": subscription.status,
        "billing_interval": subscription.billing_interval,
        "current_period_start": subscription.current_period_start.isoformat() if subscription.current_period_start else None,
        "current_period_end": subscription.current_period_end.isoformat() if subscription.current_period_end else None,
        "trial_start": subscription.trial_start.isoformat() if subscription.trial_start else None,
        "trial_end": subscription.trial_end.isoformat() if subscription.trial_end else None,
        "cancel_at_period_end": subscription.cancel_at_period_end,
        "cancelled_at": subscription.cancelled_at.isoformat() if subscription.cancelled_at else None,
        "paddle_data": subscription.paddle_data or {},
        "created_at": subscription.created_at.isoformat(),
        "updated_at": subscription.updated_at.isoformat(),
        "plan": {
            "id": str(plan.id),
            "name": plan.name,
            "slug": plan.slug,
            "description": plan.description,
            "price_monthly": plan.price_monthly,
            "price_yearly": plan.price_yearly,
            "max_projects": plan.max_projects,
            "max_members": plan.max_members,
            "max_api_calls_monthly": plan.max_api_calls_monthly,
            "max_specs_per_project": plan.max_specs_per_project,
            "features": plan.features or {},
            "is_active": plan.is_active,
            "created_at": plan.created_at.isoformat(),
            "updated_at": plan.updated_at.isoformat()
        }
    }

# Subscription endpoints
@router.get("/current", response_model=Dict[str, Any])
async def get_current_subscription(
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get current subscription for the organization"""
    try:
        # Get subscription with plan details
        subscription = db.query(SubscriptionTable).join(PlanTable).filter(
            SubscriptionTable.organization_id == current_user.organization_id
        ).first()

        if not subscription:
            raise HTTPException(status_code=404, detail="No active subscription found")

        return _subscription_to_dict(subscription, subscription.plan)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current subscription: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/current", response_model=Dict[str, Any])
async def update_current_subscription(
    request: UpdateSubscriptionRequest,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db),
    paddle_service=Depends(_get_paddle_service)
) -> Dict[str, Any]:
    """Update current subscription (plan change)"""
    try:
        # Get current subscription
        subscription = db.query(SubscriptionTable).filter(
            SubscriptionTable.organization_id == current_user.organization_id
        ).first()

        if not subscription:
            raise HTTPException(status_code=404, detail="No active subscription found")

        # Update via Paddle
        paddle_result = await paddle_service.update_subscription(
            subscription.paddle_subscription_id,
            request.plan_id
        )

        # Update local subscription record
        subscription.plan_id = request.plan_id
        subscription.updated_at = datetime.utcnow()
        subscription.paddle_data = paddle_result
        db.commit()
        db.refresh(subscription)

        # Get updated subscription with plan
        updated_subscription = db.query(SubscriptionTable).join(PlanTable).filter(
            SubscriptionTable.id == subscription.id
        ).first()

        logger.info(f"Updated subscription {subscription.id} to plan {request.plan_id}")

        return _subscription_to_dict(updated_subscription, updated_subscription.plan)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating subscription: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update subscription")

@router.post("/checkout", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    request: CreateCheckoutRequest,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db),
    paddle_service=Depends(_get_paddle_service)
) -> CheckoutSessionResponse:
    """Create a checkout session for plan upgrade/new subscription"""
    try:
        # Get or create Paddle customer
        subscription = db.query(SubscriptionTable).filter(
            SubscriptionTable.organization_id == current_user.organization_id
        ).first()

        customer_id = subscription.paddle_customer_id if subscription else None

        if not customer_id:
            # Create new customer
            customer_id = await paddle_service.create_customer(
                current_user.user.email,
                str(current_user.organization_id)
            )

        # Create checkout URLs
        success_url = f"{engine_config.user_dashboard_url}/settings/billing?success=true"
        cancel_url = f"{engine_config.user_dashboard_url}/settings/billing?cancelled=true"

        checkout_url = await paddle_service.create_checkout_session(
            customer_id=customer_id,
            plan_id=request.plan_id,
            success_url=success_url,
            cancel_url=cancel_url
        )

        logger.info(f"Created checkout session for organization {current_user.organization_id}")

        return CheckoutSessionResponse(checkout_url=checkout_url)

    except Exception as e:
        logger.error(f"Error creating checkout session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")

@router.get("/usage", response_model=UsageResponse)
async def get_subscription_usage(
    period: str = Query("30d", description="Period: 1d, 7d, 30d"),
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db),
    usage_tracker=Depends(_get_usage_tracker)
) -> UsageResponse:
    """Get usage metrics for the subscription"""
    try:
        # Get subscription
        subscription = db.query(SubscriptionTable).filter(
            SubscriptionTable.organization_id == current_user.organization_id
        ).first()

        if not subscription:
            raise HTTPException(status_code=404, detail="No active subscription found")

        # Parse period
        if period == "1d":
            days = 1
        elif period == "7d":
            days = 7
        else:
            days = 30

        # Get current usage
        current_usage = usage_tracker.get_current_usage(str(subscription.id))

        # Get usage history
        history = usage_tracker.get_usage_history(str(subscription.id), days)

        # Add plan limits for comparison
        plan = db.query(PlanTable).filter(PlanTable.id == subscription.plan_id).first()

        usage_with_limits = current_usage.copy()
        if plan:
            usage_with_limits["limits"] = {
                "max_projects": plan.max_projects,
                "max_members": plan.max_members,
                "max_api_calls_monthly": plan.max_api_calls_monthly,
                "max_specs_per_project": plan.max_specs_per_project
            }

        return UsageResponse(
            current=usage_with_limits,
            history=history
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting usage metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get usage metrics")

@router.get("/plans", response_model=List[Dict[str, Any]])
async def get_available_plans(
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get list of available plans"""
    try:
        plans = db.query(PlanTable).filter(PlanTable.is_active == True).all()

        plan_list = []
        for plan in plans:
            plan_dict = {
                "id": str(plan.id),
                "name": plan.name,
                "slug": plan.slug,
                "description": plan.description,
                "price_monthly": plan.price_monthly,
                "price_yearly": plan.price_yearly,
                "max_projects": plan.max_projects,
                "max_members": plan.max_members,
                "max_api_calls_monthly": plan.max_api_calls_monthly,
                "max_specs_per_project": plan.max_specs_per_project,
                "features": plan.features or {},
                "is_active": plan.is_active,
                "created_at": plan.created_at.isoformat(),
                "updated_at": plan.updated_at.isoformat()
            }
            plan_list.append(plan_dict)

        return plan_list

    except Exception as e:
        logger.error(f"Error getting plans: {e}")
        raise HTTPException(status_code=500, detail="Failed to get plans")

@router.post("/cancel", response_model=CancelSubscriptionResponse)
async def cancel_current_subscription(
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db),
    paddle_service=Depends(_get_paddle_service)
) -> CancelSubscriptionResponse:
    """Cancel current subscription (at period end)"""
    try:
        # Get subscription
        subscription = db.query(SubscriptionTable).filter(
            SubscriptionTable.organization_id == current_user.organization_id
        ).first()

        if not subscription:
            raise HTTPException(status_code=404, detail="No active subscription found")

        # Cancel via Paddle
        await paddle_service.cancel_subscription(
            subscription.paddle_subscription_id,
            cancel_at_period_end=True
        )

        # Update local subscription
        subscription.cancel_at_period_end = True
        subscription.cancelled_at = datetime.utcnow()
        subscription.updated_at = datetime.utcnow()
        db.commit()

        logger.info(f"Cancelled subscription {subscription.id} at period end")

        return CancelSubscriptionResponse(
            success=True,
            message="Subscription will be cancelled at the end of the current billing period"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling subscription: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to cancel subscription")