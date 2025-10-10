"""
Base model with common fields and functionality.
"""

from sqlalchemy import Column, Integer, String, DateTime, func, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declared_attr
from datetime import datetime
import uuid

from app.database.connection import Base


class BaseModel(Base):
    """Base model with common fields."""

    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(
        UUID(as_uuid=True),
        default=uuid.uuid4,
        unique=True,
        index=True,
        nullable=False
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )
    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now(),
        nullable=True
    )

    @declared_attr
    def __tablename__(cls):
        """Generate table name from class name."""
        return cls.__name__.lower()

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }

    def update_from_dict(self, data: dict):
        """Update model from dictionary."""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.updated_at = datetime.utcnow()

    def __repr__(self):
        """String representation."""
        return f"<{self.__class__.__name__}(id={self.id}, uuid={self.uuid})>"


class TimestampMixin:
    """Mixin for timestamp fields."""

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )
    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now(),
        nullable=True
    )


class SoftDeleteMixin:
    """Mixin for soft delete functionality."""

    deleted_at = Column(DateTime(timezone=True), nullable=True)
    is_deleted = Column(
        Boolean,
        default=False,
        nullable=False,
        index=True
    )

    def soft_delete(self):
        """Soft delete the record."""
        self.deleted_at = datetime.utcnow()
        self.is_deleted = True

    def restore(self):
        """Restore the soft deleted record."""
        self.deleted_at = None
        self.is_deleted = False