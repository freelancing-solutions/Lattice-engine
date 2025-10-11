from typing import Dict, Any, List, Optional
import asyncio
import logging
from datetime import datetime
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.agents.base_agent import BaseAgent
from src.agents.pydantic_validator_agent import PydanticValidatorAgent
from src.models.agent_models import AgentRegistration, AgentTask, AgentType, AgentCapability
from src.models.mutation_models import MutationProposal, MutationResult
from src.models.validation_models import ValidationResult
from src.utils.errors import MutationError, ValidationError


logger = logging.getLogger(__name__)


class AgentOrchestrator:
    """Coordinates agents and executes mutation workflows"""

    def __init__(self, approval_manager, websocket_hub=None):
        self.agents: Dict[str, Any] = {}
        self.agent_types: Dict[AgentType, list[str]] = {}
        self.approval_manager = approval_manager
        self.websocket_hub = websocket_hub
        self._running = False

    def register_agent(self, agent):
        registration: AgentRegistration = agent.registration
        self.agents[registration.agent_id] = agent
        self.agent_types.setdefault(registration.agent_type, []).append(
            registration.agent_id
        )
        logger.info(
            "agent_registered", agent_id=registration.agent_id, agent_type=registration.agent_type
        )

    async def start(self):
        self._running = True
        logger.info("orchestrator_started")

    async def stop(self):
        self._running = False
        logger.info("orchestrator_stopped")

    async def execute_mutation_workflow(
        self,
        spec_id: str,
        operation: str,
        changes: Dict[str, Any],
        user_id: str,
    ) -> MutationResult:
        """Complete mutation workflow with optional user approval"""

        # Step 1: Generate proposal (stubbed)
        proposal = await self._generate_proposal(spec_id, operation, changes)

        # Step 2: Validate proposal
        validation: ValidationResult = await self._validate_proposal(proposal)
        if not validation.is_valid:
            raise ValidationError("Proposal validation failed")

        # Step 3: Analyze impact (stub)
        impact = await self._analyze_impact(proposal)
        proposal.impact_analysis = impact

        # Step 4: Determine if approval needed
        needs_approval = self._needs_user_approval(proposal)

        if needs_approval:
            # Step 5: Request approval
            approval_request = await self.approval_manager.request_approval(
                proposal=proposal, user_id=user_id, priority=self._calculate_priority(proposal)
            )

            # Step 6: Wait for response (or timeout)
            response = await self._wait_for_approval(approval_request)

            if response.decision == "rejected":
                return MutationResult(
                    mutation_id=f"mut_{datetime.now().timestamp()}",
                    status="failed",
                    applied_changes={},
                    new_version="",
                    validation_errors=[response.user_notes or "Rejected"],
                    warnings=[],
                    execution_time_ms=0,
                )

            # Update proposal if modified
            if response.decision == "modified" and response.modified_content is not None:
                proposal.proposed_changes["content"] = response.modified_content

        # Step 7: Apply mutation (stub)
        result = await self._apply_mutation(proposal)

        # Step 8: Notify user of completion
        if self.websocket_hub:
            await self.websocket_hub.send_to_user(
                user_id=user_id,
                event="mutation:completed",
                data={"spec_id": spec_id, "result": result.dict()},
            )

        return result

    async def _generate_proposal(self, spec_id: str, operation: str, changes: Dict[str, Any]) -> MutationProposal:
        proposal = MutationProposal(
            proposal_id=f"prop_{datetime.now().timestamp()}",
            spec_id=spec_id,
            operation_type=operation,
            current_version="v1.0.0",
            proposed_changes=changes,
            reasoning="User-initiated mutation",
            confidence=0.9,
            impact_analysis={},
            requires_approval=True,
            affected_specs=[],
        )
        return proposal

    async def _validate_proposal(self, proposal: MutationProposal) -> ValidationResult:
        validator_agent_ids = self.agent_types.get(AgentType.VALIDATOR, [])
        if not validator_agent_ids:
            raise ValidationError("No validator agents available")

        agent_id = validator_agent_ids[0]
        agent = self.agents[agent_id]

        task = AgentTask(
            task_id=f"task_{datetime.now().timestamp()}",
            agent_id=agent_id,
            operation="validate_proposal",
            input_data={"proposal": proposal.dict()},
            status="pending",
            created_at=datetime.now(),
        )

        await agent.assign_task(task)

        while task.status in ["pending", "running"]:
            await asyncio.sleep(0.05)

        if task.status == "failed":
            raise ValidationError(f"Failed to validate proposal: {task.error}")

        return ValidationResult(**task.result)

    async def _analyze_impact(self, proposal: MutationProposal) -> Dict[str, Any]:
        # Placeholder impact analysis
        return {"affected_specs": [], "breaking_changes": False, "complexity": "unknown"}

    def _needs_user_approval(self, proposal: MutationProposal) -> bool:
        if proposal.confidence >= 0.9 and not proposal.impact_analysis.get("breaking_changes", False):
            return False
        if proposal.impact_analysis.get("breaking_changes", False):
            return True
        if proposal.confidence < 0.85:
            return True
        return True

    def _calculate_priority(self, proposal: MutationProposal) -> str:
        if proposal.impact_analysis.get("breaking_changes", False):
            return "critical"
        if proposal.confidence < 0.7:
            return "high"
        return "normal"

    async def _wait_for_approval(self, approval_request):
        timeout = approval_request.timeout_seconds
        elapsed = 0
        poll_interval = 1
        while elapsed < timeout:
            response = await self.approval_manager.check_response(approval_request.request_id)
            if response:
                return response
            await asyncio.sleep(poll_interval)
            elapsed += poll_interval
        return await self.approval_manager.handle_timeout(approval_request.request_id)

    async def _apply_mutation(self, proposal: MutationProposal) -> MutationResult:
        start_time = datetime.now()
        # Stubbed mutation application
        execution_time = int((datetime.now() - start_time).total_seconds() * 1000)
        return MutationResult(
            mutation_id=f"mut_{datetime.now().timestamp()}",
            status="success",
            applied_changes=proposal.proposed_changes,
            new_version="v2.0.0",
            validation_errors=[],
            warnings=[],
            execution_time_ms=execution_time,
        )