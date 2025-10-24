"""
Webhook delivery service for sending webhook events to registered URLs
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

import httpx
from sqlalchemy.orm import Session

from ..models.webhook_models import (
    WebhookTable, WebhookDeliveryTable, WebhookDeliveryStatus,
    Webhook, WebhookDelivery, generate_signature, get_event_display_name
)
from ..websocket.websocket_hub import WebSocketHub

logger = logging.getLogger(__name__)


class WebhookDeliveryService:
    """Service for delivering webhook events with retry logic"""

    def __init__(self, db: Session):
        self.db = db
        self.http_client = httpx.AsyncClient(timeout=30.0)
        self.websocket_hub = WebSocketHub()

    async def deliver_webhook(
        self,
        webhook_id: str,
        event_type: str,
        event_data: Dict[str, Any]
    ) -> WebhookDelivery:
        """
        Deliver a webhook event asynchronously

        Args:
            webhook_id: ID of the webhook to deliver to
            event_type: Type of event being delivered
            event_data: Event payload data

        Returns:
            WebhookDelivery record
        """
        try:
            # Get webhook
            webhook = self.db.query(WebhookTable).filter(
                WebhookTable.id == webhook_id
            ).first()

            if not webhook:
                raise ValueError(f"Webhook {webhook_id} not found")

            # Check if webhook is active and event is subscribed
            if not webhook.active:
                logger.warning(f"Webhook {webhook_id} is inactive, skipping delivery")
                return None

            if event_type not in webhook.events:
                logger.debug(f"Event {event_type} not subscribed by webhook {webhook_id}")
                return None

            # Create payload
            payload = {
                "event": event_type,
                "data": event_data,
                "timestamp": datetime.utcnow().isoformat()
            }

            # Generate signature
            payload_str = json.dumps(payload, separators=(',', ':'), sort_keys=True)
            signature = generate_signature(payload_str, webhook.secret)

            # Create delivery record
            delivery = WebhookDeliveryTable(
                webhook_id=webhook_id,
                event_type=event_type,
                payload=payload,
                status=WebhookDeliveryStatus.PENDING,
                attempts=0,
                max_attempts=3,
                created_at=datetime.utcnow()
            )

            self.db.add(delivery)
            self.db.commit()
            self.db.refresh(delivery)

            # Start delivery in background
            asyncio.create_task(
                self._send_with_retry(delivery.id, webhook, payload, signature)
            )

            logger.info(f"Queued webhook delivery {delivery.id} to {webhook.url}")

            return WebhookDelivery.from_orm(delivery)

        except Exception as e:
            logger.error(f"Failed to queue webhook delivery: {e}")
            raise

    async def _send_with_retry(
        self,
        delivery_id: str,
        webhook: WebhookTable,
        payload: Dict[str, Any],
        signature: str,
        max_attempts: int = 3
    ) -> None:
        """
        Send webhook with retry logic using exponential backoff

        Args:
            delivery_id: ID of the delivery record
            webhook: Webhook configuration
            payload: Payload to send
            signature: HMAC signature
            max_attempts: Maximum retry attempts
        """
        delivery = self.db.query(WebhookDeliveryTable).filter(
            WebhookDeliveryTable.id == delivery_id
        ).first()

        if not delivery:
            logger.error(f"Delivery {delivery_id} not found")
            return

        payload_str = json.dumps(payload, separators=(',', ':'), sort_keys=True)

        # Prepare headers
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "Lattice-Webhooks/1.0",
            "X-Webhook-Signature": f"sha256={signature}"
        }

        # Add custom headers
        if webhook.headers:
            headers.update(webhook.headers)

        retry_delays = [1, 2, 4]  # Exponential backoff: 1s, 2s, 4s

        for attempt in range(max_attempts):
            try:
                delivery.attempts = attempt + 1
                delivery.status = WebhookDeliveryStatus.RETRYING if attempt > 0 else WebhookDeliveryStatus.PENDING

                if attempt > 0:
                    delivery.next_retry_at = datetime.utcnow() + timedelta(seconds=retry_delays[attempt - 1])

                self.db.commit()

                # Make HTTP request
                response = await self.http_client.post(
                    webhook.url,
                    json=payload,
                    headers=headers,
                    timeout=30.0
                )

                # Update delivery with response
                delivery.response_status_code = response.status_code
                delivery.response_body = response.text[:5000]  # Limit response body size

                if response.status_code >= 200 and response.status_code < 300:
                    # Success
                    delivery.status = WebhookDeliveryStatus.SUCCESS
                    delivery.completed_at = datetime.utcnow()
                    delivery.next_retry_at = None

                    # Update webhook statistics
                    webhook.total_deliveries += 1
                    webhook.successful_deliveries += 1
                    webhook.last_triggered_at = datetime.utcnow()

                    self.db.commit()

                    logger.info(f"Webhook delivery {delivery_id} succeeded on attempt {attempt + 1}")

                    # Send WebSocket event for real-time updates
                    await self._send_websocket_event(
                        "webhook:delivery_success",
                        {
                            "webhookId": str(webhook.id),
                            "webhookName": webhook.name,
                            "eventType": delivery.event_type,
                            "deliveryId": str(delivery.id),
                            "attempts": delivery.attempts,
                            "timestamp": delivery.completed_at.isoformat()
                        },
                        str(webhook.organization_id)
                    )

                    return

                else:
                    # HTTP error
                    error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                    delivery.error_message = error_msg

                    if attempt < max_attempts - 1:
                        # Schedule retry
                        logger.warning(f"Webhook delivery {delivery_id} failed on attempt {attempt + 1}, retrying in {retry_delays[attempt]}s: {error_msg}")
                        await asyncio.sleep(retry_delays[attempt])
                    else:
                        # Max attempts reached
                        delivery.status = WebhookDeliveryStatus.FAILED
                        delivery.completed_at = datetime.utcnow()
                        delivery.next_retry_at = None

                        webhook.total_deliveries += 1
                        webhook.failed_deliveries += 1
                        webhook.last_triggered_at = datetime.utcnow()

                        self.db.commit()

                        logger.error(f"Webhook delivery {delivery_id} failed after {max_attempts} attempts: {error_msg}")

                        # Send WebSocket event for failure notification
                        await self._send_websocket_event(
                            "webhook:delivery_failed",
                            {
                                "webhookId": str(webhook.id),
                                "webhookName": webhook.name,
                                "eventType": delivery.event_type,
                                "deliveryId": str(delivery.id),
                                "attempts": delivery.attempts,
                                "error": error_msg,
                                "timestamp": delivery.completed_at.isoformat()
                            },
                            str(webhook.organization_id)
                        )

            except httpx.RequestError as e:
                # Network error
                error_msg = f"Network error: {str(e)}"
                delivery.error_message = error_msg

                if attempt < max_attempts - 1:
                    logger.warning(f"Webhook delivery {delivery_id} network error on attempt {attempt + 1}, retrying in {retry_delays[attempt]}s: {error_msg}")
                    await asyncio.sleep(retry_delays[attempt])
                else:
                    # Max attempts reached
                    delivery.status = WebhookDeliveryStatus.FAILED
                    delivery.completed_at = datetime.utcnow()
                    delivery.next_retry_at = None

                    webhook.total_deliveries += 1
                    webhook.failed_deliveries += 1
                    webhook.last_triggered_at = datetime.utcnow()

                    self.db.commit()

                    logger.error(f"Webhook delivery {delivery_id} failed after {max_attempts} attempts: {error_msg}")

                    await self._send_websocket_event(
                        "webhook:delivery_failed",
                        {
                            "webhookId": str(webhook.id),
                            "webhookName": webhook.name,
                            "eventType": delivery.event_type,
                            "deliveryId": str(delivery.id),
                            "attempts": delivery.attempts,
                            "error": error_msg,
                            "timestamp": delivery.completed_at.isoformat()
                        },
                        str(webhook.organization_id)
                    )

            except Exception as e:
                # Unexpected error
                error_msg = f"Unexpected error: {str(e)}"
                delivery.error_message = error_msg
                delivery.status = WebhookDeliveryStatus.FAILED
                delivery.completed_at = datetime.utcnow()
                delivery.next_retry_at = None

                webhook.total_deliveries += 1
                webhook.failed_deliveries += 1
                webhook.last_triggered_at = datetime.utcnow()

                self.db.commit()

                logger.error(f"Webhook delivery {delivery_id} failed with unexpected error: {error_msg}")

                await self._send_websocket_event(
                    "webhook:delivery_failed",
                    {
                        "webhookId": str(webhook.id),
                        "webhookName": webhook.name,
                        "eventType": delivery.event_type,
                        "deliveryId": str(delivery.id),
                        "attempts": delivery.attempts,
                        "error": error_msg,
                        "timestamp": delivery.completed_at.isoformat()
                    },
                    str(webhook.organization_id)
                )

                break

    async def test_webhook(self, webhook_id: str) -> WebhookDelivery:
        """
        Send a test webhook event immediately

        Args:
            webhook_id: ID of the webhook to test

        Returns:
            WebhookDelivery record for the test
        """
        try:
            # Get webhook
            webhook = self.db.query(WebhookTable).filter(
                WebhookTable.id == webhook_id
            ).first()

            if not webhook:
                raise ValueError(f"Webhook {webhook_id} not found")

            # Create test payload
            test_payload = {
                "event": "webhook.test",
                "data": {
                    "test": True,
                    "webhook_id": webhook_id,
                    "webhook_name": webhook.name,
                    "timestamp": datetime.utcnow().isoformat()
                },
                "timestamp": datetime.utcnow().isoformat()
            }

            # Create delivery record
            delivery = WebhookDeliveryTable(
                webhook_id=webhook_id,
                event_type="webhook.test",
                payload=test_payload,
                status=WebhookDeliveryStatus.PENDING,
                attempts=0,
                max_attempts=1,  # Only one attempt for tests
                created_at=datetime.utcnow()
            )

            self.db.add(delivery)
            self.db.commit()
            self.db.refresh(delivery)

            # Generate signature and deliver immediately
            payload_str = json.dumps(test_payload, separators=(',', ':'), sort_keys=True)
            signature = generate_signature(payload_str, webhook.secret)

            await self._send_with_retry(delivery.id, webhook, test_payload, signature, max_attempts=1)

            return WebhookDelivery.from_orm(delivery)

        except Exception as e:
            logger.error(f"Failed to test webhook {webhook_id}: {e}")
            raise

    def get_delivery_history(self, webhook_id: str, limit: int = 50) -> List[WebhookDelivery]:
        """
        Get delivery history for a webhook

        Args:
            webhook_id: ID of the webhook
            limit: Maximum number of deliveries to return

        Returns:
            List of webhook deliveries
        """
        try:
            deliveries = self.db.query(WebhookDeliveryTable).filter(
                WebhookDeliveryTable.webhook_id == webhook_id
            ).order_by(
                WebhookDeliveryTable.created_at.desc()
            ).limit(limit).all()

            return [WebhookDelivery.from_orm(delivery) for delivery in deliveries]

        except Exception as e:
            logger.error(f"Failed to get delivery history for webhook {webhook_id}: {e}")
            return []

    async def _send_websocket_event(self, event_type: str, data: Dict[str, Any], organization_id: str) -> None:
        """
        Send WebSocket event for real-time updates

        Args:
            event_type: Type of WebSocket event
            data: Event data
            organization_id: Organization ID to send to
        """
        try:
            await self.websocket_hub.send_to_organization(organization_id, {
                "type": event_type,
                "data": data,
                "timestamp": datetime.utcnow().isoformat()
            })
        except Exception as e:
            logger.warning(f"Failed to send WebSocket event {event_type}: {e}")

    async def close(self) -> None:
        """Close HTTP client"""
        await self.http_client.aclose()