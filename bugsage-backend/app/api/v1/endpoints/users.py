"""
User endpoints for the BugSage API
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.database import get_db
from app.services.user_service import UserService
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserListResponse,
    UserStatisticsResponse
)
from app.core.exceptions import (
    UserNotFoundError,
    UserAlreadyExistsError,
    AuthenticationError,
    ValidationError
)
from app.core.logger import logger

router = APIRouter()
security = HTTPBearer()


@router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new user"""
    try:
        service = UserService(db)
        return await service.create_user(user_data)
    except UserAlreadyExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/login")
async def login(
    email: str,
    password: str,
    db: AsyncSession = Depends(get_db)
):
    """Authenticate user and return access token"""
    try:
        service = UserService(db)
        user = await service.authenticate_user(email, password)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = service.create_access_token(data={"sub": str(user.id)})
        return {"access_token": access_token, "token_type": "bearer"}

    except AuthenticationError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/", response_model=UserListResponse)
async def get_users(
    role: Optional[str] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records"),
    db: AsyncSession = Depends(get_db)
):
    """Get users with filtering"""
    try:
        service = UserService(db)
        return await service.get_users(
            role=role,
            is_active=is_active,
            skip=skip,
            limit=limit
        )
    except Exception as e:
        logger.error(f"Error getting users: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    """Get current authenticated user"""
    try:
        # In a real implementation, you'd decode the JWT token here
        # For now, this is a placeholder
        raise HTTPException(status_code=501, detail="Not implemented")
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific user by ID"""
    try:
        service = UserService(db)
        return await service.get_user(user_id)
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting user: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/email/{email}", response_model=UserResponse)
async def get_user_by_email(
    email: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific user by email"""
    try:
        service = UserService(db)
        return await service.get_user_by_email(email)
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting user by email: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/username/{username}", response_model=UserResponse)
async def get_user_by_username(
    username: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific user by username"""
    try:
        service = UserService(db)
        return await service.get_user_by_username(username)
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting user by username: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update user record"""
    try:
        service = UserService(db)
        return await service.update_user(user_id, user_data)
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except UserAlreadyExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete user account"""
    try:
        service = UserService(db)
        await service.delete_user(user_id)
        return {"message": "User deleted successfully"}
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{user_id}/deactivate", response_model=UserResponse)
async def deactivate_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Deactivate user account"""
    try:
        service = UserService(db)
        return await service.deactivate_user(user_id)
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error deactivating user: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{user_id}/activate", response_model=UserResponse)
async def activate_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Activate user account"""
    try:
        service = UserService(db)
        return await service.activate_user(user_id)
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error activating user: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{user_id}/change-password")
async def change_password(
    user_id: int,
    password_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Change user password"""
    try:
        current_password = password_data.get("current_password")
        new_password = password_data.get("new_password")

        if not current_password or not new_password:
            raise HTTPException(status_code=400, detail="Current password and new password are required")

        service = UserService(db)
        await service.change_password(user_id, current_password, new_password)
        return {"message": "Password changed successfully"}

    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except AuthenticationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/statistics/overview", response_model=UserStatisticsResponse)
async def get_user_statistics(db: AsyncSession = Depends(get_db)):
    """Get user statistics"""
    try:
        service = UserService(db)
        return await service.get_user_statistics()
    except Exception as e:
        logger.error(f"Error getting user statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/search", response_model=UserListResponse)
async def search_users(
    q: str = Query(..., min_length=1, description="Search query"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records"),
    db: AsyncSession = Depends(get_db)
):
    """Search users by text query"""
    try:
        service = UserService(db)
        return await service.search_users(q, skip=skip, limit=limit)
    except Exception as e:
        logger.error(f"Error searching users: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")