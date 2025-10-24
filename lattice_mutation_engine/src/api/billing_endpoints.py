"""
Billing and invoice management endpoints for Lattice Engine

This module provides API endpoints for billing operations, invoice management,
and Paddle webhook processing.
"""

import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from src.models.subscription_models import Invoice, InvoiceTable, SubscriptionTable
from src.models.billing_models import (
    PaddleWebhook, PaddleSubscriptionCreated, PaddleSubscriptionUpdated,
    PaddleSubscriptionCancelled, PaddlePaymentSuccess, PaddlePaymentFailed,
    PaymentMethod
)
from src.core.database import get_db
from src.auth.middleware import get_current_user, TenantContext
from src.billing.paddle_service import get_paddle_service

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/billing", tags=["billing"])

# Response models
class PaymentMethodResponse(BaseModel):
    """Response model for payment methods"""
    payment_methods: List[PaymentMethod]

class CheckoutResponse(BaseModel):
    """Response model for payment method checkout"""
    checkout_url: str

class WebhookResponse(BaseModel):
    """Response model for webhook processing"""
    success: bool
    message: str

# Helper functions
def _invoice_to_dict(invoice: InvoiceTable) -> Dict[str, Any]:
    """Convert invoice to dictionary"""
    return {
        "id": str(invoice.id),
        "subscription_id": str(invoice.subscription_id),
        "paddle_invoice_id": invoice.paddle_invoice_id,
        "paddle_transaction_id": invoice.paddle_transaction_id,
        "invoice_number": invoice.invoice_number,
        "status": invoice.status,
        "amount_total": invoice.amount_total,
        "amount_subtotal": invoice.amount_subtotal,
        "amount_tax": invoice.amount_tax,
        "currency": invoice.currency,
        "invoice_date": invoice.invoice_date.isoformat(),
        "due_date": invoice.due_date.isoformat() if invoice.due_date else None,
        "paid_at": invoice.paid_at.isoformat() if invoice.paid_at else None,
        "paddle_data": invoice.paddle_data or {},
        "created_at": invoice.created_at.isoformat(),
        "updated_at": invoice.updated_at.isoformat()
    }

# Invoice endpoints
@router.get("/invoices", response_model=Dict[str, Any])
async def get_invoices(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get list of invoices for the organization"""
    try:
        # Get organization's subscription
        subscription = db.query(SubscriptionTable).filter(
            SubscriptionTable.organization_id == current_user.organization_id
        ).first()

        if not subscription:
            return {"items": [], "total": 0}

        # Query invoices with pagination
        query = db.query(InvoiceTable).filter(
            InvoiceTable.subscription_id == subscription.id
        ).order_by(desc(InvoiceTable.invoice_date))

        total = query.count()
        invoices = query.offset(offset).limit(limit).all()

        invoice_list = [_invoice_to_dict(invoice) for invoice in invoices]

        return {
            "items": invoice_list,
            "total": total
        }

    except Exception as e:
        logger.error(f"Error getting invoices: {e}")
        raise HTTPException(status_code=500, detail="Failed to get invoices")

@router.get("/invoices/{invoice_id}", response_model=Dict[str, Any])
async def get_invoice(
    invoice_id: str,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get a specific invoice by ID"""
    try:
        # Get invoice with subscription to verify ownership
        invoice = db.query(InvoiceTable).join(SubscriptionTable).filter(
            and_(
                InvoiceTable.id == invoice_id,
                SubscriptionTable.organization_id == current_user.organization_id
            )
        ).first()

        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")

        return _invoice_to_dict(invoice)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting invoice {invoice_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get invoice")

@router.get("/invoices/{invoice_id}/download")
async def download_invoice(
    invoice_id: str,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db),
    paddle_service=Depends(_get_paddle_service)
) -> RedirectResponse:
    """Download invoice PDF"""
    try:
        # Get invoice with subscription to verify ownership
        invoice = db.query(InvoiceTable).join(SubscriptionTable).filter(
            and_(
                InvoiceTable.id == invoice_id,
                SubscriptionTable.organization_id == current_user.organization_id
            )
        ).first()

        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")

        # Get invoice from Paddle
        paddle_invoice = await paddle_service.get_invoice(invoice.paddle_invoice_id)

        # Get PDF URL from paddle data
        pdf_url = paddle_invoice.get("download_url")
        if not pdf_url:
            raise HTTPException(status_code=404, detail="Invoice PDF not available")

        # Redirect to Paddle-hosted PDF
        return RedirectResponse(url=pdf_url)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading invoice {invoice_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to download invoice")

# Payment method endpoints
@router.get("/payment-methods", response_model=PaymentMethodResponse)
async def get_payment_methods(
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db),
    paddle_service=Depends(_get_paddle_service)
) -> PaymentMethodResponse:
    """Get payment methods for the organization"""
    try:
        # Get organization's subscription
        subscription = db.query(SubscriptionTable).filter(
            SubscriptionTable.organization_id == current_user.organization_id
        ).first()

        if not subscription or not subscription.paddle_customer_id:
            return PaymentMethodResponse(payment_methods=[])

        # Get payment methods from Paddle
        payment_methods = await paddle_service.get_payment_methods(
            subscription.paddle_customer_id
        )

        return PaymentMethodResponse(payment_methods=payment_methods)

    except Exception as e:
        logger.error(f"Error getting payment methods: {e}")
        raise HTTPException(status_code=500, detail="Failed to get payment methods")

@router.post("/payment-methods", response_model=CheckoutResponse)
async def add_payment_method(
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db),
    paddle_service=Depends(_get_paddle_service)
) -> CheckoutResponse:
    """Create checkout session for adding payment method"""
    try:
        # Get organization's subscription
        subscription = db.query(SubscriptionTable).filter(
            SubscriptionTable.organization_id == current_user.organization_id
        ).first()

        if not subscription:
            raise HTTPException(status_code=404, detail="No active subscription found")

        customer_id = subscription.paddle_customer_id
        if not customer_id:
            raise HTTPException(status_code=400, detail="No customer ID found")

        # Create checkout URL for payment method update
        # Note: Paddle handles payment method updates through customer portal
        # This is a simplified implementation
        success_url = f"{engine_config.user_dashboard_url}/settings/billing?payment_method_added=true"
        cancel_url = f"{engine_config.user_dashboard_url}/settings/billing?payment_method_cancelled=true"

        # For now, we'll return a placeholder URL
        # In production, you'd use Paddle's customer portal API
        checkout_url = f"https://checkout.paddle.com/subscription/update?subscription_id={subscription.paddle_subscription_id}"

        return CheckoutResponse(checkout_url=checkout_url)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating payment method checkout: {e}")
        raise HTTPException(status_code=500, detail="Failed to create payment method checkout")

