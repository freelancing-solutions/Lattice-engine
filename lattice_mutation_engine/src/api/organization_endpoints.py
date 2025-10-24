"""
Organization and team management endpoints for Lattice Engine

This module provides API endpoints for managing organization members,
invitations, and team-related operations.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from src.models.user_models import UserTable, OrganizationTable, OrganizationMemberTable, UserRole
from src.models.invitation_models import (
    OrganizationInvitationTable,
    InvitationStatus,
    InvitationCreate,
    InvitationUpdate,
    Invitation,
    InvitationAccept
)
from src.core.database import get_db
from src.auth.middleware import get_current_user, TenantContext
from src.utils.email import email_service
from src.config.settings import config as engine_config


logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/organizations", tags=["organizations"])


# Response models
class MemberResponse(BaseModel):
    """Response model for organization member"""
    id: str
    user_id: str
    organization_id: str
    email: str
    full_name: str
    role: str
    invited_by: Optional[str] = None
    invited_at: Optional[datetime] = None
    joined_at: Optional[datetime] = None


class UpdateMemberRoleRequest(BaseModel):
    """Request model for updating member role"""
    role: UserRole


class InvitationResponse(BaseModel):
    """Response model for invitation"""
    id: str
    organization_id: str
    invited_by: str
    email: str
    role: str
    token: str
    status: InvitationStatus
    message: Optional[str] = None
    expires_at: datetime
    created_at: datetime
    accepted_at: Optional[datetime] = None


class ListResponse(BaseModel):
    """Generic list response model"""
    items: List[Dict[str, Any]]
    total: int


# Helper functions
def _check_organization_admin(db: Session, user_id: UUID, organization_id: UUID) -> bool:
    """Check if user has admin privileges in organization"""
    member = db.query(OrganizationMemberTable).filter(
        and_(
            OrganizationMemberTable.user_id == user_id,
            OrganizationMemberTable.organization_id == organization_id
        )
    ).first()

    if not member:
        return False

    return member.role in [UserRole.OWNER, UserRole.ADMIN]


def _get_member_role_badge(role: UserRole) -> str:
    """Get role badge color for frontend"""
    role_colors = {
        UserRole.OWNER: "purple",
        UserRole.ADMIN: "blue",
        UserRole.DEVELOPER: "green",
        UserRole.VIEWER: "gray"
    }
    return role_colors.get(role, "gray")


# Organization endpoints
@router.get("/{org_id}/members", response_model=ListResponse)
async def get_organization_members(
    org_id: str,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> ListResponse:
    """List all members of an organization"""
    try:
        # Verify user has access to the organization
        if not current_user.can_access_organization(UUID(org_id)):
            raise HTTPException(status_code=403, detail="Access denied")

        # Query members with user details
        members_query = (
            db.query(
                OrganizationMemberTable,
                UserTable
            )
            .join(UserTable, OrganizationMemberTable.user_id == UserTable.id)
            .filter(OrganizationMemberTable.organization_id == UUID(org_id))
            .order_by(OrganizationMemberTable.joined_at.asc())
        )

        members_data = []
        for member, user in members_query:
            member_data = {
                "id": str(member.id),
                "user_id": str(user.id),
                "organization_id": str(member.organization_id),
                "email": user.email,
                "full_name": user.full_name,
                "role": member.role.value,
                "invited_by": str(member.invited_by) if member.invited_by else None,
                "invited_at": member.invited_at,
                "joined_at": member.joined_at
            }
            members_data.append(member_data)

        return ListResponse(items=members_data, total=len(members_data))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting organization members: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{org_id}/invitations", response_model=InvitationResponse)
async def invite_organization_member(
    org_id: str,
    invitation_data: InvitationCreate,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> InvitationResponse:
    """Invite a new member to the organization"""
    try:
        # Verify user has admin privileges
        if not _check_organization_admin(db, current_user.user_id, UUID(org_id)):
            raise HTTPException(status_code=403, detail="Admin privileges required")

        # Get organization
        organization = db.query(OrganizationTable).filter(
            OrganizationTable.id == UUID(org_id)
        ).first()
        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")

        # Check if email is already a member
        existing_member = (
            db.query(OrganizationMemberTable)
            .join(UserTable, OrganizationMemberTable.user_id == UserTable.id)
            .filter(
                and_(
                    OrganizationMemberTable.organization_id == UUID(org_id),
                    UserTable.email == invitation_data.email
                )
            )
            .first()
        )
        if existing_member:
            raise HTTPException(status_code=400, detail="User is already a member")

        # Check if there's already a pending invitation
        existing_invitation = db.query(OrganizationInvitationTable).filter(
            and_(
                OrganizationInvitationTable.organization_id == UUID(org_id),
                OrganizationInvitationTable.email == invitation_data.email,
                OrganizationInvitationTable.status == InvitationStatus.PENDING
            )
        ).first()
        if existing_invitation:
            raise HTTPException(status_code=400, detail="Invitation already sent")

        # Create invitation
        invitation = OrganizationInvitationTable(
            organization_id=UUID(org_id),
            invited_by=current_user.user_id,
            email=invitation_data.email,
            role=invitation_data.role,
            message=invitation_data.message,
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        invitation.generate_invitation_token()

        db.add(invitation)
        db.commit()
        db.refresh(invitation)

        # Send invitation email
        invitation_url = f"{engine_config.web_url}/accept-invitation?token={invitation.token}"
        email_service.send_invitation_email(
            to_email=invitation.email,
            organization_name=organization.name,
            inviter_name=current_user.user.full_name,
            role=invitation.role.value,
            invitation_token=invitation.token,
            invitation_url=invitation_url
        )

        logger.info(f"Invitation sent to {invitation.email} for organization {org_id}")

        return InvitationResponse.from_orm(invitation)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating invitation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/{org_id}/members/{user_id}", response_model=MemberResponse)
async def update_member_role(
    org_id: str,
    user_id: str,
    role_update: UpdateMemberRoleRequest,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> MemberResponse:
    """Update a member's role in the organization"""
    try:
        # Verify current user has admin privileges
        if not _check_organization_admin(db, current_user.user_id, UUID(org_id)):
            raise HTTPException(status_code=403, detail="Admin privileges required")

        # Get target member
        member = db.query(OrganizationMemberTable).filter(
            and_(
                OrganizationMemberTable.user_id == UUID(user_id),
                OrganizationMemberTable.organization_id == UUID(org_id)
            )
        ).first()
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")

        # Prevent removing last owner
        if member.role == UserRole.OWNER and role_update.role != UserRole.OWNER:
            owner_count = db.query(OrganizationMemberTable).filter(
                and_(
                    OrganizationMemberTable.organization_id == UUID(org_id),
                    OrganizationMemberTable.role == UserRole.OWNER
                )
            ).count()
            if owner_count <= 1:
                raise HTTPException(status_code=400, detail="Cannot remove last owner")

        # Store old role for email notification
        old_role = member.role

        # Update role
        member.role = role_update.role
        db.commit()
        db.refresh(member)

        # Get user details for response
        user = db.query(UserTable).filter(UserTable.id == UUID(user_id)).first()

        # Send role update email
        if user and old_role != role_update.role:
            organization = db.query(OrganizationTable).filter(
                OrganizationTable.id == UUID(org_id)
            ).first()
            if organization:
                email_service.send_role_updated_email(
                    to_email=user.email,
                    organization_name=organization.name,
                    old_role=old_role.value,
                    new_role=role_update.role.value,
                    updated_by=current_user.user.full_name
                )

        logger.info(f"Updated role for user {user_id} in organization {org_id} to {role_update.role.value}")

        return MemberResponse(
            id=str(member.id),
            user_id=str(user.id) if user else "",
            organization_id=str(member.organization_id),
            email=user.email if user else "",
            full_name=user.full_name if user else "",
            role=member.role.value,
            invited_by=str(member.invited_by) if member.invited_by else None,
            invited_at=member.invited_at,
            joined_at=member.joined_at
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating member role: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{org_id}/members/{user_id}")
async def remove_organization_member(
    org_id: str,
    user_id: str,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Remove a member from the organization"""
    try:
        # Verify current user has admin privileges
        if not _check_organization_admin(db, current_user.user_id, UUID(org_id)):
            raise HTTPException(status_code=403, detail="Admin privileges required")

        # Prevent removing self
        if str(current_user.user_id) == user_id:
            raise HTTPException(status_code=400, detail="Cannot remove yourself")

        # Get target member
        member = db.query(OrganizationMemberTable).filter(
            and_(
                OrganizationMemberTable.user_id == UUID(user_id),
                OrganizationMemberTable.organization_id == UUID(org_id)
            )
        ).first()
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")

        # Prevent removing last owner
        if member.role == UserRole.OWNER:
            owner_count = db.query(OrganizationMemberTable).filter(
                and_(
                    OrganizationMemberTable.organization_id == UUID(org_id),
                    OrganizationMemberTable.role == UserRole.OWNER
                )
            ).count()
            if owner_count <= 1:
                raise HTTPException(status_code=400, detail="Cannot remove last owner")

        # Get user details for email notification
        user = db.query(UserTable).filter(UserTable.id == UUID(user_id)).first()
        organization = db.query(OrganizationTable).filter(
            OrganizationTable.id == UUID(org_id)
        ).first()

        # Remove member
        db.delete(member)
        db.commit()

        # Send removal email
        if user and organization:
            email_service.send_member_removed_email(
                to_email=user.email,
                organization_name=organization.name,
                removed_by=current_user.user.full_name
            )

        logger.info(f"Removed user {user_id} from organization {org_id}")

        return {
            "success": True,
            "message": "Member removed successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing member: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{org_id}/invitations", response_model=ListResponse)
async def get_organization_invitations(
    org_id: str,
    status: Optional[InvitationStatus] = Query(None),
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> ListResponse:
    """List invitations for an organization"""
    try:
        # Verify user has admin privileges
        if not _check_organization_admin(db, current_user.user_id, UUID(org_id)):
            raise HTTPException(status_code=403, detail="Admin privileges required")

        # Query invitations
        query = db.query(OrganizationInvitationTable).filter(
            OrganizationInvitationTable.organization_id == UUID(org_id)
        )

        if status:
            query = query.filter(OrganizationInvitationTable.status == status)

        invitations = query.order_by(OrganizationInvitationTable.created_at.desc()).all()

        invitations_data = []
        for invitation in invitations:
            invitation_data = {
                "id": str(invitation.id),
                "organization_id": str(invitation.organization_id),
                "invited_by": str(invitation.invited_by),
                "email": invitation.email,
                "role": invitation.role.value,
                "token": invitation.token,
                "status": invitation.status.value,
                "message": invitation.message,
                "expires_at": invitation.expires_at,
                "created_at": invitation.created_at,
                "accepted_at": invitation.accepted_at
            }
            invitations_data.append(invitation_data)

        return ListResponse(items=invitations_data, total=len(invitations_data))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting invitations: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/invitations/{token}/accept", response_model=MemberResponse)
async def accept_invitation(
    token: str,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> MemberResponse:
    """Accept an organization invitation"""
    try:
        # Find invitation by token
        invitation = db.query(OrganizationInvitationTable).filter(
            OrganizationInvitationTable.token == token
        ).first()
        if not invitation:
            raise HTTPException(status_code=404, detail="Invitation not found")

        # Check if invitation can be accepted
        if not invitation.can_be_accepted():
            if invitation.is_expired():
                raise HTTPException(status_code=400, detail="Invitation has expired")
            else:
                raise HTTPException(status_code=400, detail="Invitation is no longer valid")

        # Verify the invitation email matches the current user's email
        if current_user.user.email != invitation.email:
            raise HTTPException(status_code=400, detail="Invitation email does not match your account")

        # Check if user is already a member
        existing_member = db.query(OrganizationMemberTable).filter(
            and_(
                OrganizationMemberTable.user_id == current_user.user_id,
                OrganizationMemberTable.organization_id == invitation.organization_id
            )
        ).first()
        if existing_member:
            # Update invitation status
            invitation.status = InvitationStatus.ACCEPTED
            invitation.accepted_at = datetime.utcnow()
            db.commit()
            return MemberResponse(
                id=str(existing_member.id),
                user_id=str(existing_member.user_id),
                organization_id=str(existing_member.organization_id),
                email=current_user.user.email,
                full_name=current_user.user.full_name,
                role=existing_member.role.value,
                invited_by=str(existing_member.invited_by) if existing_member.invited_by else None,
                invited_at=existing_member.invited_at,
                joined_at=existing_member.joined_at
            )

        # Create organization membership
        member = OrganizationMemberTable(
            organization_id=invitation.organization_id,
            user_id=current_user.user_id,
            role=invitation.role,
            invited_by=invitation.invited_by,
            joined_at=datetime.utcnow()
        )

        # Update invitation status
        invitation.status = InvitationStatus.ACCEPTED
        invitation.accepted_at = datetime.utcnow()

        db.add(member)
        db.commit()
        db.refresh(member)

        logger.info(f"User {current_user.user_id} accepted invitation to organization {invitation.organization_id}")

        return MemberResponse(
            id=str(member.id),
            user_id=str(member.user_id),
            organization_id=str(member.organization_id),
            email=current_user.user.email,
            full_name=current_user.user.full_name,
            role=member.role.value,
            invited_by=str(member.invited_by) if member.invited_by else None,
            invited_at=member.invited_at,
            joined_at=member.joined_at
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error accepting invitation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")