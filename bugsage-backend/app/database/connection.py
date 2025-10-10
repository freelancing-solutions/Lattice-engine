"""
Database connection and session management.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
import logging

from app.config import settings, DATABASE_CONFIG

logger = logging.getLogger(__name__)

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    **DATABASE_CONFIG,
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

# Create base model class
Base = declarative_base()


async def get_async_session() -> AsyncSession:
    """Get async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()


async def init_database():
    """Initialize database."""
    try:
        # Import all models to ensure they're registered
        from app.models import user, organization, project, error, fix, integration

        # Create tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


async def close_database():
    """Close database connections."""
    try:
        await engine.dispose()
        logger.info("Database connections closed")
    except Exception as e:
        logger.error(f"Error closing database: {e}")


async def check_database_connection():
    """Check database connection health."""
    try:
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        return True
    except Exception as e:
        logger.error(f"Database connection check failed: {e}")
        return False


class DatabaseManager:
    """Database manager for handling connections and sessions."""

    def __init__(self):
        self.engine = engine
        self.session_factory = AsyncSessionLocal

    async def get_session(self) -> AsyncSession:
        """Get database session."""
        return self.session_factory()

    async def health_check(self) -> bool:
        """Check database health."""
        return await check_database_connection()

    async def execute_raw_sql(self, sql: str, params: dict = None):
        """Execute raw SQL query."""
        async with self.engine.begin() as conn:
            result = await conn.execute(sql, params or {})
            return result

    async def create_tables(self):
        """Create all database tables."""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def drop_tables(self):
        """Drop all database tables."""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)


# Global database manager instance
db_manager = DatabaseManager()