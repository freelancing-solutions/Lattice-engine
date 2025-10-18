"""
Project management API endpoints for Lattice Engine.

This module provides comprehensive CRUD operations for project management,
including settings management, team member management, and statistics aggregation.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_

from src.models.project_models import (
    Project, ProjectCreate, ProjectUpdate, ProjectWithStats,
    ProjectSummary, ProjectSettings, Spec, ProjectMutation,
    ProjectStatus, SpecSyncStatus, MutationStatus
)
from src.models.user_models import OrganizationMember, UserRole
from src.core.database import get_db
from src.auth.middleware import get_current_user, TenantContext, require_organization_access, AuthorizationError

# Create router with prefix and tags
router = APIRouter(
    prefix="/api/v1/projects",
    tags=["projects"]
)

# Helper functions
def _check_project_access(db: Session, project_id: str, organization_id: str) -> Project:
    """Check if project belongs to organization and return project."""
    project = db.query(Project).filter(
        and_(
            Project.id == project_id,
            Project.organization_id == organization_id
        )
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail=f"Project {project_id} not found or access denied"
        )

    return project

def _check_organization_role(db: Session, user_id: str, organization_id: str, required_roles: List[UserRole]) -> OrganizationMember:
    """Check if user has required role in organization."""
    member = db.query(OrganizationMember).filter(
        and_(
            OrganizationMember.user_id == user_id,
            OrganizationMember.organization_id == organization_id,
            OrganizationMember.role.in_(required_roles)
        )
    ).first()

    if not member:
        raise HTTPException(
            status_code=403,
            detail=f"Access denied. Required role: {[r.value for r in required_roles]}"
        )

    return member

# GET /api/v1/projects - List projects with filters
@router.get("/", response_model=Dict[str, Any])
async def list_projects(
    status: Optional[ProjectStatus] = Query(None, description="Filter by project status"),
    search: Optional[str] = Query(None, description="Search by name or description"),
    limit: int = Query(50, ge=1, le=100, description="Number of items to return"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List projects accessible to the current user's organization.

    Supports filtering by status and searching by name/description.
    Returns paginated results.
    """
    try:
        # Build base query scoped by organization
        query = db.query(Project).filter(Project.organization_id == current_user.organization_id)

        # Apply status filter
        if status:
            query = query.filter(Project.status == status)

        # Apply search filter
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Project.name.ilike(search_term),
                    Project.description.ilike(search_term)
                )
            )

        # Get total count
        total = query.count()

        # Apply pagination
        projects = query.offset(offset).limit(limit).all()

        # Convert to project summaries
        project_summaries = []
        for project in projects:
            summary = ProjectSummary(
                id=project.id,
                name=project.name,
                slug=project.slug,
                description=project.description,
                status=project.status,
                created_at=project.created_at,
                updated_at=project.updated_at,
                total_specs=0,  # TODO: Calculate from specs table
                total_mutations=0,  # TODO: Calculate from mutations table
                pending_mutations=0  # TODO: Calculate from mutations table
            )
            project_summaries.append(summary)

        return {
            "items": project_summaries,
            "total": total,
            "page": offset // limit + 1,
            "limit": limit
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list projects: {str(e)}")

# GET /api/v1/projects/{project_id} - Get project details
@router.get("/{project_id}", response_model=Dict[str, Any])
async def get_project(
    project_id: str,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed project information including statistics.
    """
    try:
        # Check project access
        project = _check_project_access(db, project_id, current_user.organization_id)

        # Calculate statistics
        specs_count = db.query(func.count(Spec.id)).filter(Spec.project_id == project_id).scalar() or 0
        mutations_count = db.query(func.count(ProjectMutation.id)).filter(
            ProjectMutation.project_id == project_id
        ).scalar() or 0
        pending_mutations = db.query(func.count(ProjectMutation.id)).filter(
            and_(
                ProjectMutation.project_id == project_id,
                ProjectMutation.status == MutationStatus.PENDING
            )
        ).scalar() or 0
        failed_mutations = db.query(func.count(ProjectMutation.id)).filter(
            and_(
                ProjectMutation.project_id == project_id,
                ProjectMutation.status == MutationStatus.FAILED
            )
        ).scalar() or 0
        invalid_specs = db.query(func.count(Spec.id)).filter(
            and_(
                Spec.project_id == project_id,
                Spec.sync_status == SpecSyncStatus.INVALID
            )
        ).scalar() or 0

        # Build project with stats
        project_with_stats = ProjectWithStats(
            id=project.id,
            name=project.name,
            slug=project.slug,
            description=project.description,
            status=project.status,
            spec_sync_enabled=project.spec_sync_enabled,
            spec_sync_directory=project.spec_sync_directory,
            repository_url=project.repository_url,
            repository_branch=project.repository_branch,
            settings=project.settings or {},
            created_by=project.created_by,
            created_at=project.created_at,
            updated_at=project.updated_at,
            archived_at=project.archived_at,
            archived_by=project.archived_by,
            total_specs=specs_count,
            total_mutations=mutations_count,
            pending_mutations=pending_mutations,
            failed_mutations=failed_mutations,
            invalid_specs=invalid_specs
        )

        return {
            "success": True,
            "data": project_with_stats
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get project: {str(e)}")

# POST /api/v1/projects - Create project
@router.post("/", response_model=Dict[str, Any])
async def create_project(
    project_data: ProjectCreate,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new project within the current user's organization.
    """
    try:
        # Check if user has permission to create projects
        require_organization_access(db, current_user.user_id, current_user.organization_id)

        # TODO: Check organization project limit if needed

        # Generate unique slug within organization
        base_slug = project_data.slug or project_data.name.lower().replace(" ", "-")
        slug = base_slug
        counter = 1

        while db.query(Project).filter(
            and_(
                Project.slug == slug,
                Project.organization_id == current_user.organization_id
            )
        ).first():
            slug = f"{base_slug}-{counter}"
            counter += 1

        # Create project
        project = Project(
            name=project_data.name,
            slug=slug,
            description=project_data.description,
            organization_id=current_user.organization_id,
            spec_sync_enabled=project_data.spec_sync_enabled,
            spec_sync_directory=project_data.spec_sync_directory,
            repository_url=project_data.repository_url,
            repository_branch=project_data.repository_branch,
            settings=project_data.settings or {},
            created_by=current_user.user_id,
            status=ProjectStatus.ACTIVE
        )

        db.add(project)
        db.commit()
        db.refresh(project)

        return {
            "success": True,
            "data": project
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create project: {str(e)}")

# PUT /api/v1/projects/{project_id} - Update project
@router.put("/{project_id}", response_model=Dict[str, Any])
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update project information.

    Requires admin or owner role in the organization.
    """
    try:
        # Check project access
        project = _check_project_access(db, project_id, current_user.organization_id)

        # Check user has admin/owner role
        _check_organization_role(
            db,
            current_user.user_id,
            current_user.organization_id,
            [UserRole.ADMIN, UserRole.OWNER]
        )

        # Update fields
        update_data = project_data.dict(exclude_unset=True)

        # Check slug uniqueness if changed
        if "slug" in update_data and update_data["slug"] != project.slug:
            existing = db.query(Project).filter(
                and_(
                    Project.slug == update_data["slug"],
                    Project.organization_id == current_user.organization_id,
                    Project.id != project_id
                )
            ).first()

            if existing:
                raise HTTPException(
                    status_code=400,
                    detail=f"Project with slug '{update_data['slug']}' already exists"
                )

        # Apply updates
        for field, value in update_data.items():
            setattr(project, field, value)

        project.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(project)

        return {
            "success": True,
            "data": project
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update project: {str(e)}")

# DELETE /api/v1/projects/{project_id} - Archive project
@router.delete("/{project_id}", response_model=Dict[str, Any])
async def archive_project(
    project_id: str,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Archive a project (soft delete).

    Requires admin or owner role in the organization.
    """
    try:
        # Check project access
        project = _check_project_access(db, project_id, current_user.organization_id)

        # Check user has admin/owner role
        _check_organization_role(
            db,
            current_user.user_id,
            current_user.organization_id,
            [UserRole.ADMIN, UserRole.OWNER]
        )

        # Archive project
        project.status = ProjectStatus.ARCHIVED
        project.archived_at = datetime.utcnow()
        project.archived_by = current_user.user_id
        project.updated_at = datetime.utcnow()

        db.commit()

        return {
            "success": True,
            "message": "Project archived successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to archive project: {str(e)}")

# PUT /api/v1/projects/{project_id}/settings - Update project settings
@router.put("/{project_id}/settings", response_model=Dict[str, Any])
async def update_project_settings(
    project_id: str,
    settings: ProjectSettings,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update project-specific settings.

    Requires admin or owner role in the organization.
    """
    try:
        # Check project access
        project = _check_project_access(db, project_id, current_user.organization_id)

        # Check user has admin/owner role
        _check_organization_role(
            db,
            current_user.user_id,
            current_user.organization_id,
            [UserRole.ADMIN, UserRole.OWNER]
        )

        # Merge new settings with existing
        current_settings = project.settings or {}
        updated_settings = {**current_settings, **settings.dict()}

        # Update project settings
        project.settings = updated_settings
        project.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(project)

        return {
            "success": True,
            "data": updated_settings
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update project settings: {str(e)}")

# GET /api/v1/projects/{project_id}/members - List team members
@router.get("/{project_id}/members", response_model=Dict[str, Any])
async def get_project_members(
    project_id: str,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List team members for the project.

    Returns organization members since team management is at organization level.
    """
    try:
        # Check project access
        _check_project_access(db, project_id, current_user.organization_id)

        # Get organization members
        members = db.query(OrganizationMember).filter(
            OrganizationMember.organization_id == current_user.organization_id
        ).all()

        # Transform to response format
        member_list = []
        for member in members:
            member_data = {
                "id": member.id,
                "userId": member.user_id,
                "organizationId": member.organization_id,
                "role": member.role.value,
                "email": getattr(member.user, 'email', ''),  # Assuming user relationship exists
                "fullName": getattr(member.user, 'full_name', ''),  # Assuming user relationship exists
                "invitedBy": member.invited_by,
                "invitedAt": member.invited_at.isoformat() if member.invited_at else None,
                "joinedAt": member.joined_at.isoformat() if member.joined_at else None
            }
            member_list.append(member_data)

        return {
            "success": True,
            "data": {
                "items": member_list,
                "total": len(member_list)
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get project members: {str(e)}")

# POST /api/v1/projects/{project_id}/members - Invite member
@router.post("/{project_id}/members", response_model=Dict[str, Any])
async def invite_project_member(
    project_id: str,
    member_data: Dict[str, Any],  # {email: string, role: string}
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Invite a user to join the organization (and thus have access to the project).

    Requires admin or owner role in the organization.
    """
    try:
        # Check project access
        _check_project_access(db, project_id, current_user.organization_id)

        # Check user has admin/owner role
        _check_organization_role(
            db,
            current_user.user_id,
            current_user.organization_id,
            [UserRole.ADMIN, UserRole.OWNER]
        )

        # TODO: Implement user invitation logic
        # This would typically involve:
        # 1. Finding or creating the user
        # 2. Creating an OrganizationMember record
        # 3. Sending an invitation email
        # 4. Returning the member record

        raise HTTPException(
            status_code=501,
            detail="Member invitation not yet implemented"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to invite member: {str(e)}")

# GET /api/v1/projects/{project_id}/stats - Get project statistics
@router.get("/{project_id}/stats", response_model=Dict[str, Any])
async def get_project_stats(
    project_id: str,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive statistics for a project.
    """
    try:
        # Check project access
        _check_project_access(db, project_id, current_user.organization_id)

        # Calculate mutation statistics
        mutation_stats = db.query(
            func.count(ProjectMutation.id).label('total'),
            func.sum(func.case([(ProjectMutation.status == MutationStatus.PENDING, 1)], else_=0)).label('pending'),
            func.sum(func.case([(ProjectMutation.status == MutationStatus.APPROVED, 1)], else_=0)).label('approved'),
            func.sum(func.case([(ProjectMutation.status == MutationStatus.REJECTED, 1)], else_=0)).label('rejected'),
            func.sum(func.case([(ProjectMutation.status == MutationStatus.DEPLOYED, 1)], else_=0)).label('deployed'),
            func.sum(func.case([(ProjectMutation.status == MutationStatus.FAILED, 1)], else_=0)).label('failed'),
            func.max(ProjectMutation.created_at).label('last_mutation_at')
        ).filter(ProjectMutation.project_id == project_id).first()

        # Calculate spec statistics
        spec_stats = db.query(
            func.count(Spec.id).label('total'),
            func.sum(func.case([(Spec.sync_status == SpecSyncStatus.VALID, 1)], else_=0)).label('valid'),
            func.sum(func.case([(Spec.sync_status == SpecSyncStatus.INVALID, 1)], else_=0)).label('invalid')
        ).filter(Spec.project_id == project_id).first()

        # Calculate team statistics
        team_stats = db.query(
            func.count(OrganizationMember.id).label('total_members')
        ).filter(OrganizationMember.organization_id == current_user.organization_id).first()

        # Build response
        stats = {
            "mutations": {
                "total": mutation_stats.total or 0,
                "pending": mutation_stats.pending or 0,
                "approved": mutation_stats.approved or 0,
                "rejected": mutation_stats.rejected or 0,
                "deployed": mutation_stats.deployed or 0,
                "failed": mutation_stats.failed or 0,
                "lastMutationAt": mutation_stats.last_mutation_at.isoformat() if mutation_stats.last_mutation_at else None
            },
            "specs": {
                "total": spec_stats.total or 0,
                "valid": spec_stats.valid or 0,
                "invalid": spec_stats.invalid or 0
            },
            "team": {
                "totalMembers": team_stats.total_members or 0,
                "activeMembers": team_stats.total_members or 0  # TODO: Calculate active members
            },
            "performance": {
                "avgReviewTime": 0,  # TODO: Calculate average review time
                "avgDeployTime": 0,  # TODO: Calculate average deploy time
                "successRate": 0  # TODO: Calculate success rate
            },
            "period": "all_time"  # TODO: Support time periods
        }

        return {
            "success": True,
            "data": stats
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get project statistics: {str(e)}")