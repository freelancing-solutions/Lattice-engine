"""
Project service for managing project records and operations
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, update
from sqlalchemy.orm import selectinload

from app.models.project import Project
from app.models.error import Error
from app.models.fix import Fix
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
    ProjectStatisticsResponse
)
from app.core.exceptions import (
    ProjectNotFoundError,
    ProjectAlreadyExistsError,
    ValidationError
)
from app.core.logger import logger


class ProjectService:
    """Service for managing project records and operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_project(self, project_data: ProjectCreate) -> ProjectResponse:
        """
        Create a new project

        Args:
            project_data: Project creation data

        Returns:
            Created project
        """
        try:
            # Check if project already exists
            existing_query = select(Project).where(
                or_(
                    Project.name == project_data.name,
                    Project.repository_url == project_data.repository_url
                )
            )
            existing_result = await self.db.execute(existing_query)
            existing_project = existing_result.scalar_one_or_none()

            if existing_project:
                if existing_project.name == project_data.name:
                    raise ProjectAlreadyExistsError(f"Project with name {project_data.name} already exists")
                else:
                    raise ProjectAlreadyExistsError(f"Project with repository URL {project_data.repository_url} already exists")

            # Create project
            project = Project(
                name=project_data.name,
                description=project_data.description,
                repository_url=project_data.repository_url,
                repository_branch=project_data.repository_branch or "main",
                tech_stack=project_data.tech_stack or [],
                owner_id=project_data.owner_id,
                is_active=project_data.is_active,
                metadata=project_data.metadata or {}
            )

            self.db.add(project)
            await self.db.commit()
            await self.db.refresh(project)

            logger.info(f"Created project: {project.name}")

            return ProjectResponse.from_orm(project)

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating project: {str(e)}")
            raise

    async def get_project(self, project_id: int) -> ProjectResponse:
        """
        Get project by ID

        Args:
            project_id: Project ID

        Returns:
            Project record
        """
        query = select(Project).where(Project.id == project_id)
        result = await self.db.execute(query)
        project = result.scalar_one_or_none()

        if not project:
            raise ProjectNotFoundError(f"Project with ID {project_id} not found")

        return ProjectResponse.from_orm(project)

    async def get_project_by_name(self, name: str) -> ProjectResponse:
        """
        Get project by name

        Args:
            name: Project name

        Returns:
            Project record
        """
        query = select(Project).where(Project.name == name)
        result = await self.db.execute(query)
        project = result.scalar_one_or_none()

        if not project:
            raise ProjectNotFoundError(f"Project with name {name} not found")

        return ProjectResponse.from_orm(project)

    async def get_projects(
        self,
        owner_id: Optional[int] = None,
        is_active: Optional[bool] = None,
        tech_stack: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> ProjectListResponse:
        """
        Get projects with filtering

        Args:
            owner_id: Filter by owner ID
            is_active: Filter by active status
            tech_stack: Filter by technology stack
            skip: Number of records to skip
            limit: Maximum number of records

        Returns:
            List of projects
        """
        conditions = []

        if owner_id:
            conditions.append(Project.owner_id == owner_id)

        if is_active is not None:
            conditions.append(Project.is_active == is_active)

        if tech_stack:
            conditions.append(Project.tech_stack.contains([tech_stack]))

        # Build query
        query = select(Project).where(and_(*conditions))

        # Get total count
        count_query = select(func.count()).select_from(
            select(Project).where(and_(*conditions)).subquery()
        )
        count_result = await self.db.execute(count_query)
        total = count_result.scalar()

        # Apply pagination and ordering
        query = query.order_by(desc(Project.created_at)).offset(skip).limit(limit)

        result = await self.db.execute(query)
        projects = result.scalars().all()

        return ProjectListResponse(
            items=[ProjectResponse.from_orm(project) for project in projects],
            total=total,
            skip=skip,
            limit=limit
        )

    async def update_project(self, project_id: int, project_data: ProjectUpdate) -> ProjectResponse:
        """
        Update project record

        Args:
            project_id: Project ID
            project_data: Updated project data

        Returns:
            Updated project record
        """
        try:
            # Get existing project
            query = select(Project).where(Project.id == project_id)
            result = await self.db.execute(query)
            project = result.scalar_one_or_none()

            if not project:
                raise ProjectNotFoundError(f"Project with ID {project_id} not found")

            # Check for conflicts
            if project_data.name or project_data.repository_url:
                conflict_query = select(Project).where(
                    and_(
                        Project.id != project_id,
                        or_(
                            Project.name == project_data.name if project_data.name else False,
                            Project.repository_url == project_data.repository_url if project_data.repository_url else False
                        )
                    )
                )
                conflict_result = await self.db.execute(conflict_query)
                conflict_project = conflict_result.scalar_one_or_none()

                if conflict_project:
                    if conflict_project.name == project_data.name:
                        raise ProjectAlreadyExistsError(f"Project name {project_data.name} already exists")
                    else:
                        raise ProjectAlreadyExistsError(f"Repository URL {project_data.repository_url} already exists")

            # Update fields
            update_data = project_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                if hasattr(project, field):
                    setattr(project, field, value)

            project.updated_at = datetime.utcnow()

            await self.db.commit()
            await self.db.refresh(project)

            logger.info(f"Updated project: {project.name}")

            return ProjectResponse.from_orm(project)

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating project: {str(e)}")
            raise

    async def delete_project(self, project_id: int) -> bool:
        """
        Delete project

        Args:
            project_id: Project ID

        Returns:
            True if deleted
        """
        try:
            query = select(Project).where(Project.id == project_id)
            result = await self.db.execute(query)
            project = result.scalar_one_or_none()

            if not project:
                raise ProjectNotFoundError(f"Project with ID {project_id} not found")

            await self.db.delete(project)
            await self.db.commit()

            logger.info(f"Deleted project: {project_id}")

            return True

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting project: {str(e)}")
            raise

    async def get_project_statistics(
        self,
        project_id: Optional[int] = None
    ) -> ProjectStatisticsResponse:
        """
        Get project statistics

        Args:
            project_id: Optional project ID filter

        Returns:
            Project statistics
        """
        conditions = []
        if project_id:
            conditions.append(Project.id == project_id)

        # Total projects
        total_query = select(func.count()).select_from(Project).where(and_(*conditions))
        total_result = await self.db.execute(total_query)
        total = total_result.scalar()

        # Active projects
        active_conditions = and_(*conditions, Project.is_active == True)
        active_query = select(func.count()).select_from(Project).where(active_conditions)
        active_result = await self.db.execute(active_query)
        active = active_result.scalar()

        # Projects by tech stack
        tech_stack_query = select(func.unnest(Project.tech_stack), func.count()).select_from(Project).where(and_(*conditions)).group_by(func.unnest(Project.tech_stack))
        tech_stack_result = await self.db.execute(tech_stack_query)
        by_tech_stack = dict(tech_stack_result.all())

        # Get error and fix counts for projects
        if project_id:
            # Single project statistics
            error_count_query = select(func.count()).select_from(Error).where(Error.project_id == project_id)
            error_result = await self.db.execute(error_count_query)
            error_count = error_result.scalar()

            fix_count_query = select(func.count()).select_from(Fix).join(Error).where(Error.project_id == project_id)
            fix_result = await self.db.execute(fix_count_query)
            fix_count = fix_result.scalar()

            # Recent activity
            recent_errors_query = select(func.count()).select_from(Error).where(
                and_(
                    Error.project_id == project_id,
                    Error.created_at >= datetime.utcnow() - timedelta(days=30)
                )
            )
            recent_errors_result = await self.db.execute(recent_errors_query)
            recent_errors = recent_errors_result.scalar()

            return ProjectStatisticsResponse(
                total=1,
                active=1 if active else 0,
                total_errors=error_count,
                total_fixes=fix_count,
                recent_errors_last_30_days=recent_errors,
                by_tech_stack=by_tech_stack
            )
        else:
            # Overall statistics
            all_project_ids_query = select(Project.id).where(and_(*conditions))
            all_project_ids_result = await self.db.execute(all_project_ids_query)
            project_ids = [row[0] for row in all_project_ids_result.all()]

            if project_ids:
                error_count_query = select(func.count()).select_from(Error).where(Error.project_id.in_(project_ids))
                error_result = await self.db.execute(error_count_query)
                total_errors = error_result.scalar()

                fix_count_query = select(func.count()).select_from(Fix).join(Error).where(Error.project_id.in_(project_ids))
                fix_result = await self.db.execute(fix_count_query)
                total_fixes = fix_result.scalar()

                # Recent activity
                recent_errors_query = select(func.count()).select_from(Error).where(
                    and_(
                        Error.project_id.in_(project_ids),
                        Error.created_at >= datetime.utcnow() - timedelta(days=30)
                    )
                )
                recent_errors_result = await self.db.execute(recent_errors_query)
                recent_errors = recent_errors_result.scalar()
            else:
                total_errors = 0
                total_fixes = 0
                recent_errors = 0

            return ProjectStatisticsResponse(
                total=total,
                active=active,
                total_errors=total_errors,
                total_fixes=total_fixes,
                recent_errors_last_30_days=recent_errors,
                by_tech_stack=by_tech_stack
            )

    async def search_projects(
        self,
        query: str,
        skip: int = 0,
        limit: int = 100
    ) -> ProjectListResponse:
        """
        Search projects by text query

        Args:
            query: Search query
            skip: Number of records to skip
            limit: Maximum number of records

        Returns:
            Matching projects
        """
        # Search on name, description, and repository URL
        search_conditions = or_(
            Project.name.ilike(f"%{query}%"),
            Project.description.ilike(f"%{query}%"),
            Project.repository_url.ilike(f"%{query}%")
        )

        # Get total count
        count_query = select(func.count()).select_from(
            select(Project).where(search_conditions).subquery()
        )
        count_result = await self.db.execute(count_query)
        total = count_result.scalar()

        # Get results
        projects_query = select(Project).where(search_conditions).order_by(
            desc(Project.created_at)
        ).offset(skip).limit(limit)

        result = await self.db.execute(projects_query)
        projects = result.scalars().all()

        return ProjectListResponse(
            items=[ProjectResponse.from_orm(project) for project in projects],
            total=total,
            skip=skip,
            limit=limit
        )

    async def get_project_activity(
        self,
        project_id: int,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Get project activity over time

        Args:
            project_id: Project ID
            days: Number of days to look back

        Returns:
            Activity data
        """
        start_date = datetime.utcnow() - timedelta(days=days)

        # Daily error counts
        error_activity_query = select(
            func.date(Error.created_at).label('date'),
            func.count().label('count')
        ).where(
            and_(
                Error.project_id == project_id,
                Error.created_at >= start_date
            )
        ).group_by(func.date(Error.created_at)).order_by('date')

        error_activity_result = await self.db.execute(error_activity_query)
        error_activity = dict(error_activity_result.all())

        # Daily fix counts
        fix_activity_query = select(
            func.date(Fix.created_at).label('date'),
            func.count().label('count')
        ).join(Error).where(
            and_(
                Error.project_id == project_id,
                Fix.created_at >= start_date
            )
        ).group_by(func.date(Fix.created_at)).order_by('date')

        fix_activity_result = await self.db.execute(fix_activity_query)
        fix_activity = dict(fix_activity_result.all())

        # Generate date range
        date_range = []
        current_date = start_date.date()
        end_date = datetime.utcnow().date()

        while current_date <= end_date:
            date_range.append(current_date.isoformat())
            current_date += timedelta(days=1)

        # Fill missing dates with zeros
        error_trend = [error_activity.get(date, 0) for date in date_range]
        fix_trend = [fix_activity.get(date, 0) for date in date_range]

        return {
            "dates": date_range,
            "error_trend": error_trend,
            "fix_trend": fix_trend,
            "total_errors": sum(error_trend),
            "total_fixes": sum(fix_trend)
        }

    async def get_project_health(self, project_id: int) -> Dict[str, Any]:
        """
        Get project health metrics

        Args:
            project_id: Project ID

        Returns:
            Health metrics
        """
        # Get recent errors
        recent_errors_query = select(func.count()).select_from(Error).where(
            and_(
                Error.project_id == project_id,
                Error.created_at >= datetime.utcnow() - timedelta(days=7)
            )
        )
        recent_errors_result = await self.db.execute(recent_errors_query)
        recent_errors = recent_errors_result.scalar()

        # Get critical errors
        critical_errors_query = select(func.count()).select_from(Error).where(
            and_(
                Error.project_id == project_id,
                Error.severity == "critical",
                Error.status != "resolved"
            )
        )
        critical_errors_result = await self.db.execute(critical_errors_query)
        critical_errors = critical_errors_result.scalar()

        # Get fix success rate
        total_fixes_query = select(func.count()).select_from(Fix).join(Error).where(
            Error.project_id == project_id
        )
        total_fixes_result = await self.db.execute(total_fixes_query)
        total_fixes = total_fixes_result.scalar()

        successful_fixes_query = select(func.count()).select_from(Fix).join(Error).where(
            and_(
                Error.project_id == project_id,
                Fix.status == "applied"
            )
        )
        successful_fixes_result = await self.db.execute(successful_fixes_query)
        successful_fixes = successful_fixes_result.scalar()

        fix_success_rate = (successful_fixes / total_fixes * 100) if total_fixes > 0 else 100

        # Calculate health score (0-100)
        health_score = 100
        if recent_errors > 10:
            health_score -= min(30, recent_errors - 10) * 2
        if critical_errors > 0:
            health_score -= min(40, critical_errors * 10)
        if fix_success_rate < 80:
            health_score -= (80 - fix_success_rate) * 0.5

        health_score = max(0, min(100, health_score))

        return {
            "health_score": round(health_score, 1),
            "recent_errors_7_days": recent_errors,
            "critical_errors": critical_errors,
            "total_fixes": total_fixes,
            "successful_fixes": successful_fixes,
            "fix_success_rate": round(fix_success_rate, 1),
            "status": "healthy" if health_score >= 80 else "warning" if health_score >= 60 else "critical"
        }