# BugSage Database Schema

## 🗄️ Database Overview

BugSage uses PostgreSQL 15+ as its primary database, leveraging advanced features like JSONB for flexible metadata storage, pgvector for AI embeddings, and native support for time-series data. The schema is designed for high-performance read/write operations and complex analytical queries.

## 📋 Database Configuration

### PostgreSQL Setup
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create database
CREATE DATABASE bugsage WITH
    ENCODING 'UTF8'
    LC_COLLATE='en_US.UTF-8'
    LC_CTYPE='en_US.UTF-8';

-- Create dedicated user
CREATE USER bugsage_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE bugsage TO bugsage_user;
```

### Performance Optimizations
```sql
-- Configure for performance
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
```

## 🏗️ Schema Structure

### Core Tables

#### 1. Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'developer', 'user')),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    avatar_url VARCHAR(500),
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### 2. Organizations Table
```sql
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    website VARCHAR(500),
    logo_url VARCHAR(500),
    plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_plan ON organizations(plan);
CREATE INDEX idx_organizations_created_at ON organizations(created_at);
```

#### 3. User Organizations (Many-to-Many)
```sql
CREATE TABLE user_organizations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- Indexes
CREATE INDEX idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_organization_id ON user_organizations(organization_id);
CREATE INDEX idx_user_organizations_role ON user_organizations(role);
```

#### 4. Projects Table
```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    repository_url VARCHAR(500),
    main_branch VARCHAR(100) DEFAULT 'main',
    language VARCHAR(100),
    framework VARCHAR(100),
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

-- Indexes
CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_language ON projects(language);
CREATE INDEX idx_projects_is_active ON projects(is_active);
CREATE INDEX idx_projects_created_at ON projects(created_at);
```

#### 5. Errors Table
```sql
CREATE TABLE errors (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Basic information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'analyzing', 'fixing', 'resolved', 'ignored')),

    -- Source information
    source VARCHAR(100) NOT NULL, -- sentry, github, manual, etc.
    source_id VARCHAR(255), -- External ID from source system
    source_type VARCHAR(50), -- error, exception, warning, etc.

    -- Error details
    stack_trace TEXT,
    context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',

    -- Classification
    category VARCHAR(100),
    subcategory VARCHAR(100),
    tags TEXT[] DEFAULT '{}',

    -- Assignment and ownership
    assigned_to_id INTEGER REFERENCES users(id),

    -- Resolution tracking
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by_id INTEGER REFERENCES users(id),
    resolution_method VARCHAR(50), -- automatic, manual, ignored
    resolution_notes TEXT,

    -- AI analysis
    ai_analysis JSONB,
    ai_confidence INTEGER CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
    ai_model_version VARCHAR(50),
    ai_suggestions JSONB DEFAULT '[]',

    -- Impact metrics
    affected_users INTEGER DEFAULT 0,
    occurrence_count INTEGER DEFAULT 1,
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Vector embedding for similarity search
    embedding VECTOR(1536),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_errors_project_id ON errors(project_id);
CREATE INDEX idx_errors_severity ON errors(severity);
CREATE INDEX idx_errors_status ON errors(status);
CREATE INDEX idx_errors_source ON errors(source);
CREATE INDEX idx_errors_source_id ON errors(source_id);
CREATE INDEX idx_errors_category ON errors(category);
CREATE INDEX idx_errors_assigned_to_id ON errors(assigned_to_id);
CREATE INDEX idx_errors_created_at ON errors(created_at);
CREATE INDEX idx_errors_first_seen_at ON errors(first_seen_at);
CREATE INDEX idx_errors_last_seen_at ON errors(last_seen_at);

-- Composite indexes
CREATE INDEX idx_errors_project_status ON errors(project_id, status);
CREATE INDEX idx_errors_project_severity ON errors(project_id, severity);
CREATE INDEX idx_errors_severity_status ON errors(severity, status);

-- Full-text search
CREATE INDEX idx_errors_search ON errors USING gin(
    to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(stack_trace, ''))
);

