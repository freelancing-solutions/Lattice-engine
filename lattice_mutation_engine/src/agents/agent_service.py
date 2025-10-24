"""
Agent Service for Lattice Engine

This module provides the agent service layer that bridges CRUD operations
with orchestrator registration for agent lifecycle management.
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4

from sqlalchemy.orm import Session
from sqlalchemy import and_

from src.models.agent_crud_models import (
    AgentTable, AgentPerformanceMetricTable, Agent, AgentCreate,
    AgentUpdate, AgentWithMetrics, calculate_performance
)
from src.models.agent_models import (
    AgentType, AgentStatus, AgentRegistration, AgentCapability
)
from src.agents.orchestrator import AgentOrchestrator
from src.agents.agent_factory import AgentFactory
from src.utils.errors import ValidationError, NotFoundError


logger = logging.getLogger(__name__)


class AgentService:
    """Service layer for agent CRUD operations and orchestrator integration"""

    def __init__(self, db: Session, orchestrator: AgentOrchestrator):
        self.db = db
        self.orchestrator = orchestrator

    def create_agent(self, agent_data: AgentCreate, created_by: str) -> Agent:
        """
        Create a new agent and register it with the orchestrator.

        Args:
            agent_data: Agent creation data
            created_by: User ID creating the agent

        Returns:
            Agent: Created agent model

        Raises:
            ValidationError: If agent data is invalid
            Exception: If database or orchestrator error occurs
        """
        try:
            # Create agent record in database
            agent_record = AgentTable(
                organization_id=agent_data.organization_id,
                name=agent_data.name,
                description=agent_data.description,
                type=agent_data.type,
                status=AgentStatus.ACTIVE,
                configuration=agent_data.configuration.dict() if agent_data.configuration else None,
                created_by=UUID(created_by),
                is_system_agent=False
            )

            self.db.add(agent_record)
            self.db.commit()
            self.db.refresh(agent_record)

            # Map documentation type to orchestration type
            orchestration_type = self._map_agent_type_to_orchestration(agent_data.type)

            # Create runtime agent instance using AgentFactory
            agent_instance = self._create_runtime_agent(
                agent_record.id,
                orchestration_type,
                agent_data.configuration
            )

            if agent_instance:
                # Register with orchestrator
                self.orchestrator.register_agent(agent_instance)
                logger.info(f"Agent {agent_record.id} registered with orchestrator")

            # Get performance metrics (will be empty for new agent)
            performance = self._get_agent_performance(agent_record.id)

            # Return Agent model
            return Agent(
                id=agent_record.id,
                organization_id=agent_record.organization_id,
                name=agent_record.name,
                description=agent_record.description,
                type=agent_record.type,
                status=agent_record.status,
                configuration=agent_data.configuration,
                performance=performance,
                created_by=agent_record.created_by,
                created_at=agent_record.created_at,
                updated_at=agent_record.updated_at,
                last_activity_at=agent_record.last_activity_at,
                is_system_agent=agent_record.is_system_agent
            )

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating agent: {str(e)}")
            raise

    def get_agent(self, agent_id: str, organization_id: str) -> Optional[Agent]:
        """
        Get an agent by ID and organization.

        Args:
            agent_id: Agent UUID
            organization_id: Organization UUID

        Returns:
            Agent: Agent model or None if not found
        """
        try:
            agent_record = self.db.query(AgentTable).filter(
                and_(
                    AgentTable.id == UUID(agent_id),
                    AgentTable.organization_id == UUID(organization_id)
                )
            ).first()

            if not agent_record:
                return None

            # Get performance metrics
            performance = self._get_agent_performance(agent_record.id)

            return Agent(
                id=agent_record.id,
                organization_id=agent_record.organization_id,
                name=agent_record.name,
                description=agent_record.description,
                type=agent_record.type,
                status=agent_record.status,
                configuration=agent_record.configuration,
                performance=performance,
                created_by=agent_record.created_by,
                created_at=agent_record.created_at,
                updated_at=agent_record.updated_at,
                last_activity_at=agent_record.last_activity_at,
                is_system_agent=agent_record.is_system_agent
            )

        except Exception as e:
            logger.error(f"Error getting agent {agent_id}: {str(e)}")
            return None

    def list_agents(
        self,
        organization_id: str,
        type_filter: Optional[AgentType] = None,
        status_filter: Optional[AgentStatus] = None
    ) -> List[Agent]:
        """
        List agents for an organization with optional filtering.

        Args:
            organization_id: Organization UUID
            type_filter: Optional agent type filter
            status_filter: Optional agent status filter

        Returns:
            List[Agent]: List of agent models
        """
        try:
            query = self.db.query(AgentTable).filter(
                AgentTable.organization_id == UUID(organization_id)
            )

            if type_filter:
                query = query.filter(AgentTable.type == type_filter)

            if status_filter:
                query = query.filter(AgentTable.status == status_filter)

            agent_records = query.order_by(AgentTable.created_at.desc()).all()

            agents = []
            for record in agent_records:
                # Get performance metrics
                performance = self._get_agent_performance(record.id)

                agent = Agent(
                    id=record.id,
                    organization_id=record.organization_id,
                    name=record.name,
                    description=record.description,
                    type=record.type,
                    status=record.status,
                    configuration=record.configuration,
                    performance=performance,
                    created_by=record.created_by,
                    created_at=record.created_at,
                    updated_at=record.updated_at,
                    last_activity_at=record.last_activity_at,
                    is_system_agent=record.is_system_agent
                )
                agents.append(agent)

            return agents

        except Exception as e:
            logger.error(f"Error listing agents: {str(e)}")
            return []

    def update_agent(self, agent_id: str, updates: AgentUpdate, organization_id: str) -> Optional[Agent]:
        """
        Update an agent and re-register with orchestrator if configuration changed.

        Args:
            agent_id: Agent UUID
            updates: Agent update data
            organization_id: Organization UUID

        Returns:
            Agent: Updated agent model or None if not found
        """
        try:
            agent_record = self.db.query(AgentTable).filter(
                and_(
                    AgentTable.id == UUID(agent_id),
                    AgentTable.organization_id == UUID(organization_id)
                )
            ).first()

            if not agent_record:
                return None

            configuration_changed = False

            # Update fields
            if updates.name is not None:
                agent_record.name = updates.name
            if updates.description is not None:
                agent_record.description = updates.description
            if updates.status is not None:
                agent_record.status = updates.status
            if updates.configuration is not None:
                old_configuration = agent_record.configuration
                agent_record.configuration = updates.configuration.dict()
                configuration_changed = (old_configuration != agent_record.configuration)

            agent_record.updated_at = datetime.now(timezone.utc)

            self.db.commit()
            self.db.refresh(agent_record)

            # If configuration changed, re-register with orchestrator
            if configuration_changed and not agent_record.is_system_agent:
                self._unregister_agent_from_orchestrator(agent_id)

                # Create new agent instance
                orchestration_type = self._map_agent_type_to_orchestration(agent_record.type)
                agent_instance = self._create_runtime_agent(
                    agent_record.id,
                    orchestration_type,
                    updates.configuration
                )

                if agent_instance:
                    self.orchestrator.register_agent(agent_instance)
                    logger.info(f"Agent {agent_id} re-registered with orchestrator after configuration update")

            # Get updated performance metrics
            performance = self._get_agent_performance(agent_record.id)

            return Agent(
                id=agent_record.id,
                organization_id=agent_record.organization_id,
                name=agent_record.name,
                description=agent_record.description,
                type=agent_record.type,
                status=agent_record.status,
                configuration=updates.configuration,
                performance=performance,
                created_by=agent_record.created_by,
                created_at=agent_record.created_at,
                updated_at=agent_record.updated_at,
                last_activity_at=agent_record.last_activity_at,
                is_system_agent=agent_record.is_system_agent
            )

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating agent {agent_id}: {str(e)}")
            return None

    def delete_agent(self, agent_id: str, organization_id: str) -> bool:
        """
        Delete an agent and unregister from orchestrator.

        Args:
            agent_id: Agent UUID
            organization_id: Organization UUID

        Returns:
            bool: True if deleted successfully
        """
        try:
            agent_record = self.db.query(AgentTable).filter(
                and_(
                    AgentTable.id == UUID(agent_id),
                    AgentTable.organization_id == UUID(organization_id)
                )
            ).first()

            if not agent_record:
                return False

            # Prevent deletion of system agents
            if agent_record.is_system_agent:
                logger.warning(f"Attempted to delete system agent {agent_id}")
                return False

            # Unregister from orchestrator
            self._unregister_agent_from_orchestrator(agent_id)

            # Delete from database (hard delete)
            self.db.delete(agent_record)
            self.db.commit()

            logger.info(f"Agent {agent_id} deleted successfully")
            return True

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting agent {agent_id}: {str(e)}")
            return False

    def get_agent_performance(self, agent_id: str, organization_id: str, period: str = '30d') -> Optional[Any]:
        """
        Get agent performance metrics for a specific period.

        Args:
            agent_id: Agent UUID
            organization_id: Organization UUID
            period: Time period ('1h', '24h', '7d', '30d')

        Returns:
            AgentPerformance: Performance metrics or None
        """
        try:
            # Calculate date range based on period
            end_time = datetime.now(timezone.utc)
            start_time = self._calculate_start_time(end_time, period)

            # Query performance metrics
            metrics = self.db.query(AgentPerformanceMetricTable).filter(
                and_(
                    AgentPerformanceMetricTable.agent_id == UUID(agent_id),
                    AgentPerformanceMetricTable.organization_id == UUID(organization_id),
                    AgentPerformanceMetricTable.created_at >= start_time,
                    AgentPerformanceMetricTable.created_at <= end_time
                )
            ).order_by(AgentPerformanceMetricTable.created_at.desc()).all()

            return calculate_performance(metrics)

        except Exception as e:
            logger.error(f"Error getting agent performance {agent_id}: {str(e)}")
            return None

    def record_task_execution(
        self,
        agent_id: str,
        task_id: str,
        operation: str,
        success: bool,
        response_time_ms: float,
        confidence_score: Optional[float],
        error_message: Optional[str],
        organization_id: str
    ) -> bool:
        """
        Record a task execution metric for an agent.

        Args:
            agent_id: Agent UUID
            task_id: Task ID
            operation: Operation performed
            success: Whether the task was successful
            response_time_ms: Response time in milliseconds
            confidence_score: Optional confidence score
            error_message: Optional error message
            organization_id: Organization UUID

        Returns:
            bool: True if recorded successfully
        """
        try:
            # Create performance metric record
            metric_record = AgentPerformanceMetricTable(
                agent_id=UUID(agent_id),
                task_id=task_id,
                operation=operation,
                success=success,
                response_time_ms=response_time_ms,
                confidence_score=confidence_score,
                error_message=error_message,
                organization_id=UUID(organization_id)
            )

            self.db.add(metric_record)

            # Update agent's last activity
            self.db.query(AgentTable).filter(
                AgentTable.id == UUID(agent_id)
            ).update({"last_activity_at": datetime.now(timezone.utc)})

            self.db.commit()
            return True

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error recording task execution: {str(e)}")
            return False

    def _map_agent_type_to_orchestration(self, agent_type: AgentType) -> str:
        """
        Map documentation agent type to orchestration agent type.

        Args:
            agent_type: Documentation agent type

        Returns:
            str: Orchestration agent type
        """
        mapping = {
            AgentType.SPEC_VALIDATOR: AgentType.VALIDATOR.value,
            AgentType.DEPENDENCY_RESOLVER: AgentType.DEPENDENCY.value,
            AgentType.SEMANTIC_COHERENCE: AgentType.SEMANTIC.value,
            AgentType.MUTATION_GENERATOR: AgentType.MUTATION.value,
            AgentType.IMPACT_ANALYZER: AgentType.IMPACT.value,
            AgentType.CONFLICT_RESOLVER: AgentType.CONFLICT.value,
        }

        # For orchestration types, return as-is
        if agent_type in [AgentType.VALIDATOR, AgentType.DEPENDENCY, AgentType.SEMANTIC,
                         AgentType.MUTATION, AgentType.IMPACT, AgentType.CONFLICT]:
            return agent_type.value

        return mapping.get(agent_type, AgentType.VALIDATOR.value)

    def _create_runtime_agent(self, agent_id: UUID, agent_type: str, configuration: Optional[Any]) -> Optional[Any]:
        """
        Create a runtime agent instance using AgentFactory.

        Args:
            agent_id: Agent UUID
            agent_type: Agent type for factory
            configuration: Agent configuration

        Returns:
            Agent instance or None if creation failed
        """
        try:
            # For now, use the existing AgentFactory patterns
            # This would need to be extended to support custom configurations
            if agent_type == AgentType.VALIDATOR.value:
                return AgentFactory.create_validator_agent(str(agent_id))
            elif agent_type == AgentType.DEPENDENCY.value:
                return AgentFactory.create_dependency_agent(str(agent_id))
            elif agent_type == AgentType.SEMANTIC.value:
                return AgentFactory.create_semantic_agent(str(agent_id))
            elif agent_type == AgentType.MUTATION.value:
                return AgentFactory.create_mutation_agent(str(agent_id))
            elif agent_type == AgentType.IMPACT.value:
                return AgentFactory.create_impact_agent(str(agent_id))
            elif agent_type == AgentType.CONFLICT.value:
                return AgentFactory.create_conflict_agent(str(agent_id))
            else:
                logger.warning(f"Unknown agent type: {agent_type}")
                return None

        except Exception as e:
            logger.error(f"Error creating runtime agent: {str(e)}")
            return None

    def _unregister_agent_from_orchestrator(self, agent_id: str):
        """
        Unregister an agent from the orchestrator.

        Args:
            agent_id: Agent UUID string
        """
        try:
            if agent_id in self.orchestrator.agents:
                agent = self.orchestrator.agents[agent_id]
                agent_type = agent.registration.agent_type

                # Remove from agents dict
                del self.orchestrator.agents[agent_id]

                # Remove from agent_types dict
                if agent_type in self.orchestrator.agent_types:
                    if agent_id in self.orchestrator.agent_types[agent_type]:
                        self.orchestrator.agent_types[agent_type].remove(agent_id)

                        # Clean up empty type lists
                        if not self.orchestrator.agent_types[agent_type]:
                            del self.orchestrator.agent_types[agent_type]

                logger.info(f"Agent {agent_id} unregistered from orchestrator")

        except Exception as e:
            logger.error(f"Error unregistering agent {agent_id}: {str(e)}")

    def _get_agent_performance(self, agent_id: UUID) -> Optional[Any]:
        """
        Get current performance metrics for an agent.

        Args:
            agent_id: Agent UUID

        Returns:
            AgentPerformance or None
        """
        try:
            # Get recent performance metrics (last 30 days)
            end_time = datetime.now(timezone.utc)
            start_time = end_time - timedelta(days=30)

            metrics = self.db.query(AgentPerformanceMetricTable).filter(
                and_(
                    AgentPerformanceMetricTable.agent_id == agent_id,
                    AgentPerformanceMetricTable.created_at >= start_time,
                    AgentPerformanceMetricTable.created_at <= end_time
                )
            ).all()

            return calculate_performance(metrics)

        except Exception as e:
            logger.error(f"Error getting agent performance: {str(e)}")
            return None

    def _calculate_start_time(self, end_time: datetime, period: str) -> datetime:
        """
        Calculate start time based on period string.

        Args:
            end_time: End time
            period: Period string ('1h', '24h', '7d', '30d')

        Returns:
            datetime: Start time
        """
        if period == '1h':
            return end_time - timedelta(hours=1)
        elif period == '24h':
            return end_time - timedelta(days=1)
        elif period == '7d':
            return end_time - timedelta(days=7)
        elif period == '30d':
            return end_time - timedelta(days=30)
        else:
            # Default to 24h
            return end_time - timedelta(days=1)