# Webhook endpoint (no authentication required)
@router.post("/webhooks/paddle", response_model=WebhookResponse)
async def paddle_webhook(
    request: Request,
    db: Session = Depends(get_db),
    paddle_service=Depends(_get_paddle_service)
) -> WebhookResponse:
    """Process Paddle webhooks"""
    try:
        # Get raw request body and signature
        body = await request.body()
        form_data = await request.form()
        signature = form_data.get("p_signature")

        if not signature:
            logger.error("Missing Paddle webhook signature")
            return WebhookResponse(success=False, message="Missing signature")

        # Verify webhook signature
        if not paddle_service.verify_webhook_signature(body, signature):
            logger.error("Invalid Paddle webhook signature")
            return WebhookResponse(success=False, message="Invalid signature")

        # Parse webhook data
        webhook_data = json.loads(body.decode('utf-8'))
        alert_name = webhook_data.get("alert_name")

        logger.info(f"Received Paddle webhook: {alert_name}")

        # Route to appropriate handler
        if alert_name == "subscription_created":
            await _handle_subscription_created(webhook_data, db)
        elif alert_name == "subscription_updated":
            await _handle_subscription_updated(webhook_data, db)
        elif alert_name == "subscription_cancelled":
            await _handle_subscription_cancelled(webhook_data, db)
        elif alert_name == "subscription_payment_succeeded":
            await _handle_payment_success(webhook_data, db)
        elif alert_name == "subscription_payment_failed":
            await _handle_payment_failed(webhook_data, db)
        else:
            logger.warning(f"Unhandled webhook event: {alert_name}")

        return WebhookResponse(success=True, message="Webhook processed")

    except Exception as e:
        logger.error(f"Error processing Paddle webhook: {e}")
        return WebhookResponse(success=False, message="Processing failed")

# Webhook handlers
async def _handle_subscription_created(webhook_data: Dict[str, Any], db: Session):
    """Handle subscription_created webhook"""
    try:
        subscription_id = webhook_data.get("subscription_id")
        customer_id = webhook_data.get("customer_id")
        plan_id = webhook_data.get("subscription_plan_id")
        status = webhook_data.get("status")

        if not all([subscription_id, customer_id]):
            logger.error("Missing required fields in subscription_created webhook")
            return

        # Find subscription by paddle ID
        subscription = db.query(SubscriptionTable).filter(
            SubscriptionTable.paddle_subscription_id == subscription_id
        ).first()

        if subscription:
            # Update existing subscription
            subscription.paddle_customer_id = customer_id
            subscription.status = status
            subscription.paddle_data = webhook_data
            subscription.updated_at = datetime.utcnow()
        else:
            logger.warning(f"Subscription {subscription_id} not found in database")
            return

        db.commit()
        logger.info(f"Updated subscription {subscription_id} from webhook")

    except Exception as e:
        logger.error(f"Error handling subscription_created webhook: {e}")
        db.rollback()