-- Vector similarity search
CREATE INDEX idx_errors_embedding ON errors USING ivfflat (embedding vector_cosine_ops);
```

#### 6. Fixes Table
```sql
CREATE TABLE fixes (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    error_id INTEGER NOT NULL REFERENCES errors(id) ON DELETE CASCADE,

    -- Fix details
    title VARCHAR(255),
    description TEXT,
    fix_type VARCHAR(20) DEFAULT 'automatic' CHECK (fix_type IN ('automatic', 'manual', 'suggested')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'generating', 'testing', 'ready', 'applied', 'failed', 'rolled_back')),

    -- Generated content
    generated_code TEXT,
    code_diff TEXT,
    file_path VARCHAR(500),
    line_number INTEGER,

    -- AI confidence and quality metrics
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    quality_score DECIMAL(3,2) CHECK (quality_score >= 0.0 AND quality_score <= 1.0),
    risk_score DECIMAL(3,2) CHECK (risk_score >= 0.0 AND risk_score <= 1.0),

    -- Testing results
    test_results JSONB DEFAULT '{}',
    test_coverage DECIMAL(5,2) CHECK (test_coverage >= 0.0 AND test_coverage <= 100.0),
    test_passed BOOLEAN DEFAULT false,

    -- Application tracking
    applied_at TIMESTAMP WITH TIME ZONE,
    applied_by_id INTEGER REFERENCES users(id),
    applied_commit_hash VARCHAR(40),

    -- Review and approval
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by_id INTEGER REFERENCES users(id),
    approved BOOLEAN DEFAULT false,
    review_notes TEXT,

    -- Rollback information
    rolled_back_at TIMESTAMP WITH TIME ZONE,
    rollback_reason TEXT,
    rollback_commit_hash VARCHAR(40),

    -- Metadata
    metadata JSONB DEFAULT '{}',
    ai_model_version VARCHAR(50),
    processing_time_ms INTEGER,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_fixes_error_id ON fixes(error_id);
CREATE INDEX idx_fixes_status ON fixes(status);
CREATE INDEX idx_fixes_fix_type ON fixes(fix_type);
CREATE INDEX idx_fixes_applied_by_id ON fixes(applied_by_id);
CREATE INDEX idx_fixes_reviewed_by_id ON fixes(reviewed_by_id);
CREATE INDEX idx_fixes_created_at ON fixes(created_at);
CREATE INDEX idx_fixes_applied_at ON fixes(applied_at);

-- Composite indexes
CREATE INDEX idx_fixes_error_status ON fixes(error_id, status);
CREATE INDEX idx_fixes_status_type ON fixes(status, fix_type);
```

#### 7. Error Occurrences Table (for time-series data)
```sql
CREATE TABLE error_occurrences (
    id BIGSERIAL PRIMARY KEY,
    error_id INTEGER NOT NULL REFERENCES errors(id) ON DELETE CASCADE,

    -- Occurrence details
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    environment VARCHAR(50), -- production, staging, development
    version VARCHAR(100), -- application version
    release VARCHAR(100), -- release identifier

    -- Context information
    user_id VARCHAR(255), -- affected user ID
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    url VARCHAR(1000),
    user_agent TEXT,
    ip_address INET,

    -- Additional context
    context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',

    -- Partition key (for time-based partitioning)
    partition_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Partition by month for performance
CREATE TABLE error_occurrences_y2024m01 PARTITION OF error_occurrences
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Indexes
CREATE INDEX idx_error_occurrences_error_id ON error_occurrences(error_id);
CREATE INDEX idx_error_occurrences_timestamp ON error_occurrences(timestamp);
CREATE INDEX idx_error_occurrences_partition_date ON error_occurrences(partition_date);
CREATE INDEX idx_error_occurrences_environment ON error_occurrences(environment);
CREATE INDEX idx_error_occurrences_user_id ON error_occurrences(user_id);
```

#### 8. Integrations Table
```sql
CREATE TABLE integrations (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Integration details
    name VARCHAR(100) NOT NULL, -- sentry, github, slack, jira, etc.
    type VARCHAR(50) NOT NULL, -- monitoring, vcs, communication, project_management
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),

    -- Configuration
    config JSONB DEFAULT '{}',
    credentials JSONB DEFAULT '{}', -- Encrypted
    webhook_url VARCHAR(500),
    webhook_secret VARCHAR(255),

    -- Synchronization
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_frequency INTEGER DEFAULT 300, -- seconds
    sync_status VARCHAR(50),
    sync_error TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(organization_id, name)
);

-- Indexes
CREATE INDEX idx_integrations_organization_id ON integrations(organization_id);
CREATE INDEX idx_integrations_type ON integrations(type);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_integrations_last_sync_at ON integrations(last_sync_at);
```

#### 9. Notifications Table
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,

    -- Notification details
    type VARCHAR(100) NOT NULL, -- error_detected, fix_generated, fix_applied, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT,

    -- Content
    data JSONB DEFAULT '{}',

    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,

    -- Channels
    channels TEXT[] DEFAULT '{in_app}', -- in_app, email, slack, etc.
    sent_via JSONB DEFAULT '{}',

    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_organization_id ON notifications(organization_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

#### 10. Analytics Events Table
```sql
CREATE TABLE analytics_events (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,

    -- Event details
    event_type VARCHAR(100) NOT NULL, -- error_detected, fix_generated, user_action, etc.
    event_category VARCHAR(50), -- system, user, ai, integration
    event_name VARCHAR(255) NOT NULL,

    -- Event data
    properties JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',

    -- Context
    user_id INTEGER REFERENCES users(id),
    organization_id INTEGER REFERENCES organizations(id),
    project_id INTEGER REFERENCES projects(id),
    error_id INTEGER REFERENCES errors(id),
    fix_id INTEGER REFERENCES fixes(id),

    -- Timing
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_ms INTEGER,

    -- Partition key
    partition_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Partition by month
CREATE TABLE analytics_events_y2024m01 PARTITION OF analytics_events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Indexes
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_organization_id ON analytics_events(organization_id);
CREATE INDEX idx_analytics_events_project_id ON analytics_events(project_id);
CREATE INDEX idx_analytics_events_partition_date ON analytics_events(partition_date);
```

#### 11. System Configuration Table
```sql
CREATE TABLE system_config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT false, -- Whether config is exposed to clients
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_system_config_key ON system_config(key);
CREATE INDEX idx_system_config_category ON system_config(category);
CREATE INDEX idx_system_config_is_public ON system_config(is_public);
```

### Views and Materialized Views

#### 1. Error Statistics View
```sql
CREATE VIEW error_statistics AS
SELECT
    p.id as project_id,
    p.name as project_name,
    COUNT(e.id) as total_errors,
    COUNT(CASE WHEN e.severity = 'critical' THEN 1 END) as critical_errors,
    COUNT(CASE WHEN e.severity = 'high' THEN 1 END) as high_errors,
    COUNT(CASE WHEN e.status = 'resolved' THEN 1 END) as resolved_errors,
    AVG(e.ai_confidence) as avg_ai_confidence,
    MAX(e.last_seen_at) as last_error_at,
    COUNT(CASE WHEN e.created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as errors_last_24h,
    COUNT(CASE WHEN e.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as errors_last_7d
FROM projects p
LEFT JOIN errors e ON p.id = e.project_id
WHERE p.is_active = true
GROUP BY p.id, p.name;
```

#### 2. Fix Performance View
```sql
CREATE VIEW fix_performance AS
SELECT
    DATE_TRUNC('day', f.created_at) as date,
    COUNT(*) as total_fixes,
    COUNT(CASE WHEN f.status = 'applied' THEN 1 END) as applied_fixes,
    COUNT(CASE WHEN f.status = 'failed' THEN 1 END) as failed_fixes,
    AVG(f.confidence_score) as avg_confidence,
    AVG(f.quality_score) as avg_quality,
    AVG(f.test_coverage) as avg_test_coverage,
    AVG(f.processing_time_ms) as avg_processing_time
FROM fixes f
WHERE f.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', f.created_at)
ORDER BY date DESC;
```

#### 3. User Activity View
```sql
CREATE VIEW user_activity AS
SELECT
    u.id as user_id,
    u.username,
    u.full_name,
    COUNT(DISTINCT e.id) as errors_assigned,
    COUNT(DISTINCT f.id) as fixes_reviewed,
    COUNT(DISTINCT f_applied.id) as fixes_applied,
    MAX(e.last_seen_at) as last_activity,
    COUNT(CASE WHEN e.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_activity
FROM users u
LEFT JOIN errors e ON u.id = e.assigned_to_id
LEFT JOIN fixes f ON u.id = f.reviewed_by_id
LEFT JOIN fixes f_applied ON u.id = f_applied.applied_by_id
WHERE u.is_active = true
GROUP BY u.id, u.username, u.full_name;
```

### Triggers and Functions

#### 1. Update Timestamp Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_errors_updated_at BEFORE UPDATE ON errors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fixes_updated_at BEFORE UPDATE ON fixes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 2. Error Occurrence Count Trigger
```sql
CREATE OR REPLACE FUNCTION update_error_occurrence_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE errors
    SET
        occurrence_count = occurrence_count + 1,
        last_seen_at = NEW.timestamp,
        affected_users = GREATEST(affected_users,
            CASE WHEN NEW.user_id IS NOT NULL THEN
                (SELECT COUNT(DISTINCT user_id) FROM error_occurrences WHERE error_id = NEW.error_id)
            ELSE affected_users
            END
        )
    WHERE id = NEW.error_id;

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_error_occurrence_count_trigger
    AFTER INSERT ON error_occurrences
    FOR EACH ROW EXECUTE FUNCTION update_error_occurrence_count();
```

#### 3. Vector Embedding Function
```sql
CREATE OR REPLACE FUNCTION generate_error_embedding(error_title TEXT, error_description TEXT, stack_trace TEXT)
RETURNS VECTOR(1536) AS $$
DECLARE
    combined_text TEXT;
BEGIN
    combined_text := COALESCE(error_title, '') || ' ' || COALESCE(error_description, '') || ' ' || COALESCE(stack_trace, '');

    -- This would integrate with an embedding service
    -- For now, return a placeholder vector
    RETURN '[0]'::VECTOR(1536);
END;
$$ LANGUAGE plpgsql;
```

### Database Procedures

#### 1. Error Cleanup Procedure
```sql
CREATE OR REPLACE PROCEDURE cleanup_old_errors(days_to_keep INTEGER DEFAULT 365)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Delete old error occurrences
    DELETE FROM error_occurrences
    WHERE partition_date < CURRENT_DATE - INTERVAL '1 day' * days_to_keep;

    -- Mark old errors as ignored
    UPDATE errors
    SET status = 'ignored'
    WHERE created_at < CURRENT_DATE - INTERVAL '1 day' * days_to_keep
    AND status NOT IN ('resolved', 'applied');

    -- Delete old analytics events
    DELETE FROM analytics_events
    WHERE partition_date < CURRENT_DATE - INTERVAL '1 day' * days_to_keep;

    COMMIT;
END;
$$;
```

#### 2. Performance Metrics Procedure
```sql
CREATE OR REPLACE PROCEDURE update_performance_metrics()
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update materialized views
    REFRESH MATERIALIZED VIEW CONCURRENTLY error_statistics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY fix_performance;
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_activity;

    -- Update table statistics
    ANALYZE errors;
    ANALYZE fixes;
    ANALYZE error_occurrences;
    ANALYZE analytics_events;

    COMMIT;
END;
$$;
```

### Data Seeding

#### 1. Default System Configuration
```sql
INSERT INTO system_config (key, value, description, category, is_public) VALUES
('ai.model.default', '"gpt-4"', 'Default AI model for analysis', 'ai', false),
('ai.max_tokens', '4000', 'Maximum tokens for AI responses', 'ai', false),
('ai.temperature', '0.1', 'AI model temperature', 'ai', false),
('fix.auto_apply_threshold', '0.8', 'Confidence threshold for auto-applying fixes', 'fix', false),
('notification.channels', '["in_app", "email"]', 'Available notification channels', 'notification', true),
('error.retention_days', '365', 'Number of days to retain error data', 'data', false),
('performance.update_interval', '300', 'Performance metrics update interval (seconds)', 'system', false);
```

### Backup and Recovery Strategy

#### 1. Backup Configuration
```sql
-- Create backup user
CREATE USER backup_user WITH PASSWORD 'backup_password';
GRANT CONNECT ON DATABASE bugsage TO backup_user;
GRANT USAGE ON SCHEMA public TO backup_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;

-- Backup script template
-- pg_dump -h localhost -U backup_user -d bugsage -f backup_$(date +%Y%m%d_%H%M%S).sql
```

#### 2. Point-in-Time Recovery
```sql
-- Enable WAL archiving
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET archive_mode = on;
ALTER SYSTEM SET archive_command = 'cp %p /archive/%f';

-- Recovery configuration
-- In recovery.conf:
-- restore_command = 'cp /archive/%f %p'
-- recovery_target_time = '2024-01-01 12:00:00'
```

### Monitoring and Maintenance

#### 1. Performance Monitoring Query
```sql
-- Monitor slow queries
SELECT
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC;

-- Monitor table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Monitor index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

#### 2. Maintenance Tasks
```sql
-- Auto-vacuum configuration
ALTER SYSTEM SET autovacuum = on;
ALTER SYSTEM SET autovacuum_analyze_scale_factor = 0.05;
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.1;

-- B-tree index maintenance
REINDEX INDEX CONCURRENTLY idx_errors_created_at;
REINDEX INDEX CONCURRENTLY idx_fixes_created_at;

-- Partition maintenance
CREATE OR REPLACE FUNCTION create_monthly_partitions()
RETURNS void AS $$
DECLARE
    start_date date;
    end_date date;
    table_name text;
BEGIN
    start_date := date_trunc('month', CURRENT_DATE + INTERVAL '1 month');
    end_date := start_date + INTERVAL '1 month';

    -- Create error_occurrences partition
    table_name := 'error_occurrences_y' || EXTRACT(year FROM start_date) || 'm' || LPAD(EXTRACT(month FROM start_date)::text, 2, '0');
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF error_occurrences FOR VALUES FROM (%L) TO (%L)',
                   table_name, start_date, end_date);

    -- Create analytics_events partition
    table_name := 'analytics_events_y' || EXTRACT(year FROM start_date) || 'm' || LPAD(EXTRACT(month FROM start_date)::text, 2, '0');
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF analytics_events FOR VALUES FROM (%L) TO (%L)',
                   table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

This comprehensive database schema provides a robust foundation for the BugSage platform, supporting complex error tracking, AI-powered analysis, fix management, and comprehensive analytics. The schema is optimized for performance with proper indexing, partitioning, and monitoring capabilities.