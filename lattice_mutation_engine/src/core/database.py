"""
Database session management for Lattice Engine.

This module provides database session management with SQLAlchemy,
including connection pooling, session factories, and initialization utilities.
"""

from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from src.config.settings import engine_config

# Create database engine
engine = create_engine(
    engine_config.database_url,
    pool_pre_ping=True,  # Check connections before use
    pool_recycle=300,    # Recycle connections after 5 minutes
    echo=False           # Set to True for SQL logging in development
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Import all models to ensure they are registered with Base
from src.models.user_models import UserTable, OrganizationTable, OrganizationMemberTable
from src.models.refresh_token_models import RefreshTokenTable
from src.models.api_key_models import APIKeyTable, SubscriptionTable
from src.models.project_models import ProjectTable, SpecTable, ProjectMutationTable

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Get a database session.

    Yields:
        Database session that is automatically closed after use
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_database() -> None:
    """
    Initialize the database by creating all tables.

    This function should be called once during application startup
    to create all necessary tables in the database.
    """
    Base.metadata.create_all(bind=engine)