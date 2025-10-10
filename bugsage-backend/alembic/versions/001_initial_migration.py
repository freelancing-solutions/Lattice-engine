"""Initial migration

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=100), nullable=True),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=False)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=False)

    # Create projects table
    op.create_table('projects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('repository_url', sa.String(length=500), nullable=True),
        sa.Column('repository_branch', sa.String(length=50), nullable=True),
        sa.Column('tech_stack', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
        sa.UniqueConstraint('repository_url')
    )
    op.create_index(op.f('ix_projects_id'), 'projects', ['id'], unique=False)
    op.create_index(op.f('ix_projects_name'), 'projects', ['name'], unique=False)
    op.create_index(op.f('ix_projects_owner_id'), 'projects', ['owner_id'], unique=False)

    # Create errors table
    op.create_table('errors',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('error_type', sa.String(length=100), nullable=False),
        sa.Column('severity', sa.String(length=20), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('stack_trace', sa.Text(), nullable=True),
        sa.Column('file_path', sa.String(length=500), nullable=True),
        sa.Column('line_number', sa.Integer(), nullable=True),
        sa.Column('function_name', sa.String(length=100), nullable=True),
        sa.Column('occurrence_count', sa.Integer(), nullable=False),
        sa.Column('first_seen', sa.DateTime(), nullable=False),
        sa.Column('last_seen', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
        sa.Column('resolved_by', sa.Integer(), nullable=True),
        sa.Column('resolution_method', sa.String(length=50), nullable=True),
        sa.Column('resolution_details', postgresql.JSONB(), nullable=True),
        sa.Column('ai_analysis', postgresql.JSONB(), nullable=True),
        sa.Column('ai_suggestions', postgresql.JSONB(), nullable=True),
        sa.Column('embedding', postgresql.ARRAY(sa.Float()), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.Column('tags', postgresql.ARRAY(sa.String()), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.ForeignKeyConstraint(['resolved_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_errors_created_at'), 'errors', ['created_at'], unique=False)
    op.create_index(op.f('ix_errors_error_type'), 'errors', ['error_type'], unique=False)
    op.create_index(op.f('ix_errors_id'), 'errors', ['id'], unique=False)
    op.create_index(op.f('ix_errors_project_id'), 'errors', ['project_id'], unique=False)
    op.create_index(op.f('ix_errors_severity'), 'errors', ['severity'], unique=False)
    op.create_index(op.f('ix_errors_status'), 'errors', ['status'], unique=False)
    op.create_index('ix_errors_embedding', 'errors', ['embedding'], unique=False, postgresql_using='gin')

    # Create fixes table
    op.create_table('fixes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('error_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('suggested_code', sa.Text(), nullable=True),
        sa.Column('file_path', sa.String(length=500), nullable=True),
        sa.Column('line_number', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('estimated_effort', sa.String(length=20), nullable=True),
        sa.Column('risk_level', sa.String(length=20), nullable=False),
        sa.Column('prerequisites', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('applied_at', sa.DateTime(), nullable=True),
        sa.Column('applied_by', sa.Integer(), nullable=True),
        sa.Column('application_notes', sa.Text(), nullable=True),
        sa.Column('rejected_at', sa.DateTime(), nullable=True),
        sa.Column('rejected_by', sa.Integer(), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.Column('tags', postgresql.ARRAY(sa.String()), nullable=True),
        sa.ForeignKeyConstraint(['applied_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['error_id'], ['errors.id'], ),
        sa.ForeignKeyConstraint(['rejected_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_fixes_confidence_score'), 'fixes', ['confidence_score'], unique=False)
    op.create_index(op.f('ix_fixes_created_at'), 'fixes', ['created_at'], unique=False)
    op.create_index(op.f('ix_fixes_error_id'), 'fixes', ['error_id'], unique=False)
    op.create_index(op.f('ix_fixes_id'), 'fixes', ['id'], unique=False)
    op.create_index(op.f('ix_fixes_risk_level'), 'fixes', ['risk_level'], unique=False)
    op.create_index(op.f('ix_fixes_status'), 'fixes', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_fixes_status'), table_name='fixes')
    op.drop_index(op.f('ix_fixes_risk_level'), table_name='fixes')
    op.drop_index(op.f('ix_fixes_id'), table_name='fixes')
    op.drop_index(op.f('ix_fixes_error_id'), table_name='fixes')
    op.drop_index(op.f('ix_fixes_created_at'), table_name='fixes')
    op.drop_index(op.f('ix_fixes_confidence_score'), table_name='fixes')
    op.drop_table('fixes')
    op.drop_index('ix_errors_embedding', table_name='errors')
    op.drop_index(op.f('ix_errors_status'), table_name='errors')
    op.drop_index(op.f('ix_errors_severity'), table_name='errors')
    op.drop_index(op.f('ix_errors_project_id'), table_name='errors')
    op.drop_index(op.f('ix_errors_id'), table_name='errors')
    op.drop_index(op.f('ix_errors_error_type'), table_name='errors')
    op.drop_index(op.f('ix_errors_created_at'), table_name='errors')
    op.drop_table('errors')
    op.drop_index(op.f('ix_projects_owner_id'), table_name='projects')
    op.drop_index(op.f('ix_projects_name'), table_name='projects')
    op.drop_index(op.f('ix_projects_id'), table_name='projects')
    op.drop_table('projects')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')