"""
Fix service for managing fix records and operations
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, update
from sqlalchemy.orm import selectinload
import asyncio

from app.models.fix import Fix, FixStatus
from app.models.error import Error
from app.schemas.fix import (
    FixCreate,
    FixUpdate,
    FixResponse,
    FixListResponse,
    FixApplicationRequest,
    FixApplicationResponse,
    FixStatisticsResponse
)
from app.core.exceptions import (
    FixNotFoundError,
    FixAlreadyAppliedError,
    FixNotApplicableError,
    ValidationError
)
from app.core.logger import logger


class FixService:
    """Service for managing fix records and operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_fix(self, fix_data: FixCreate) -> FixResponse:
        """
        Create a new fix record

        Args:
            fix_data: Fix creation data

        Returns:
            Created fix record
        """
        try:
            # Verify error exists
            error_query = select(Error).where(Error.id == fix_data.error_id)
            error_result = await self.db.execute(error_query)
            error = error_result.scalar_one_or_none()

            if not error:
                raise ValidationError(f"Error with ID {fix_data.error_id} not found")

            # Create fix record
            fix = Fix(
                error_id=fix_data.error_id,
                title=fix_data.title,
                description=fix_data.description,
                suggested_code=fix_data.suggested_code,
                file_path=fix_data.file_path,
                line_number=fix_data.line_number,
                confidence_score=fix_data.confidence_score,
                estimated_effort=fix_data.estimated_effort,
                risk_level=fix_data.risk_level,
                prerequisites=fix_data.prerequisites or [],
                tags=fix_data.tags or [],
                metadata=fix_data.metadata or {}
            )

            self.db.add(fix)
            await self.db.commit()
            await self.db.refresh(fix)

            logger.info(f"Created fix: {fix.id} for error: {error.id}")

            return FixResponse.from_orm(fix)

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating fix: {str(e)}")
            raise

    async def get_fix(self, fix_id: int) -> FixResponse:
        """
        Get a specific fix by ID

        Args:
            fix_id: Fix ID

        Returns:
            Fix record
        """
        query = select(Fix).where(Fix.id == fix_id)
        result = await self.db.execute(query)
        fix = result.scalar_one_or_none()

        if not fix:
            raise FixNotFoundError(f"Fix with ID {fix_id} not found")

        return FixResponse.from_orm(fix)

    async def get_fixes(
        self,
        error_id: Optional[int] = None,
        status: Optional[FixStatus] = None,
        risk_level: Optional[str] = None,
        min_confidence: Optional[float] = None,
        tag: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> FixListResponse:
        """
        Get fixes with filtering

        Args:
            error_id: Filter by error ID
            status: Filter by status
            risk_level: Filter by risk level
            min_confidence: Minimum confidence score
            tag: Filter by tag
            skip: Number of records to skip
            limit: Maximum number of records

        Returns:
            List of fixes
        """
        conditions = []

        if error_id:
            conditions.append(Fix.error_id == error_id)

        if status:
            conditions.append(Fix.status == status)

        if risk_level:
            conditions.append(Fix.risk_level == risk_level)

        if min_confidence:
            conditions.append(Fix.confidence_score >= min_confidence)

        if tag:
            conditions.append(Fix.tags.contains([tag]))

        # Build query
        query = select(Fix).where(and_(*conditions))

        # Get total count
        count_query = select(func.count()).select_from(
            select(Fix).where(and_(*conditions)).subquery()
        )
        count_result = await self.db.execute(count_query)
        total = count_result.scalar()

        # Apply pagination and ordering
        query = query.order_by(desc(Fix.created_at)).offset(skip).limit(limit)

        result = await self.db.execute(query)
        fixes = result.scalars().all()

        return FixListResponse(
            items=[FixResponse.from_orm(fix) for fix in fixes],
            total=total,
            skip=skip,
            limit=limit
        )

    async def update_fix(self, fix_id: int, fix_data: FixUpdate) -> FixResponse:
        """
        Update a fix record

        Args:
            fix_id: Fix ID
            fix_data: Updated fix data

        Returns:
            Updated fix record
        """
        try:
            # Get existing fix
            query = select(Fix).where(Fix.id == fix_id)
            result = await self.db.execute(query)
            fix = result.scalar_one_or_none()

            if not fix:
                raise FixNotFoundError(f"Fix with ID {fix_id} not found")

            # Update fields
            update_data = fix_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                if hasattr(fix, field):
                    setattr(fix, field, value)

            fix.updated_at = datetime.utcnow()

            await self.db.commit()
            await self.db.refresh(fix)

            logger.info(f"Updated fix: {fix.id}")

            return FixResponse.from_orm(fix)

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating fix: {str(e)}")
            raise

    async def delete_fix(self, fix_id: int) -> bool:
        """
        Delete a fix record

        Args:
            fix_id: Fix ID

        Returns:
            True if deleted
        """
        try:
            query = select(Fix).where(Fix.id == fix_id)
            result = await self.db.execute(query)
            fix = result.scalar_one_or_none()

            if not fix:
                raise FixNotFoundError(f"Fix with ID {fix_id} not found")

            await self.db.delete(fix)
            await self.db.commit()

            logger.info(f"Deleted fix: {fix_id}")

            return True

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting fix: {str(e)}")
            raise

    async def apply_fix(
        self,
        fix_id: int,
        application_data: FixApplicationRequest
    ) -> FixApplicationResponse:
        """
        Apply a fix to resolve an error

        Args:
            fix_id: Fix ID
            application_data: Application details

        Returns:
            Application result
        """
        try:
            # Get fix
            fix_query = select(Fix).where(Fix.id == fix_id)
            fix_result = await self.db.execute(fix_query)
            fix = fix_result.scalar_one_or_none()

            if not fix:
                raise FixNotFoundError(f"Fix with ID {fix_id} not found")

            # Check if fix is already applied
            if fix.status == FixStatus.APPLIED:
                raise FixAlreadyAppliedError(f"Fix {fix_id} is already applied")

            # Check if fix is applicable
            if fix.status != FixStatus.PENDING:
                raise FixNotApplicableError(
                    f"Fix {fix_id} is not applicable for application (current status: {fix.status})"
                )

            # Update fix status
            fix.status = FixStatus.APPLIED
            fix.applied_at = datetime.utcnow()
            fix.applied_by = application_data.applied_by
            fix.application_notes = application_data.notes
            fix.updated_at = datetime.utcnow()

            # Update error resolution
            error_query = select(Error).where(Error.id == fix.error_id)
            error_result = await self.db.execute(error_query)
            error = error_result.scalar_one_or_none()

            if error:
                error.status = "resolved"
                error.resolved_at = datetime.utcnow()
                error.resolution_method = "fix_applied"
                error.resolution_details = {
                    "fix_id": fix.id,
                    "fix_title": fix.title,
                    "applied_by": application_data.applied_by,
                    "applied_at": fix.applied_at.isoformat()
                }

            await self.db.commit()
            await self.db.refresh(fix)

            logger.info(f"Applied fix: {fix_id} by user: {application_data.applied_by}")

            return FixApplicationResponse(
                success=True,
                fix_id=fix.id,
                applied_at=fix.applied_at,
                message=f"Successfully applied fix: {fix.title}"
            )

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error applying fix: {str(e)}")
            raise

    async def reject_fix(
        self,
        fix_id: int,
        rejection_reason: str,
        rejected_by: str
    ) -> FixResponse:
        """
        Reject a fix

        Args:
            fix_id: Fix ID
            rejection_reason: Reason for rejection
            rejected_by: User who rejected

        Returns:
            Updated fix record
        """
        try:
            # Get fix
            query = select(Fix).where(Fix.id == fix_id)
            result = await self.db.execute(query)
            fix = result.scalar_one_or_none()

            if not fix:
                raise FixNotFoundError(f"Fix with ID {fix_id} not found")

            # Update fix
            fix.status = FixStatus.REJECTED
            fix.rejected_at = datetime.utcnow()
            fix.rejected_by = rejected_by
            fix.rejection_reason = rejection_reason
            fix.updated_at = datetime.utcnow()

            await self.db.commit()
            await self.db.refresh(fix)

            logger.info(f"Rejected fix: {fix_id} by user: {rejected_by}")

            return FixResponse.from_orm(fix)

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error rejecting fix: {str(e)}")
            raise

    async def get_fix_statistics(
        self,
        error_id: Optional[int] = None
    ) -> FixStatisticsResponse:
        """
        Get fix statistics

        Args:
            error_id: Optional error ID filter

        Returns:
            Fix statistics
        """
        conditions = []
        if error_id:
            conditions.append(Fix.error_id == error_id)

        # Total fixes
        total_query = select(func.count()).select_from(Fix).where(and_(*conditions))
        total_result = await self.db.execute(total_query)
        total = total_result.scalar()

        # Fixes by status
        status_conditions = [and_(*conditions, Fix.status == status.value) for status in FixStatus]
        status_queries = [select(func.count()).select_from(Fix).where(cond) for cond in status_conditions]
        status_results = await asyncio.gather(*[self.db.execute(q) for q in status_queries])
        status_counts = [result.scalar() for result in status_results]

        # Fixes by risk level
        risk_levels = ["low", "medium", "high", "critical"]
        risk_conditions = [and_(*conditions, Fix.risk_level == level) for level in risk_levels]
        risk_queries = [select(func.count()).select_from(Fix).where(cond) for cond in risk_conditions]
        risk_results = await asyncio.gather(*[self.db.execute(q) for q in risk_queries])
        risk_counts = dict(zip(risk_levels, [result.scalar() for result in risk_results]))

        # Average confidence
        confidence_query = select(func.avg(Fix.confidence_score)).select_from(Fix).where(and_(*conditions))
        confidence_result = await self.db.execute(confidence_query)
        avg_confidence = confidence_result.scalar() or 0.0

        # Success rate
        applied_conditions = and_(*conditions, Fix.status == FixStatus.APPLIED)
        success_query = select(func.count()).select_from(Fix).where(applied_conditions)
        success_result = await self.db.execute(success_query)
        successful = success_result.scalar()

        success_rate = (successful / total * 100) if total > 0 else 0.0

        return FixStatisticsResponse(
            total=total,
            by_status=dict(zip([status.value for status in FixStatus], status_counts)),
            by_risk_level=risk_counts,
            average_confidence=round(avg_confidence, 2),
            success_rate=round(success_rate, 2)
        )

    async def search_fixes(
        self,
        query: str,
        skip: int = 0,
        limit: int = 100
    ) -> FixListResponse:
        """
        Search fixes by text query

        Args:
            query: Search query
            skip: Number of records to skip
            limit: Maximum number of records

        Returns:
            Matching fixes
        """
        # Full-text search on title and description
        search_conditions = or_(
            Fix.title.ilike(f"%{query}%"),
            Fix.description.ilike(f"%{query}%"),
            Fix.suggested_code.ilike(f"%{query}%")
        )

        # Get total count
        count_query = select(func.count()).select_from(
            select(Fix).where(search_conditions).subquery()
        )
        count_result = await self.db.execute(count_query)
        total = count_result.scalar()

        # Get results
        fixes_query = select(Fix).where(search_conditions).order_by(
            desc(Fix.created_at)
        ).offset(skip).limit(limit)

        result = await self.db.execute(fixes_query)
        fixes = result.scalars().all()

        return FixListResponse(
            items=[FixResponse.from_orm(fix) for fix in fixes],
            total=total,
            skip=skip,
            limit=limit
        )

    async def get_similar_fixes(
        self,
        fix_id: int,
        limit: int = 10
    ) -> List[FixResponse]:
        """
        Get similar fixes based on error patterns

        Args:
            fix_id: Reference fix ID
            limit: Maximum number of similar fixes

        Returns:
            Similar fixes
        """
        # Get reference fix with error
        query = select(Fix).options(selectinload(Fix.error)).where(Fix.id == fix_id)
        result = await self.db.execute(query)
        reference_fix = result.scalar_one_or_none()

        if not reference_fix or not reference_fix.error:
            return []

        # Find fixes for similar errors (same error type, similar stack trace patterns)
        similar_conditions = or_(
            Fix.error_id.in_(
                select(Error.id).where(
                    and_(
                        Error.error_type == reference_fix.error.error_type,
                        Error.id != reference_fix.error_id
                    )
                )
            ),
            and_(
                Fix.file_path == reference_fix.file_path,
                Fix.id != fix_id
            )
        )

        similar_query = select(Fix).where(similar_conditions).order_by(
            desc(Fix.confidence_score)
        ).limit(limit)

        result = await self.db.execute(similar_query)
        similar_fixes = result.scalars().all()

        return [FixResponse.from_orm(fix) for fix in similar_fixes]