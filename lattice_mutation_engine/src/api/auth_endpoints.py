"""
Authentication endpoints for Lattice Engine.

This module provides authentication endpoints including login, register, logout,
refresh token, and user profile retrieval.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.models.user_models import UserTable, OrganizationTable, OrganizationMemberTable, UserRole, UserStatus
from src.models.refresh_token_models import RefreshTokenTable, generate_refresh_token, hash_refresh_token, verify_refresh_token, create_refresh_token_expiry
from src.utils.password import hash_password, verify_password
from src.auth.middleware import AuthService, auth_service, TenantContext

# Pydantic models for requests/responses
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    organization_name: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class AuthTokens(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int


class APIResponse(BaseModel):
    success: bool
    data: Optional[AuthTokens] = None
    error: Optional[dict] = None


# Create router
router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def get_current_user(tenant_context: TenantContext = Depends(auth_service.get_current_user)) -> UserTable:
    """Get current user from tenant context."""
    return tenant_context.user


@router.post("/login", response_model=APIResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return tokens."""
    try:
        # Query user by email
        user = db.query(UserTable).filter(UserTable.email == request.email).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Verify password
        if not verify_password(request.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Check if user can login
        if not user.can_login():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is not active"
            )

        # Create access token
        access_token = auth_service.create_jwt_token(user)

        # Create refresh token
        refresh_token, refresh_token_hash = generate_refresh_token()
        expires_at = create_refresh_token_expiry()

        # Store refresh token in database
        db_refresh_token = RefreshTokenTable(
            token_hash=refresh_token_hash,
            user_id=user.id,
            expires_at=expires_at
        )
        db.add(db_refresh_token)

        # Update user's last login
        user.last_login = datetime.now(timezone.utc)

        db.commit()

        # Calculate expires_in for access token (in seconds)
        expires_in = auth_service.config.jwt_access_token_expire_minutes * 60

        return APIResponse(
            success=True,
            data=AuthTokens(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=expires_in
            )
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/register", response_model=APIResponse)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register new user and organization."""
    try:
        # Check if user already exists
        existing_user = db.query(UserTable).filter(UserTable.email == request.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash password
        password_hash = hash_password(request.password)

        # Create user
        user = UserTable(
            email=request.email,
            full_name=request.full_name,
            password_hash=password_hash,
            status=UserStatus.ACTIVE.value,
            email_verified=True  # Auto-verify for now
        )
        db.add(user)
        db.flush()  # Get user ID without committing

        # Create organization
        organization = OrganizationTable(
            name=request.organization_name,
            slug=request.organization_name.lower().replace(" ", "-"),
            owner_id=user.id
        )
        db.add(organization)
        db.flush()  # Get organization ID

        # Create organization membership (owner)
        membership = OrganizationMemberTable(
            user_id=user.id,
            organization_id=organization.id,
            role=UserRole.OWNER.value
        )
        db.add(membership)

        # Create access token
        access_token = auth_service.create_jwt_token(user)

        # Create refresh token
        refresh_token, refresh_token_hash = generate_refresh_token()
        expires_at = create_refresh_token_expiry()

        # Store refresh token in database
        db_refresh_token = RefreshTokenTable(
            token_hash=refresh_token_hash,
            user_id=user.id,
            organization_id=organization.id,
            expires_at=expires_at
        )
        db.add(db_refresh_token)

        db.commit()

        # Calculate expires_in for access token (in seconds)
        expires_in = auth_service.config.jwt_access_token_expire_minutes * 60

        return APIResponse(
            success=True,
            data=AuthTokens(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=expires_in
            )
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/refresh", response_model=APIResponse)
async def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    try:
        # Hash the provided refresh token
        token_hash = hash_refresh_token(request.refresh_token)

        # Find refresh token in database
        db_token = db.query(RefreshTokenTable).filter(
            RefreshTokenTable.token_hash == token_hash
        ).first()

        if not db_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        # Check if token is expired or revoked
        if not db_token.is_valid():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token expired or revoked"
            )

        # Get user
        user = db.query(UserTable).filter(UserTable.id == db_token.user_id).first()
        if not user or not user.can_login():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account not found or inactive"
            )

        # Create new access token
        access_token = auth_service.create_jwt_token(user)

        # Create new refresh token
        new_refresh_token, new_refresh_token_hash = generate_refresh_token()
        new_expires_at = create_refresh_token_expiry()

        # Update existing refresh token with new values
        db_token.token_hash = new_refresh_token_hash
        db_token.expires_at = new_expires_at
        db_token.last_used_at = datetime.now(timezone.utc)

        db.commit()

        # Calculate expires_in for access token (in seconds)
        expires_in = auth_service.config.jwt_access_token_expire_minutes * 60

        return APIResponse(
            success=True,
            data=AuthTokens(
                access_token=access_token,
                refresh_token=new_refresh_token,
                expires_in=expires_in
            )
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/logout", response_model=APIResponse)
async def logout(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Revoke refresh token."""
    try:
        # Hash the provided refresh token
        token_hash = hash_refresh_token(request.refresh_token)

        # Find refresh token in database
        db_token = db.query(RefreshTokenTable).filter(
            RefreshTokenTable.token_hash == token_hash
        ).first()

        if db_token:
            # Mark token as revoked
            db_token.revoked = True
            db_token.revoked_at = datetime.now(timezone.utc)
            db.commit()

        return APIResponse(success=True)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/me", response_model=APIResponse)
async def get_current_user_info(current_user: UserTable = Depends(get_current_user)):
    """Get current user information."""
    try:
        user_data = {
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name,
            "status": current_user.status,
            "email_verified": current_user.email_verified,
            "created_at": current_user.created_at.isoformat(),
            "last_login": current_user.last_login.isoformat() if current_user.last_login else None
        }

        return APIResponse(
            success=True,
            data=user_data
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )