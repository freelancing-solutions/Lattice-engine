-- Initialize database with pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create indexes for better performance
-- These will be created by Alembic migrations, but here as backup

-- Error search indexes
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_errors_search ON errors USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Vector similarity index
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_errors_embedding ON errors USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Performance indexes
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_errors_composite ON errors (project_id, status, created_at);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fixes_composite ON fixes (error_id, status, created_at);

-- Create sample data for development (optional)
-- This would be handled by seed scripts in production