async def _handle_subscription_updated(webhook_data: Dict[str, Any], db: Session):
    """Handle subscription_updated webhook"""
    try:
        subscription_id = webhook_data.get("subscription_id")
        status = webhook_data.get("status")

        if not subscription_id:
            logger.error("Missing subscription_id in subscription_updated webhook")
            return

        subscription = db.query(SubscriptionTable).filter(
            SubscriptionTable.paddle_subscription_id == subscription_id
        ).first()

        if subscription:
            subscription.status = status
            subscription.paddle_data = webhook_data
            subscription.updated_at = datetime.utcnow()
            db.commit()
            logger.info(f"Updated subscription {subscription_id} status to {status}")

    except Exception as e:
        logger.error(f"Error handling subscription_updated webhook: {e}")
        db.rollback()

async def _handle_subscription_cancelled(webhook_data: Dict[str, Any], db: Session):
    """Handle subscription_cancelled webhook"""
    try:
        subscription_id = webhook_data.get("subscription_id")

        if not subscription_id:
            logger.error("Missing subscription_id in subscription_cancelled webhook")
            return

        subscription = db.query(SubscriptionTable).filter(
            SubscriptionTable.paddle_subscription_id == subscription_id
        ).first()

        if subscription:
            subscription.status = "cancelled"
            subscription.cancel_at_period_end = True
            subscription.cancelled_at = datetime.utcnow()
            subscription.paddle_data = webhook_data
            subscription.updated_at = datetime.utcnow()
            db.commit()
            logger.info(f"Cancelled subscription {subscription_id}")

    except Exception as e:
        logger.error(f"Error handling subscription_cancelled webhook: {e}")
        db.rollback()

async def _handle_payment_success(webhook_data: Dict[str, Any], db: Session):
    """Handle subscription_payment_succeeded webhook"""
    try:
        subscription_id = webhook_data.get("subscription_id")
        invoice_id = webhook_data.get("invoice_id")
        amount = webhook_data.get("amount")
        currency = webhook_data.get("currency")

        if not all([subscription_id, invoice_id]):
            logger.error("Missing required fields in payment_success webhook")
            return

        subscription = db.query(SubscriptionTable).filter(
            SubscriptionTable.paddle_subscription_id == subscription_id
        ).first()

        if subscription:
            # Update subscription status
            subscription.status = "active"
            subscription.paddle_data = webhook_data
            subscription.updated_at = datetime.utcnow()

            # Create or update invoice record
            invoice = db.query(InvoiceTable).filter(
                InvoiceTable.paddle_invoice_id == invoice_id
            ).first()

            if invoice:
                invoice.status = "paid"
                invoice.paid_at = datetime.utcnow()
                invoice.paddle_data = webhook_data
                invoice.updated_at = datetime.utcnow()
            else:
                invoice = InvoiceTable(
                    subscription_id=subscription.id,
                    paddle_invoice_id=invoice_id,
                    invoice_number=invoice_id,  # Use paddle ID as number for now
                    status="paid",
                    amount_total=float(amount),
                    amount_subtotal=float(amount),
                    amount_tax=0.0,
                    currency=currency,
                    invoice_date=datetime.utcnow(),
                    paid_at=datetime.utcnow(),
                    paddle_data=webhook_data
                )
                db.add(invoice)

            db.commit()
            logger.info(f"Processed successful payment for subscription {subscription_id}")

    except Exception as e:
        logger.error(f"Error handling payment_success webhook: {e}")
        db.rollback()

async def _handle_payment_failed(webhook_data: Dict[str, Any], db: Session):
    """Handle subscription_payment_failed webhook"""
    try:
        subscription_id = webhook_data.get("subscription_id")

        if not subscription_id:
            logger.error("Missing subscription_id in payment_failed webhook")
            return

        subscription = db.query(SubscriptionTable).filter(
            SubscriptionTable.paddle_subscription_id == subscription_id
        ).first()

        if subscription:
            subscription.status = "past_due"
            subscription.paddle_data = webhook_data
            subscription.updated_at = datetime.utcnow()
            db.commit()
            logger.warning(f"Payment failed for subscription {subscription_id}")

    except Exception as e:
        logger.error(f"Error handling payment_failed webhook: {e}")
        db.rollback()