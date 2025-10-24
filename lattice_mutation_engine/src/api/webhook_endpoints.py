"""
FastAPI router for webhook management endpoints
"""

import secrets
from datetime import datetime
from typing import Dict, Any, Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from ..core.database import get_db
from ..auth.middleware import get_current_user, TenantContext
from ..models.webhook_models import (
    Webhook, WebhookCreate, WebhookUpdate, WebhookTable,
    WebhookDelivery, WebhookDeliveryTable
)
from ..webhooks.delivery_service import WebhookDeliveryService

router = APIRouter(prefix="/api/v1/webhooks", tags=["webhooks"])


def _webhook_to_dict(webhook: WebhookTable) -> Dict[str, Any]:
    """Convert WebhookTable to dictionary for API response"""
    return {
        "id": str(webhook.id),
        "organization_id": str(webhook.organization_id),
        "name": webhook.name,
        "url": webhook.url,
        "events": webhook.events,
        "secret": webhook.secret,  # Note: In production, consider not returning the secret
        "active": webhook.active,
        "headers": webhook.headers,
        "created_by": str(webhook.created_by),
        "created_at": webhook.created_at.isoformat(),
        "updated_at": webhook.updated_at.isoformat(),
        "last_triggered_at": webhook.last_triggered_at.isoformat() if webhook.last_triggered_at else None,
        "total_deliveries": webhook.total_deliveries,
        "successful_deliveries": webhook.successful_deliveries,
        "failed_deliveries": webhook.failed_deliveries
    }


def _delivery_to_dict(delivery: WebhookDeliveryTable) -> Dict[str, Any]:
    """Convert WebhookDeliveryTable to dictionary for API response"""
    return {
        "id": str(delivery.id),
        "webhook_id": str(delivery.webhook_id),
        "event_type": delivery.event_type,
        "payload": delivery.payload,
        "status": delivery.status,
        "attempts": delivery.attempts,
        "max_attempts": delivery.max_attempts,
        "response_status_code": delivery.response_status_code,
        "response_body": delivery.response_body,
        "error_message": delivery.error_message,
        "created_at": delivery.created_at.isoformat(),
        "completed_at": delivery.completed_at.isoformat() if delivery.completed_at else None,
        "next_retry_at": delivery.next_retry_at.isoformat() if delivery.next_retry_at else None
    }


@router.post("/", response_model=Webhook)
async def create_webhook(
    webhook_data: WebhookCreate,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new webhook
    """
    try:
        # Generate secret if not provided
        if not webhook_data.secret:
            webhook_data.secret = secrets.token_urlsafe(32)

        # Create webhook record
        webhook = WebhookTable(
            organization_id=current_user.organization_id,
            name=webhook_data.name,
            url=webhook_data.url,
            events=webhook_data.events,
            secret=webhook_data.secret,
            active=webhook_data.active,
            headers=webhook_data.headers,
            created_by=current_user.user_id
        )

        db.add(webhook)
        db.commit()
        db.refresh(webhook)

        return Webhook.from_orm(webhook)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
async def list_webhooks(
    active: Optional[bool] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List webhooks for the current organization
    """
    try:
        query = db.query(WebhookTable).filter(
            WebhookTable.organization_id == current_user.organization_id
        )

        # Apply filters
        if active is not None:
            query = query.filter(WebhookTable.active == active)

        # Get total count
        total = query.count()

        # Apply pagination and ordering
        webhooks = query.order_by(desc(WebhookTable.created_at)).offset(offset).limit(limit).all()

        return {
            "items": [_webhook_to_dict(webhook) for webhook in webhooks],
            "total": total
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{webhook_id}", response_model=Webhook)
async def get_webhook(
    webhook_id: str,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific webhook
    """
    try:
        webhook = db.query(WebhookTable).filter(
            and_(
                WebhookTable.id == webhook_id,
                WebhookTable.organization_id == current_user.organization_id
            )
        ).first()

        if not webhook:
            raise HTTPException(status_code=404, detail="Webhook not found")

        return Webhook.from_orm(webhook)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{webhook_id}", response_model=Webhook)
async def update_webhook(
    webhook_id: str,
    webhook_data: WebhookUpdate,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a webhook
    """
    try:
        webhook = db.query(WebhookTable).filter(
            and_(
                WebhookTable.id == webhook_id,
                WebhookTable.organization_id == current_user.organization_id
            )
        ).first()

        if not webhook:
            raise HTTPException(status_code=404, detail="Webhook not found")

        # Update fields
        update_data = webhook_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(webhook, field, value)

        webhook.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(webhook)

        return Webhook.from_orm(webhook)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{webhook_id}")
async def delete_webhook(
    webhook_id: str,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a webhook
    """
    try:
        webhook = db.query(WebhookTable).filter(
            and_(
                WebhookTable.id == webhook_id,
                WebhookTable.organization_id == current_user.organization_id
            )
        ).first()

        if not webhook:
            raise HTTPException(status_code=404, detail="Webhook not found")

        # Delete webhook (cascade will delete deliveries)
        db.delete(webhook)
        db.commit()

        return {"success": True, "message": "Webhook deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{webhook_id}/test", response_model=WebhookDelivery)
async def test_webhook(
    webhook_id: str,
    background_tasks: BackgroundTasks,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db),
    delivery_service: WebhookDeliveryService = Depends(get_webhook_delivery_service)
):
    """
    Test a webhook by sending a test event
    """
    try:
        # Verify webhook ownership
        webhook = db.query(WebhookTable).filter(
            and_(
                WebhookTable.id == webhook_id,
                WebhookTable.organization_id == current_user.organization_id
            )
        ).first()

        if not webhook:
            raise HTTPException(status_code=404, detail="Webhook not found")

        # Send test webhook
        delivery = await delivery_service.test_webhook(webhook_id)

        return delivery

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{webhook_id}/deliveries")
async def get_webhook_deliveries(
    webhook_id: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db),
    delivery_service: WebhookDeliveryService = Depends(get_webhook_delivery_service)
):
    """
    Get delivery history for a webhook
    """
    try:
        # Verify webhook ownership
        webhook = db.query(WebhookTable).filter(
            and_(
                WebhookTable.id == webhook_id,
                WebhookTable.organization_id == current_user.organization_id
            )
        ).first()

        if not webhook:
            raise HTTPException(status_code=404, detail="Webhook not found")

        # Get delivery history
        deliveries = delivery_service.get_delivery_history(webhook_id, limit)

        # Get total count
        total = db.query(WebhookDeliveryTable).filter(
            WebhookDeliveryTable.webhook_id == webhook_id
        ).count()

        return {
            "items": [_delivery_to_dict(delivery) for delivery in deliveries],
            "total": total
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Dependency for webhook delivery service
def get_webhook_delivery_service(db: Session = Depends(get_db)) -> WebhookDeliveryService:
    """Get webhook delivery service instance"""
    return WebhookDeliveryService(db)