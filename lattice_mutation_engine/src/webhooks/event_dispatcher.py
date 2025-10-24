"""
Event dispatcher to trigger webhooks when domain events occur
"""

import asyncio
import logging
from typing import Dict, Any, List

from sqlalchemy.orm import Session

from ..models.webhook_models import WebhookTable, WebhookEventType
from ..webhooks.delivery_service import WebhookDeliveryService

logger = logging.getLogger(__name__)


class WebhookEventDispatcher:
    """
    Dispatcher for webhook events that are triggered by domain events.

    This class provides methods to dispatch webhook events when specific
    domain events occur in the system (mutations, deployments, approvals, etc.).
    """

    def __init__(self, db: Session, delivery_service: WebhookDeliveryService):
        """
        Initialize the webhook event dispatcher

        Args:
            db: Database session
            delivery_service: Webhook delivery service for sending events
        """
        self.db = db
        self.delivery_service = delivery_service

    async def dispatch_event(
        self,
        event_type: str,
        event_data: Dict[str, Any],
        organization_id: str
    ) -> None:
        """
        Dispatch a webhook event to all matching webhooks

        Args:
            event_type: Type of event being dispatched
            event_data: Event payload data
            organization_id: Organization to dispatch events for
        """
        try:
            # Find all active webhooks for this organization that are subscribed to this event
            webhooks = self.db.query(WebhookTable).filter(
                WebhookTable.organization_id == organization_id,
                WebhookTable.active == True,
                WebhookTable.events.contains([event_type])
            ).all()

            if not webhooks:
                logger.debug(f"No webhooks found for event {event_type} in organization {organization_id}")
                return

            logger.info(f"Dispatching {event_type} event to {len(webhooks)} webhooks for organization {organization_id}")

            # Create delivery tasks for all matching webhooks
            delivery_tasks = []
            for webhook in webhooks:
                task = asyncio.create_task(
                    self.delivery_service.deliver_webhook(
                        webhook_id=str(webhook.id),
                        event_type=event_type,
                        event_data=event_data
                    )
                )
                delivery_tasks.append(task)

            # Wait for all deliveries to be queued (not necessarily completed)
            if delivery_tasks:
                await asyncio.gather(*delivery_tasks, return_exceptions=True)

            logger.info(f"Queued {len(delivery_tasks)} webhook deliveries for event {event_type}")

        except Exception as e:
            logger.error(f"Failed to dispatch webhook event {event_type}: {e}")

    async def dispatch_mutation_created(
        self,
        mutation_id: str,
        mutation_data: Dict[str, Any],
        organization_id: str
    ) -> None:
        """
        Dispatch mutation.created event

        Args:
            mutation_id: ID of the created mutation
            mutation_data: Mutation data
            organization_id: Organization ID
        """
        await self.dispatch_event(
            event_type=WebhookEventType.MUTATION_CREATED,
            event_data={
                "mutation_id": mutation_id,
                "mutation": mutation_data,
                "action": "created"
            },
            organization_id=organization_id
        )

    async def dispatch_mutation_approved(
        self,
        mutation_id: str,
        mutation_data: Dict[str, Any],
        organization_id: str
    ) -> None:
        """
        Dispatch mutation.approved event

        Args:
            mutation_id: ID of the approved mutation
            mutation_data: Mutation data
            organization_id: Organization ID
        """
        await self.dispatch_event(
            event_type=WebhookEventType.MUTATION_APPROVED,
            event_data={
                "mutation_id": mutation_id,
                "mutation": mutation_data,
                "action": "approved"
            },
            organization_id=organization_id
        )

    async def dispatch_mutation_deployed(
        self,
        mutation_id: str,
        mutation_data: Dict[str, Any],
        organization_id: str
    ) -> None:
        """
        Dispatch mutation.deployed event

        Args:
            mutation_id: ID of the deployed mutation
            mutation_data: Mutation data
            organization_id: Organization ID
        """
        await self.dispatch_event(
            event_type=WebhookEventType.MUTATION_DEPLOYED,
            event_data={
                "mutation_id": mutation_id,
                "mutation": mutation_data,
                "action": "deployed"
            },
            organization_id=organization_id
        )

    async def dispatch_mutation_rejected(
        self,
        mutation_id: str,
        mutation_data: Dict[str, Any],
        organization_id: str
    ) -> None:
        """
        Dispatch mutation.rejected event

        Args:
            mutation_id: ID of the rejected mutation
            mutation_data: Mutation data
            organization_id: Organization ID
        """
        await self.dispatch_event(
            event_type=WebhookEventType.MUTATION_REJECTED,
            event_data={
                "mutation_id": mutation_id,
                "mutation": mutation_data,
                "action": "rejected"
            },
            organization_id=organization_id
        )

    async def dispatch_deployment_created(
        self,
        deployment_id: str,
        deployment_data: Dict[str, Any],
        organization_id: str
    ) -> None:
        """
        Dispatch deployment.created event

        Args:
            deployment_id: ID of the created deployment
            deployment_data: Deployment data
            organization_id: Organization ID
        """
        await self.dispatch_event(
            event_type=WebhookEventType.DEPLOYMENT_CREATED,
            event_data={
                "deployment_id": deployment_id,
                "deployment": deployment_data,
                "action": "created"
            },
            organization_id=organization_id
        )

    async def dispatch_deployment_completed(
        self,
        deployment_id: str,
        deployment_data: Dict[str, Any],
        organization_id: str
    ) -> None:
        """
        Dispatch deployment.completed event

        Args:
            deployment_id: ID of the completed deployment
            deployment_data: Deployment data
            organization_id: Organization ID
        """
        await self.dispatch_event(
            event_type=WebhookEventType.DEPLOYMENT_COMPLETED,
            event_data={
                "deployment_id": deployment_id,
                "deployment": deployment_data,
                "action": "completed"
            },
            organization_id=organization_id
        )

    async def dispatch_deployment_failed(
        self,
        deployment_id: str,
        deployment_data: Dict[str, Any],
        organization_id: str
    ) -> None:
        """
        Dispatch deployment.failed event

        Args:
            deployment_id: ID of the failed deployment
            deployment_data: Deployment data
            organization_id: Organization ID
        """
        await self.dispatch_event(
            event_type=WebhookEventType.DEPLOYMENT_FAILED,
            event_data={
                "deployment_id": deployment_id,
                "deployment": deployment_data,
                "action": "failed"
            },
            organization_id=organization_id
        )

    async def dispatch_approval_requested(
        self,
        approval_id: str,
        approval_data: Dict[str, Any],
        organization_id: str
    ) -> None:
        """
        Dispatch approval.requested event

        Args:
            approval_id: ID of the requested approval
            approval_data: Approval data
            organization_id: Organization ID
        """
        await self.dispatch_event(
            event_type=WebhookEventType.APPROVAL_REQUESTED,
            event_data={
                "approval_id": approval_id,
                "approval": approval_data,
                "action": "requested"
            },
            organization_id=organization_id
        )

    async def dispatch_approval_responded(
        self,
        approval_id: str,
        approval_data: Dict[str, Any],
        organization_id: str
    ) -> None:
        """
        Dispatch approval.responded event

        Args:
            approval_id: ID of the responded approval
            approval_data: Approval data
            organization_id: Organization ID
        """
        await self.dispatch_event(
            event_type=WebhookEventType.APPROVAL_RESPONDED,
            event_data={
                "approval_id": approval_id,
                "approval": approval_data,
                "action": "responded"
            },
            organization_id=organization_id
        )

    async def dispatch_spec_created(
        self,
        spec_id: str,
        spec_data: Dict[str, Any],
        organization_id: str
    ) -> None:
        """
        Dispatch spec.created event

        Args:
            spec_id: ID of the created spec
            spec_data: Spec data
            organization_id: Organization ID
        """
        await self.dispatch_event(
            event_type=WebhookEventType.SPEC_CREATED,
            event_data={
                "spec_id": spec_id,
                "spec": spec_data,
                "action": "created"
            },
            organization_id=organization_id
        )

    async def dispatch_spec_updated(
        self,
        spec_id: str,
        spec_data: Dict[str, Any],
        organization_id: str
    ) -> None:
        """
        Dispatch spec.updated event

        Args:
            spec_id: ID of the updated spec
            spec_data: Spec data
            organization_id: Organization ID
        """
        await self.dispatch_event(
            event_type=WebhookEventType.SPEC_UPDATED,
            event_data={
                "spec_id": spec_id,
                "spec": spec_data,
                "action": "updated"
            },
            organization_id=organization_id
        )

    async def dispatch_task_completed(
        self,
        task_id: str,
        task_data: Dict[str, Any],
        organization_id: str
    ) -> None:
        """
        Dispatch task.completed event

        Args:
            task_id: ID of the completed task
            task_data: Task data
            organization_id: Organization ID
        """
        await self.dispatch_event(
            event_type=WebhookEventType.TASK_COMPLETED,
            event_data={
                "task_id": task_id,
                "task": task_data,
                "action": "completed"
            },
            organization_id=organization_id
        )

    def get_webhook_statistics(self, organization_id: str) -> Dict[str, Any]:
        """
        Get webhook statistics for an organization

        Args:
            organization_id: Organization ID

        Returns:
            Dictionary with webhook statistics
        """
        try:
            total_webhooks = self.db.query(WebhookTable).filter(
                WebhookTable.organization_id == organization_id
            ).count()

            active_webhooks = self.db.query(WebhookTable).filter(
                WebhookTable.organization_id == organization_id,
                WebhookTable.active == True
            ).count()

            total_deliveries = self.db.query(WebhookTable).filter(
                WebhookTable.organization_id == organization_id
            ).with_entities(WebhookTable.total_deliveries).all()

            total_deliveries_count = sum([delivery.total_deliveries for delivery in total_deliveries])

            successful_deliveries = self.db.query(WebhookTable).filter(
                WebhookTable.organization_id == organization_id
            ).with_entities(WebhookTable.successful_deliveries).all()

            successful_deliveries_count = sum([delivery.successful_deliveries for delivery in successful_deliveries])

            return {
                "total_webhooks": total_webhooks,
                "active_webhooks": active_webhooks,
                "total_deliveries": total_deliveries_count,
                "successful_deliveries": successful_deliveries_count,
                "success_rate": (successful_deliveries_count / total_deliveries_count * 100) if total_deliveries_count > 0 else 0
            }

        except Exception as e:
            logger.error(f"Failed to get webhook statistics for organization {organization_id}: {e}")
            return {
                "total_webhooks": 0,
                "active_webhooks": 0,
                "total_deliveries": 0,
                "successful_deliveries": 0,
                "success_rate": 0
            }