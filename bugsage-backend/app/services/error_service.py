"""
Error service for managing errors.
"""

from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, func, update
from sqlalchemy.orm import selectinload

from app.models.error import Error, ErrorOccurrence
from app.schemas.error import (
    ErrorCreate,
    ErrorUpdate,
    ErrorResponse,
    ErrorList,
)
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ErrorService:
    """Service for error management operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_error(self, error_data: Dict[str, Any]) -> Error:
        """Create a new error."""
        try:
            error = Error(**error_data)
            self.db.add(error)
            await self.db.commit()
            await self.db.refresh(error)

            logger.info(f"Created error: {error.title} (ID: {error.id})")
            return error

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to create error: {e}")
            raise

    async def get_error(self, error_id: int) -> Error:
        """Get error by ID."""
        try:
            result = await self.db.execute(
                select(Error)
                .options(selectinload(Error.fixes))
                .where(Error.id == error_id)
            )
            error = result.scalar_one_or_none()

            if not error:
                raise ValueError(f"Error {error_id} not found")

            return error

        except Exception as e:
            logger.error(f"Failed to get error {error_id}: {e}")
            raise

    async def get_errors(
        self,
        skip: int = 0,
        limit: int = 100,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        filters: Optional[Dict[str, Any]] = None,
    ) -> ErrorList:
        """Get errors with filtering and pagination."""
        try:
            query = select(Error).options(selectinload(Error.fixes))

            # Apply filters
            if filters:
                conditions = []

                if "project_id" in filters:
                    conditions.append(Error.project_id == filters["project_id"])

                if "severity" in filters:
                    conditions.append(Error.severity == filters["severity"])

                if "status" in filters:
                    conditions.append(Error.status == filters["status"])

                if "category" in filters:
                    conditions.append(Error.category == filters["category"])

                if "source" in filters:
                    conditions.append(Error.source == filters["source"])

                if "environment" in filters:
                    conditions.append(Error.environment == filters["environment"])

                if "assigned_to_id" in filters:
                    conditions.append(Error.assigned_to_id == filters["assigned_to_id"])

                if "is_assigned" in filters:
                    if filters["is_assigned"]:
                        conditions.append(Error.assigned_to_id.isnot(None))
                    else:
                        conditions.append(Error.assigned_to_id.is_(None))

                if "created_from" in filters:
                    conditions.append(Error.created_at >= filters["created_from"])

                if "created_to" in filters:
                    conditions.append(Error.created_at <= filters["created_to"])

                if "search" in filters:
                    search_term = f"%{filters['search']}%"
                    conditions.append(
                        or_(
                            Error.title.ilike(search_term),
                            Error.description.ilike(search_term),
                            Error.error_message.ilike(search_term),
                            Error.stack_trace.ilike(search_term),
                        )
                    )

                if conditions:
                    query = query.where(and_(*conditions))

            # Apply sorting
            if sort_by:
                sort_column = getattr(Error, sort_by, None)
                if sort_column:
                    if sort_order == "desc":
                        query = query.order_by(desc(sort_column))
                    else:
                        query = query.order_by(sort_column)

            # Apply pagination
            query = query.offset(skip).limit(limit)

            # Execute query
            result = await self.db.execute(query)
            errors = result.scalars().all()

            # Get total count
            count_query = select(func.count(Error.id))
            if filters and conditions:
                count_query = count_query.where(and_(*conditions))
            total = await self.db.scalar(count_query)

            # Calculate pagination
            pages = (total + limit - 1) // limit
            page = skip // limit + 1

            return ErrorList(
                errors=errors,
                total=total,
                page=page,
                size=limit,
                pages=pages,
            )

        except Exception as e:
            logger.error(f"Failed to get errors: {e}")
            raise

    async def get_errors_count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """Get total count of errors matching filters."""
        try:
            query = select(func.count(Error.id))

            # Apply filters
            if filters:
                conditions = []

                if "project_id" in filters:
                    conditions.append(Error.project_id == filters["project_id"])

                if "severity" in filters:
                    conditions.append(Error.severity == filters["severity"])

                if "status" in filters:
                    conditions.append(Error.status == filters["status"])

                if conditions:
                    query = query.where(and_(*conditions))

            result = await self.db.scalar(query)
            return result or 0

        except Exception as e:
            logger.error(f"Failed to get errors count: {e}")
            return 0

    async def update_error(self, error_id: int, update_data: Dict[str, Any]) -> Error:
        """Update error."""
        try:
            # Get existing error
            error = await self.get_error(error_id)

            # Update fields
            for field, value in update_data.items():
                if hasattr(error, field):
                    setattr(error, field, value)

            error.updated_at = datetime.utcnow()

            await self.db.commit()
            await self.db.refresh(error)

            logger.info(f"Updated error {error_id}: {update_data}")
            return error

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to update error {error_id}: {e}")
            raise

    async def delete_error(self, error_id: int) -> bool:
        """Delete error."""
        try:
            # Get error to check existence
            error = await self.get_error(error_id)

            # Delete error (cascade delete will handle related records)
            await self.db.delete(error)
            await self.db.commit()

            logger.info(f"Deleted error {error_id}")
            return True

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to delete error {error_id}: {e}")
            raise

    async def assign_error(self, error_id: int, assign_to_id: int, assigned_by_id: int) -> Error:
        """Assign error to user."""
        try:
            # Get error
            error = await self.get_error(error_id)

            # Update assignment
            error.assigned_to_id = assign_to_id
            error.updated_at = datetime.utcnow()

            await self.db.commit()
            await self.db.refresh(error)

            logger.info(f"Assigned error {error_id} to user {assign_to_id}")
            return error

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to assign error {error_id}: {e}")
            raise

    async def resolve_error(
        self,
        error_id: int,
        resolution_data: Dict[str, Any],
        resolved_by_id: int,
    ) -> Error:
        """Mark error as resolved."""
        try:
            # Get error
            error = await self.get_error(error_id)

            # Update resolution fields
            error.status = "resolved"
            error.resolved_at = datetime.utcnow()
            error.resolved_by_id = resolved_by_id
            error.resolution_method = resolution_data.get("resolution_method", "manual")
            error.resolution_notes = resolution_data.get("resolution_notes")

            error.updated_at = datetime.utcnow()

            await self.db.commit()
            await self.db.refresh(error)

            logger.info(f"Resolved error {error_id}")
            return error

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to resolve error {error_id}: {e}")
            raise

    async def ignore_error(
        self,
        error_id: int,
        ignore_data: Dict[str, Any],
        ignored_by_id: int,
    ) -> Error:
        """Ignore error."""
        try:
            # Get error
            error = await self.get_error(error_id)

            # Update ignore fields
            if ignore_data.get("false_positive", False):
                error.status = "false_positive"
                error.false_positive_reason = ignore_data.get("reason", "")
            else:
                error.status = "ignored"

            error.updated_at = datetime.utcnow()

            await self.db.commit()
            await self.db.refresh(error)

            logger.info(f"Ignored error {error_id}")
            return error

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to ignore error {error_id}: {e}")
            raise

    async def bulk_action(
        self,
        error_ids: List[int],
        action: str,
        params: Dict[str, Any],
        user_id: int,
    ) -> Dict[str, Any]:
        """Perform bulk action on errors."""
        try:
            results = {
                "processed": 0,
                "failed": 0,
                "errors": [],
            }

            for error_id in error_ids:
                try:
                    if action == "assign":
                        assigned_to_id = params.get("assigned_to_id")
                        if assigned_to_id:
                            await self.assign_error(error_id, assigned_to_id, user_id)
                            results["processed"] += 1
                        else:
                            results["errors"].append(f"Missing assigned_to_id for error {error_id}")

                    elif action == "resolve":
                        await self.resolve_error(error_id, params, user_id)
                        results["processed"] += 1

                    elif action == "ignore":
                        await self.ignore_error(error_id, params, user_id)
                        results["processed"] += 1

                    elif action == "delete":
                        await self.delete_error(error_id)
                        results["processed"] += 1

                    else:
                        results["errors"].append(f"Unknown action: {action}")

                except Exception as e:
                    logger.error(f"Failed to {action} error {error_id}: {e}")
                    results["failed"] += 1
                    results["errors"].append(f"Error {error_id}: {e}")

            return results

        except Exception as e:
            logger.error(f"Bulk action failed: {e}")
            raise

    async def get_statistics(
        self,
        days: int = 30,
        project_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Get error statistics."""
        try:
            date_from = datetime.utcnow() - timedelta(days=days)

            # Base query
            query = select(Error)
            if project_id:
                query = query.where(Error.project_id == project_id)
            else:
                query = query.where(Error.created_at >= date_from)

            # Get all errors in date range
            result = await self.db.execute(query)
            all_errors = result.scalars().all()

            # Calculate statistics
            stats = {
                "total_errors": len(all_errors),
                "critical_errors": 0,
                "high_errors": 0,
                "medium_errors": 0,
                "low_errors": 0,
                "resolved_errors": 0,
                "open_errors": 0,
                "avg_resolution_time": None,
                "avg_first_response_time": None,
                "error_rate_trend": [],
                "top_error_types": [],
                "affected_projects": set(),
            }

            # Count by severity
            for error in all_errors:
                if error.severity == "critical":
                    stats["critical_errors"] += 1
                elif error.severity == "high":
                    stats["high_errors"] += 1
                elif error.severity == "medium":
                    stats["medium_errors"] += 1
                elif error.severity == "low":
                    stats["low_errors"] += 1

                if error.status == "resolved":
                    stats["resolved_errors"] += 1
                elif error.status not in ["resolved", "ignored", "false_positive"]:
                    stats["open_errors"] += 1

                if error.project_id:
                    stats["affected_projects"].add(error.project_id)

            # Calculate resolution time (placeholder)
            if stats["resolved_errors"] > 0:
                # TODO: Calculate average resolution time from actual data
                stats["avg_resolution_time"] = 45.0  # Placeholder

            # Count affected projects
            stats["affected_projects"] = len(stats["affected_projects"])

            return stats

        except Exception as e:
            logger.error(f"Failed to get statistics: {e}")
            return {}

    async def get_metrics(
        self,
        days: int = 30,
        project_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Get error metrics over time."""
        try:
            date_from = datetime.utcnow() - timedelta(days=days)
            date_to = datetime.utcnow()

            # Query for metrics by date
            query = (
                select(
                    func.date(Error.created_at).label('date'),
                    func.count(Error.id).label('total_errors'),
                    func.count(func.case(
                        (Error.status == 'resolved', 1),
                        else_=0
                    )).label('resolved_errors'),
                    func.avg(
                        func.extract('epoch', Error.resolved_at) -
                        func.extract('epoch', Error.created_at)
                    ).label('avg_resolution_time'),
                )
                .where(
                    and_(
                        Error.created_at >= date_from,
                        Error.created_at <= date_to,
                        project_id == project_id if project_id else True,
                    )
                )
                .group_by(func.date(Error.created_at))
                .order_by(func.date(Error.created_at))
            )

            result = await self.db.execute(query)
            metrics = result.all()

            return [
                {
                    "date": str(row.date),
                    "total_errors": row.total_errors,
                    "resolved_errors": row.resolved_errors,
                    "success_rate": (row.resolved_errors / max(row.total_errors, 1)) * 100,
                    "avg_resolution_time": float(row.avg_resolution_time) if row.avg_resolution_time else 0.0,
                }
                for row in metrics
            ]

        except Exception as e:
            logger.error(f"Failed to get metrics: {e}")
            return []

    async def process_webhook(self, webhook_data: Dict[str, Any]) -> Optional[Error]:
        """Process webhook data from external services."""
        try:
            # Parse webhook based on source
            source = webhook_data.get("source", "")
            event_type = webhook_data.get("event_type", "")

            if source == "sentry":
                return await self._process_sentry_webhook(webhook_data)
            elif source == "github":
                return await self._process_github_webhook(webhook_data)
            else:
                logger.warning(f"Unknown webhook source: {source}")
                return None

        except Exception as e:
            logger.error(f"Failed to process webhook: {e}")
            return None

    async def _process_sentry_webhook(self, webhook_data: Dict[str, Any]) -> Optional[Error]:
        """Process Sentry webhook."""
        try:
            event = webhook_data.get("event", {})
            error_data = event.get("error", {})

            # Map Sentry data to our schema
            error_create_data = {
                "title": error_data.get("title", "Unknown Error"),
                "description": error_data.get("message", ""),
                "severity": self._map_sentry_severity(error_data.get("level", "error")),
                "source": "sentry",
                "source_id": error_data.get("event_id"),
                "source_type": "error",
                "source_url": event.get("url", ""),
                "stack_trace": error_data.get("stacktrace"),
                "error_type": error_data.get("type", ""),
                "error_message": error_data.get("message", ""),
                "project_id": self._get_or_create_project(
                    event.get("project", {}),
                    webhook_data.get("organization_id")
                ),
                "context": {
                    "release": event.get("release"),
                    "environment": event.get("environment"),
                    "user": event.get("user"),
                    "tags": event.get("tags", []),
                    "extra": event.get("extra", {}),
                },
                "metadata": {
                    "webhook_id": event.get("event_id"),
                    "platform": event.get("platform"),
                    "sdk": event.get("sdk"),
                    "received_at": datetime.utcnow().isoformat(),
                },
            }

            # Create error
            return await self.create_error(error_create_data)

        except Exception as e:
            logger.error(f"Failed to process Sentry webhook: {e}")
            return None

    async def _process_github_webhook(self, webhook_data: Dict[str, Any]) -> Optional[Error]:
        """Process GitHub webhook."""
        try:
            # TODO: Implement GitHub webhook processing
            logger.info("GitHub webhook processing not yet implemented")
            return None

        except Exception as e:
            logger.error(f"Failed to process GitHub webhook: {e}")
            return None

    def _map_sentry_severity(self, sentry_level: str) -> str:
        """Map Sentry severity to our severity levels."""
        mapping = {
            "fatal": "critical",
            "error": "critical",
            "warning": "medium",
            "info": "low",
            "debug": "low",
        }
        return mapping.get(sentry_level.lower(), "medium")

    def _get_or_create_project(self, project_data: Dict[str, Any], organization_id: int) -> int:
        """Get or create project from webhook data."""
        # TODO: Implement project lookup/creation
        return 1  # Placeholder

    async def export_errors(
        self,
        format: str,
        filters: Dict[str, Any],
        fields: List[str],
        include_code: bool,
        include_tests: bool,
        organization_id: int,
    ) -> Any:
        """Export errors to specified format."""
        try:
            # Get errors matching filters
            errors = await self.get_errors(
                limit=10000,  # Large limit for export
                filters=filters,
            )

            # Format data based on requested format
            if format == "json":
                return self._export_json(errors, fields, include_code, include_tests)
            elif format == "csv":
                return self._export_csv(errors, fields, include_code, include_tests)
            elif format == "xlsx":
                return self._export_xlsx(errors, fields, include_code, include_tests)
            else:
                raise ValueError(f"Unsupported export format: {format}")

        except Exception as e:
            logger.error(f"Failed to export errors: {e}")
            raise

    def _export_json(
        self,
        errors: List[Error],
        fields: List[str],
        include_code: bool,
        include_tests: bool,
    ) -> Dict[str, Any]:
        """Export errors to JSON format."""
        data = []
        for error in errors:
            error_dict = error.to_dict()

            # Filter fields
            if fields:
                filtered_dict = {}
                for field in fields:
                    if field in error_dict:
                        filtered_dict[field] = error_dict[field]
                error_dict = filtered_dict

            # Handle code and test inclusion
            if not include_code:
                error_dict.pop("stack_trace", None)
                error_dict.pop("generated_code", None)
                error_dict.pop("code_diff", None)

            if not include_tests:
                error_dict.pop("test_results", None)
                error_dict.pop("test_coverage", None)
                error_dict.pop("test_passed", None)

            data.append(error_dict)

        return {
            "errors": data,
            "total": len(data),
            "exported_at": datetime.utcnow().isoformat(),
            "format": "json",
        }

    def _export_csv(self, errors: List[Error], fields: List[str], include_code: bool, include_tests: bool) -> str:
        """Export errors to CSV format."""
        import csv
        import io

        output = io.StringIO()
        writer = csv.writer(output)

        # Write headers
        if fields:
            writer.writerow(fields)
        else:
            writer.writerow([
                "id", "title", "description", "severity", "status", "source",
                "created_at", "resolved_at", "assigned_to_id", "project_id"
            ])

        # Write data rows
        for error in errors:
            row = []

            if fields:
                for field in fields:
                    if field in error.__dict__:
                        value = getattr(error, field)
                        if isinstance(value, datetime):
                            value = value.isoformat()
                        elif value is None:
                            value = ""
                        row.append(str(value))
                    else:
                        row.append("")
            else:
                row = [
                    error.id,
                    error.title,
                    error.description or "",
                    error.severity.value,
                    error.status.value,
                    error.source,
                    error.created_at.isoformat(),
                    error.resolved_at.isoformat() if error.resolved_at else "",
                    str(error.assigned_to_id) if error.assigned_to_id else "",
                    str(error.project_id),
                ]

            writer.writerow(row)

        return output.getvalue()

    def _export_xlsx(self, errors: List[Error], fields: List[str], include_code: bool, include_tests: bool) -> bytes:
        """Export errors to Excel format."""
        # TODO: Implement Excel export
        return b"Excel export not yet implemented"