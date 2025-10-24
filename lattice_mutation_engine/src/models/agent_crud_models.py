"""
Agent CRUD Models for Lattice Engine

This module defines SQLAlchemy models and Pydantic schemas for agent CRUD operations,
including agent configuration, performance metrics, and API contracts.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional, Dict, Any, List
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, validator
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, Integer, Float, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

from src.models.user_models import Base, OrganizationTable, UserTable
from src.models.agent_models import AgentType, AgentStatus, AgentConfiguration, AgentPerformance


class AgentTable(Base):
    """SQLAlchemy model for agents table"""
    __tablename__ = "agents"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(SQLEnum(AgentType), nullable=False)
    status = Column(SQLEnum(AgentStatus), default=AgentStatus.ACTIVE, nullable=False)
    configuration = Column(JSON, nullable=True)  # Stores AgentConfiguration
    created_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_activity_at = Column(DateTime(timezone=True), nullable=True)
    is_system_agent = Column(Boolean, default=False, nullable=False)

    # Relationships
    organization = relationship("OrganizationTable", back_populates="agents")
    creator = relationship("UserTable", back_populates="created_agents")
    performance_metrics = relationship("AgentPerformanceMetricTable", back_populates="agent", cascade="all, delete-orphan")


class AgentPerformanceMetricTable(Base):
    """SQLAlchemy model for agent performance metrics"""
    __tablename__ = "agent_performance_metrics"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    agent_id = Column(PGUUID(as_uuid=True), ForeignKey("agents.id"), nullable=False)
    task_id = Column(String(100), nullable=False)
    operation = Column(String(100), nullable=False)
    success = Column(Boolean, nullable=False)
    response_time_ms = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)

    # Relationships
    agent = relationship("AgentTable", back_populates="performance_metrics")
    organization = relationship("OrganizationTable")

    # Index for efficient queries
    __table_args__ = (
        {'postgresql_indexes': [
            'CREATE INDEX idx_agent_performance_agent_created ON agent_performance_metrics(agent_id, created_at DESC)'
        ]}
    )


# Pydantic Models for API
class AgentBase(BaseModel):
    """Base Pydantic model for agent"""
    name: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    type: AgentType
    configuration: Optional[AgentConfiguration] = None

    class Config:
        from_attributes = True


class AgentCreate(AgentBase):
    """Pydantic model for creating an agent"""
    organization_id: UUID

    @validator('configuration')
    def validate_configuration(cls, v, values):
        if v is None:
            # Default configuration based on agent type
            agent_type = values.get('type')
            if agent_type == AgentType.SPEC_VALIDATOR:
                return AgentConfiguration(
                    model="claude-3-5-sonnet",
                    temperature=0.3,
                    max_tokens=4000,
                    system_prompt="You are a specification validation agent. Validate that specifications are complete, consistent, and follow best practices.",
                    tools=["validation", "analysis"],
                    constraints=[],
                    triggers=[{"event": "spec_created", "condition": "always"}]
                )
            elif agent_type == AgentType.DEPENDENCY_RESOLVER:
                return AgentConfiguration(
                    model="claude-3-5-sonnet",
                    temperature=0.2,
                    max_tokens=6000,
                    system_prompt="You are a dependency resolution agent. Analyze and resolve dependencies between specifications and components.",
                    tools=["dependency_analysis", "graph_analysis"],
                    constraints=[],
                    triggers=[{"event": "spec_updated", "condition": "dependencies_changed"}]
                )
            elif agent_type == AgentType.SEMANTIC_COHERENCE:
                return AgentConfiguration(
                    model="claude-3-opus",
                    temperature=0.5,
                    max_tokens=8000,
                    system_prompt="You are a semantic coherence agent. Ensure specifications are semantically consistent and meaningful.",
                    tools=["semantic_analysis", "nlp"],
                    constraints=[],
                    triggers=[{"event": "spec_review", "condition": "coherence_check"}]
                )
            elif agent_type == AgentType.MUTATION_GENERATOR:
                return AgentConfiguration(
                    model="claude-3-opus",
                    temperature=0.7,
                    max_tokens=6000,
                    system_prompt="You are a mutation generation agent. Generate appropriate mutations based on specifications.",
                    tools=["code_generation", "mutation_analysis"],
                    constraints=[],
                    triggers=[{"event": "mutation_requested", "condition": "spec_available"}]
                )
            elif agent_type == AgentType.IMPACT_ANALYZER:
                return AgentConfiguration(
                    model="claude-3-5-sonnet",
                    temperature=0.3,
                    max_tokens=5000,
                    system_prompt="You are an impact analysis agent. Analyze the impact of changes on the system.",
                    tools=["impact_analysis", "system_analysis"],
                    constraints=[],
                    triggers=[{"event": "change_proposed", "condition": "impact_required"}]
                )
            elif agent_type == AgentType.CONFLICT_RESOLVER:
                return AgentConfiguration(
                    model="claude-3-opus",
                    temperature=0.4,
                    max_tokens=7000,
                    system_prompt="You are a conflict resolution agent. Resolve conflicts between specifications, mutations, or system states.",
                    tools=["conflict_detection", "resolution_strategies"],
                    constraints=[],
                    triggers=[{"event": "conflict_detected", "condition": "resolution_needed"}]
                )
        return v


class AgentUpdate(BaseModel):
    """Pydantic model for updating an agent"""
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[AgentStatus] = None
    configuration: Optional[AgentConfiguration] = None

    class Config:
        from_attributes = True


class Agent(AgentBase):
    """Complete Pydantic model for agent with all fields"""
    id: UUID
    organization_id: UUID
    status: AgentStatus
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    last_activity_at: Optional[datetime]
    is_system_agent: bool
    performance: Optional[AgentPerformance] = None

    class Config:
        from_attributes = True


class AgentWithMetrics(Agent):
    """Agent model with detailed performance metrics"""
    metrics: List[Dict[str, Any]] = Field(default_factory=list)

    class Config:
        from_attributes = True


class AgentPerformanceMetric(BaseModel):
    """Pydantic model for individual performance metric"""
    id: UUID
    agent_id: UUID
    task_id: str
    operation: str
    success: bool
    response_time_ms: float
    confidence_score: Optional[float]
    error_message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ListResponse(BaseModel):
    """Standard list response format"""
    items: List[Any]
    total: int
    limit: int
    offset: int


def calculate_performance(metrics: List[AgentPerformanceMetricTable]) -> AgentPerformance:
    """
    Calculate aggregated performance metrics from individual performance records.

    Args:
        metrics: List of AgentPerformanceMetricTable records

    Returns:
        AgentPerformance: Aggregated performance metrics
    """
    if not metrics:
        return AgentPerformance(
            success_rate=0.0,
            average_response_time=0.0,
            total_requests=0,
            error_rate=0.0,
            confidence_score=None,
            last_activity=None
        )

    total_requests = len(metrics)
    successful_requests = sum(1 for m in metrics if m.success)
    success_rate = successful_requests / total_requests if total_requests > 0 else 0.0
    error_rate = 1.0 - success_rate

    total_response_time = sum(m.response_time_ms for m in metrics)
    average_response_time = total_response_time / total_requests if total_requests > 0 else 0.0

    confidence_scores = [m.confidence_score for m in metrics if m.confidence_score is not None]
    confidence_score = sum(confidence_scores) / len(confidence_scores) if confidence_scores else None

    last_activity = max(m.created_at for m in metrics) if metrics else None

    return AgentPerformance(
        success_rate=success_rate,
        average_response_time=average_response_time,
        total_requests=total_requests,
        error_rate=error_rate,
        confidence_score=confidence_score,
        last_activity=last_activity
    )