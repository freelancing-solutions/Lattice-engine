"""
User service for managing user accounts and operations
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, update
from fastapi import HTTPException
import jwt
from passlib.context import CryptContext

from app.models.user import User
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
from app.core.config import get_settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:
    """Service for managing user accounts and operations"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.settings = get_settings()

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Generate password hash"""
        return pwd_context.hash(password)

    def create_access_token(self, data: dict) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=30)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode,
            self.settings.SECRET_KEY,
            algorithm=self.settings.ALGORITHM
        )
        return encoded_jwt

    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """
        Create a new user

        Args:
            user_data: User creation data

        Returns:
            Created user
        """
        try:
            # Check if user already exists
            existing_query = select(User).where(
                or_(
                    User.email == user_data.email,
                    User.username == user_data.username
                )
            )
            existing_result = await self.db.execute(existing_query)
            existing_user = existing_result.scalar_one_or_none()

            if existing_user:
                if existing_user.email == user_data.email:
                    raise UserAlreadyExistsError(f"User with email {user_data.email} already exists")
                else:
                    raise UserAlreadyExistsError(f"User with username {user_data.username} already exists")

            # Create user
            hashed_password = self.get_password_hash(user_data.password)
            user = User(
                username=user_data.username,
                email=user_data.email,
                password_hash=hashed_password,
                full_name=user_data.full_name,
                role=user_data.role,
                is_active=user_data.is_active,
                metadata=user_data.metadata or {}
            )

            self.db.add(user)
            await self.db.commit()
            await self.db.refresh(user)

            logger.info(f"Created user: {user.username}")

            return UserResponse.from_orm(user)

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating user: {str(e)}")
            raise

    async def authenticate_user(self, email: str, password: str) -> Optional[UserResponse]:
        """
        Authenticate user with email and password

        Args:
            email: User email
            password: User password

        Returns:
            User if authenticated, None otherwise
        """
        query = select(User).where(User.email == email)
        result = await self.db.execute(query)
        user = result.scalar_one_or_none()

        if not user or not self.verify_password(password, user.password_hash):
            return None

        if not user.is_active:
            raise AuthenticationError("User account is disabled")

        logger.info(f"Authenticated user: {user.username}")
        return UserResponse.from_orm(user)

    async def get_user(self, user_id: int) -> UserResponse:
        """
        Get user by ID

        Args:
            user_id: User ID

        Returns:
            User record
        """
        query = select(User).where(User.id == user_id)
        result = await self.db.execute(query)
        user = result.scalar_one_or_none()

        if not user:
            raise UserNotFoundError(f"User with ID {user_id} not found")

        return UserResponse.from_orm(user)

    async def get_user_by_email(self, email: str) -> UserResponse:
        """
        Get user by email

        Args:
            email: User email

        Returns:
            User record
        """
        query = select(User).where(User.email == email)
        result = await self.db.execute(query)
        user = result.scalar_one_or_none()

        if not user:
            raise UserNotFoundError(f"User with email {email} not found")

        return UserResponse.from_orm(user)

    async def get_user_by_username(self, username: str) -> UserResponse:
        """
        Get user by username

        Args:
            username: Username

        Returns:
            User record
        """
        query = select(User).where(User.username == username)
        result = await self.db.execute(query)
        user = result.scalar_one_or_none()

        if not user:
            raise UserNotFoundError(f"User with username {username} not found")

        return UserResponse.from_orm(user)

    async def get_users(
        self,
        role: Optional[str] = None,
        is_active: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> UserListResponse:
        """
        Get users with filtering

        Args:
            role: Filter by role
            is_active: Filter by active status
            skip: Number of records to skip
            limit: Maximum number of records

        Returns:
            List of users
        """
        conditions = []

        if role:
            conditions.append(User.role == role)

        if is_active is not None:
            conditions.append(User.is_active == is_active)

        # Build query
        query = select(User).where(and_(*conditions))

        # Get total count
        count_query = select(func.count()).select_from(
            select(User).where(and_(*conditions)).subquery()
        )
        count_result = await self.db.execute(count_query)
        total = count_result.scalar()

        # Apply pagination and ordering
        query = query.order_by(desc(User.created_at)).offset(skip).limit(limit)

        result = await self.db.execute(query)
        users = result.scalars().all()

        return UserListResponse(
            items=[UserResponse.from_orm(user) for user in users],
            total=total,
            skip=skip,
            limit=limit
        )

    async def update_user(self, user_id: int, user_data: UserUpdate) -> UserResponse:
        """
        Update user record

        Args:
            user_id: User ID
            user_data: Updated user data

        Returns:
            Updated user record
        """
        try:
            # Get existing user
            query = select(User).where(User.id == user_id)
            result = await self.db.execute(query)
            user = result.scalar_one_or_none()

            if not user:
                raise UserNotFoundError(f"User with ID {user_id} not found")

            # Check if username/email conflict
            if user_data.username or user_data.email:
                conflict_query = select(User).where(
                    and_(
                        User.id != user_id,
                        or_(
                            User.username == user_data.username if user_data.username else False,
                            User.email == user_data.email if user_data.email else False
                        )
                    )
                )
                conflict_result = await self.db.execute(conflict_query)
                conflict_user = conflict_result.scalar_one_or_none()

                if conflict_user:
                    if conflict_user.username == user_data.username:
                        raise UserAlreadyExistsError(f"Username {user_data.username} already exists")
                    else:
                        raise UserAlreadyExistsError(f"Email {user_data.email} already exists")

            # Update fields
            update_data = user_data.dict(exclude_unset=True)

            # Handle password separately
            if "password" in update_data:
                update_data["password_hash"] = self.get_password_hash(update_data.pop("password"))

            for field, value in update_data.items():
                if hasattr(user, field):
                    setattr(user, field, value)

            user.updated_at = datetime.utcnow()

            await self.db.commit()
            await self.db.refresh(user)

            logger.info(f"Updated user: {user.username}")

            return UserResponse.from_orm(user)

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating user: {str(e)}")
            raise

    async def delete_user(self, user_id: int) -> bool:
        """
        Delete user account

        Args:
            user_id: User ID

        Returns:
            True if deleted
        """
        try:
            query = select(User).where(User.id == user_id)
            result = await self.db.execute(query)
            user = result.scalar_one_or_none()

            if not user:
                raise UserNotFoundError(f"User with ID {user_id} not found")

            await self.db.delete(user)
            await self.db.commit()

            logger.info(f"Deleted user: {user_id}")

            return True

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting user: {str(e)}")
            raise

    async def deactivate_user(self, user_id: int) -> UserResponse:
        """
        Deactivate user account

        Args:
            user_id: User ID

        Returns:
            Updated user record
        """
        return await self.update_user(user_id, UserUpdate(is_active=False))

    async def activate_user(self, user_id: int) -> UserResponse:
        """
        Activate user account

        Args:
            user_id: User ID

        Returns:
            Updated user record
        """
        return await self.update_user(user_id, UserUpdate(is_active=True))

    async def change_password(
        self,
        user_id: int,
        current_password: str,
        new_password: str
    ) -> bool:
        """
        Change user password

        Args:
            user_id: User ID
            current_password: Current password
            new_password: New password

        Returns:
            True if password changed
        """
        try:
            # Get user
            query = select(User).where(User.id == user_id)
            result = await self.db.execute(query)
            user = result.scalar_one_or_none()

            if not user:
                raise UserNotFoundError(f"User with ID {user_id} not found")

            # Verify current password
            if not self.verify_password(current_password, user.password_hash):
                raise AuthenticationError("Current password is incorrect")

            # Update password
            user.password_hash = self.get_password_hash(new_password)
            user.updated_at = datetime.utcnow()

            await self.db.commit()

            logger.info(f"Changed password for user: {user.username}")

            return True

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error changing password: {str(e)}")
            raise

    async def get_user_statistics(self) -> UserStatisticsResponse:
        """
        Get user statistics

        Returns:
            User statistics
        """
        # Total users
        total_query = select(func.count()).select_from(User)
        total_result = await self.db.execute(total_query)
        total = total_result.scalar()

        # Active users
        active_query = select(func.count()).select_from(User).where(User.is_active == True)
        active_result = await self.db.execute(active_query)
        active = active_result.scalar()

        # Users by role
        role_query = select(User.role, func.count()).select_from(User).group_by(User.role)
        role_result = await self.db.execute(role_query)
        by_role = dict(role_result.all())

        # New users (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        new_query = select(func.count()).select_from(User).where(
            User.created_at >= thirty_days_ago
        )
        new_result = await self.db.execute(new_query)
        new_users = new_result.scalar()

        return UserStatisticsResponse(
            total=total,
            active=active,
            inactive=total - active,
            by_role=by_role,
            new_users_last_30_days=new_users
        )

    async def search_users(
        self,
        query: str,
        skip: int = 0,
        limit: int = 100
    ) -> UserListResponse:
        """
        Search users by text query

        Args:
            query: Search query
            skip: Number of records to skip
            limit: Maximum number of records

        Returns:
            Matching users
        """
        # Search on username, email, and full name
        search_conditions = or_(
            User.username.ilike(f"%{query}%"),
            User.email.ilike(f"%{query}%"),
            User.full_name.ilike(f"%{query}%")
        )

        # Get total count
        count_query = select(func.count()).select_from(
            select(User).where(search_conditions).subquery()
        )
        count_result = await self.db.execute(count_query)
        total = count_result.scalar()

        # Get results
        users_query = select(User).where(search_conditions).order_by(
            desc(User.created_at)
        ).offset(skip).limit(limit)

        result = await self.db.execute(users_query)
        users = result.scalars().all()

        return UserListResponse(
            items=[UserResponse.from_orm(user) for user in users],
            total=total,
            skip=skip,
            limit=limit
        )