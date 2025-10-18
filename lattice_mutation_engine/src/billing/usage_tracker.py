"""
Usage tracking service for monitoring API usage and resource consumption.

This module provides a service to track usage metrics against subscription limits,
including API calls, specs created, projects created, and member counts.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc

from src.models.subscription_models import (
    UsageRecordTable,
    UsageRecordCreate,
    SubscriptionTable,
    PlanTable
)

logger = logging.getLogger(__name__)


class UsageTracker:
    """Service for tracking and managing usage metrics"""

    def __init__(self, db: Session):
        """
        Initialize usage tracker

        Args:
            db: Database session
        """
        self.db = db

    def track_api_call(
        self,
        organization_id: str,
        subscription_id: str,
        endpoint: str,
        method: str,
        user_id: Optional[str] = None
    ) -> UsageRecordTable:
        """
        Track an API call for usage metrics

        Args:
            organization_id: Organization ID
            subscription_id: Subscription ID
            endpoint: API endpoint path
            method: HTTP method
            user_id: User ID who made the call (optional)

        Returns:
            UsageRecordTable: Created or updated usage record
        """
        try:
            # Get current billing period
            subscription = self.db.query(SubscriptionTable).filter(
                SubscriptionTable.id == subscription_id
            ).first()

            if not subscription:
                logger.error(f"Subscription {subscription_id} not found")
                raise ValueError("Subscription not found")

            period_start, period_end = self._get_current_billing_period(subscription)

            # Check if usage record exists for this period
            existing_record = self.db.query(UsageRecordTable).filter(
                and_(
                    UsageRecordTable.subscription_id == subscription_id,
                    UsageRecordTable.metric_name == "api_calls",
                    UsageRecordTable.period_start == period_start,
                    UsageRecordTable.period_end == period_end
                )
            ).first()

            if existing_record:
                # Update existing record
                existing_record.quantity += 1
                existing_record.updated_at = datetime.utcnow()
                self.db.commit()
                self.db.refresh(existing_record)
                return existing_record
            else:
                # Create new record
                usage_record = UsageRecordTable(
                    organization_id=organization_id,
                    subscription_id=subscription_id,
                    metric_name="api_calls",
                    quantity=1,
                    period_start=period_start,
                    period_end=period_end,
                    metadata={
                        "type": "api_call",
                        "endpoint": endpoint,
                        "method": method,
                        "user_id": user_id
                    }
                )
                self.db.add(usage_record)
                self.db.commit()
                self.db.refresh(usage_record)
                return usage_record

        except Exception as e:
            logger.error(f"Failed to track API call: {e}")
            self.db.rollback()
            raise

    def track_spec_created(
        self,
        organization_id: str,
        subscription_id: str,
        spec_id: str,
        user_id: Optional[str] = None
    ) -> UsageRecordTable:
        """
        Track spec creation

        Args:
            organization_id: Organization ID
            subscription_id: Subscription ID
            spec_id: Created spec ID
            user_id: User ID who created the spec

        Returns:
            UsageRecordTable: Created or updated usage record
        """
        try:
            subscription = self.db.query(SubscriptionTable).filter(
                SubscriptionTable.id == subscription_id
            ).first()

            if not subscription:
                raise ValueError("Subscription not found")

            period_start, period_end = self._get_current_billing_period(subscription)

            existing_record = self.db.query(UsageRecordTable).filter(
                and_(
                    UsageRecordTable.subscription_id == subscription_id,
                    UsageRecordTable.metric_name == "specs_created",
                    UsageRecordTable.period_start == period_start,
                    UsageRecordTable.period_end == period_end
                )
            ).first()

            if existing_record:
                existing_record.quantity += 1
                existing_record.updated_at = datetime.utcnow()
                self.db.commit()
                self.db.refresh(existing_record)
                return existing_record
            else:
                usage_record = UsageRecordTable(
                    organization_id=organization_id,
                    subscription_id=subscription_id,
                    metric_name="specs_created",
                    quantity=1,
                    period_start=period_start,
                    period_end=period_end,
                    metadata={
                        "type": "spec_created",
                        "spec_id": spec_id,
                        "user_id": user_id
                    }
                )
                self.db.add(usage_record)
                self.db.commit()
                self.db.refresh(usage_record)
                return usage_record

        except Exception as e:
            logger.error(f"Failed to track spec creation: {e}")
            self.db.rollback()
            raise

    def track_project_created(
        self,
        organization_id: str,
        subscription_id: str,
        project_id: str,
        user_id: Optional[str] = None
    ) -> UsageRecordTable:
        """
        Track project creation

        Args:
            organization_id: Organization ID
            subscription_id: Subscription ID
            project_id: Created project ID
            user_id: User ID who created the project

        Returns:
            UsageRecordTable: Created or updated usage record
        """
        try:
            subscription = self.db.query(SubscriptionTable).filter(
                SubscriptionTable.id == subscription_id
            ).first()

            if not subscription:
                raise ValueError("Subscription not found")

            period_start, period_end = self._get_current_billing_period(subscription)

            existing_record = self.db.query(UsageRecordTable).filter(
                and_(
                    UsageRecordTable.subscription_id == subscription_id,
                    UsageRecordTable.metric_name == "projects_created",
                    UsageRecordTable.period_start == period_start,
                    UsageRecordTable.period_end == period_end
                )
            ).first()

            if existing_record:
                existing_record.quantity += 1
                existing_record.updated_at = datetime.utcnow()
                self.db.commit()
                self.db.refresh(existing_record)
                return existing_record
            else:
                usage_record = UsageRecordTable(
                    organization_id=organization_id,
                    subscription_id=subscription_id,
                    metric_name="projects_created",
                    quantity=1,
                    period_start=period_start,
                    period_end=period_end,
                    metadata={
                        "type": "project_created",
                        "project_id": project_id,
                        "user_id": user_id
                    }
                )
                self.db.add(usage_record)
                self.db.commit()
                self.db.refresh(usage_record)
                return usage_record

        except Exception as e:
            logger.error(f"Failed to track project creation: {e}")
            self.db.rollback()
            raise

    def get_current_usage(
        self,
        subscription_id: str,
        period_start: Optional[datetime] = None,
        period_end: Optional[datetime] = None
    ) -> Dict[str, int]:
        """
        Get current usage metrics for a subscription

        Args:
            subscription_id: Subscription ID
            period_start: Start of period (optional, defaults to current billing period)
            period_end: End of period (optional, defaults to current billing period)

        Returns:
            Dict[str, int]: Usage metrics by metric name
        """
        try:
            # If no period specified, get current billing period
            if not period_start or not period_end:
                subscription = self.db.query(SubscriptionTable).filter(
                    SubscriptionTable.id == subscription_id
                ).first()
                if subscription:
                    period_start, period_end = self._get_current_billing_period(subscription)

            # Query usage records for the period
            usage_records = self.db.query(
                UsageRecordTable.metric_name,
                func.sum(UsageRecordTable.quantity).label('total')
            ).filter(
                and_(
                    UsageRecordTable.subscription_id == subscription_id,
                    UsageRecordTable.period_start >= period_start,
                    UsageRecordTable.period_end <= period_end
                )
            ).group_by(UsageRecordTable.metric_name).all()

            # Convert to dict
            usage_metrics = {}
            for record in usage_records:
                usage_metrics[record.metric_name] = int(record.total or 0)

            return usage_metrics

        except Exception as e:
            logger.error(f"Failed to get current usage: {e}")
            return {}

    def check_usage_limits(
        self,
        organization_id: str,
        subscription_id: str
    ) -> Dict[str, bool]:
        """
        Check if current usage exceeds plan limits

        Args:
            organization_id: Organization ID
            subscription_id: Subscription ID

        Returns:
            Dict[str, bool]: Indicates which limits are exceeded
        """
        try:
            # Get subscription with plan details
            subscription = self.db.query(SubscriptionTable).join(PlanTable).filter(
                SubscriptionTable.id == subscription_id
            ).first()

            if not subscription or not subscription.plan:
                logger.error(f"Subscription or plan not found for {subscription_id}")
                return {}

            # Get current usage
            current_usage = self.get_current_usage(subscription_id)

            # Check against plan limits
            limits_exceeded = {}

            # Check API calls limit
            if subscription.plan.max_api_calls_monthly > 0:  # -1 means unlimited
                api_calls = current_usage.get("api_calls", 0)
                limits_exceeded["api_calls"] = api_calls > subscription.plan.max_api_calls_monthly

            # Check projects limit
            if subscription.plan.max_projects > 0:
                projects = current_usage.get("projects_created", 0)
                limits_exceeded["projects"] = projects > subscription.plan.max_projects

            # Check members limit
            if subscription.plan.max_members > 0:
                # Get current member count
                from src.models.user_models import OrganizationMemberTable
                member_count = self.db.query(OrganizationMemberTable).filter(
                    OrganizationMemberTable.organization_id == organization_id
                ).count()
                limits_exceeded["members"] = member_count > subscription.plan.max_members

            # Check specs limit
            if subscription.plan.max_specs_per_project > 0:
                specs = current_usage.get("specs_created", 0)
                limits_exceeded["specs"] = specs > subscription.plan.max_specs_per_project

            return limits_exceeded

        except Exception as e:
            logger.error(f"Failed to check usage limits: {e}")
            return {}

    def reset_usage_for_period(self, subscription_id: str) -> bool:
        """
        Reset usage records for a billing period (called at period rollover)

        Args:
            subscription_id: Subscription ID

        Returns:
            bool: True if successful
        """
        try:
            subscription = self.db.query(SubscriptionTable).filter(
                SubscriptionTable.id == subscription_id
            ).first()

            if not subscription:
                logger.error(f"Subscription {subscription_id} not found")
                return False

            period_start, period_end = self._get_current_billing_period(subscription)

            # Archive old usage records (optional - for historical reporting)
            # For now, we'll just create new records for the new period

            logger.info(f"Usage period reset for subscription {subscription_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to reset usage for period: {e}")
            return False

    def get_usage_history(
        self,
        subscription_id: str,
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Get usage history for the past N days

        Args:
            subscription_id: Subscription ID
            days: Number of days to look back

        Returns:
            List[Dict]: Daily usage records
        """
        try:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)

            # Query daily usage
            daily_usage = self.db.query(
                func.date(UsageRecordTable.created_at).label('date'),
                UsageRecordTable.metric_name,
                func.sum(UsageRecordTable.quantity).label('total')
            ).filter(
                and_(
                    UsageRecordTable.subscription_id == subscription_id,
                    UsageRecordTable.created_at >= start_date,
                    UsageRecordTable.created_at <= end_date
                )
            ).group_by(
                func.date(UsageRecordTable.created_at),
                UsageRecordTable.metric_name
            ).order_by(desc('date')).all()

            # Group by date
            usage_by_date = {}
            for record in daily_usage:
                date_str = record.date.isoformat()
                if date_str not in usage_by_date:
                    usage_by_date[date_str] = {}
                usage_by_date[date_str][record.metric_name] = int(record.total or 0)

            # Convert to list and sort by date
            history = [
                {"date": date, **metrics}
                for date, metrics in sorted(usage_by_date.items(), reverse=True)
            ]

            return history

        except Exception as e:
            logger.error(f"Failed to get usage history: {e}")
            return []

    def _get_current_billing_period(
        self,
        subscription: SubscriptionTable
    ) -> Tuple[datetime, datetime]:
        """
        Get the current billing period for a subscription

        Args:
            subscription: Subscription record

        Returns:
            Tuple[datetime, datetime]: (period_start, period_end)
        """
        current_time = datetime.utcnow()

        # Use subscription's current period dates if available
        if subscription.current_period_start and subscription.current_period_end:
            return subscription.current_period_start, subscription.current_period_end

        # Fallback: calculate from subscription creation date and billing interval
        if subscription.created_at:
            start_date = subscription.created_at.replace(
                day=1, hour=0, minute=0, second=0, microsecond=0
            )

            if subscription.billing_interval == "year":
                end_date = start_date + timedelta(days=365)
            else:
                end_date = start_date + timedelta(days=30)

            return start_date, end_date

        # Final fallback: current month
        start_date = current_time.replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        end_date = start_date + timedelta(days=30)

        return start_date, end_date