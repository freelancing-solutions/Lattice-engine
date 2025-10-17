import uuid
from typing import Dict, Optional, Any
import asyncio
import logging
from datetime import datetime, timedelta
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.models.approval_models import ApprovalRequest, ApprovalResponse
from src.models.mutation_models import MutationProposal, MutationResult

logger = logging.getLogger(__name__)


class ApprovalManager:
    def __init__(self, websocket_hub, mutation_store=None):
        self.websocket_hub = websocket_hub
        self.mutation_store = mutation_store
        self.pending_approvals: Dict[str, ApprovalRequest] = {}
        self.approval_responses: Dict[str, ApprovalResponse] = {}
        self.timeout_handlers: Dict[str, asyncio.Task] = {}

    async def request_approval(
        self, proposal: MutationProposal, user_id: str, priority: str = "normal"
    ) -> ApprovalRequest:
        channel = await self._select_channel(user_id)
        request = ApprovalRequest(
            request_id=str(uuid.uuid4()),
            proposal_id=proposal.proposal_id,
            user_id=user_id,
            spec_id=proposal.spec_id,
            mutation_type=proposal.operation_type,
            current_content=proposal.current_version,
            proposed_content=proposal.proposed_changes.get("content", ""),
            diff=self._generate_diff(proposal),
            reasoning=proposal.reasoning,
            confidence=proposal.confidence,
            impact_analysis=proposal.impact_analysis,
            priority=priority,
            created_at=datetime.now(),
            expires_at=datetime.now() + timedelta(seconds=300),
            preferred_channel=channel,
        )

        # Persist proposal if a store is available
        if self.mutation_store:
            try:
                self.mutation_store.save_proposal(proposal)
            except Exception:
                logger.warning("Failed to persist proposal to mutation store")

        await self._route_approval(request)
        self.pending_approvals[request.request_id] = request
        try:
            pending_approvals.inc()
        except Exception:
            pass
        self.timeout_handlers[request.request_id] = asyncio.create_task(
            self._schedule_timeout(request.request_id, request.timeout_seconds)
        )
        return request

    async def handle_response(self, response: ApprovalResponse) -> MutationResult:
        if response.request_id in self.timeout_handlers:
            self.timeout_handlers[response.request_id].cancel()
            del self.timeout_handlers[response.request_id]

        self.approval_responses[response.request_id] = response
        request = self.pending_approvals.get(response.request_id)
        if not request:
            # Unknown request; treat as failed
            return MutationResult(
                mutation_id=f"mut_{datetime.now().timestamp()}",
                status="failed",
                applied_changes={},
                new_version="",
                validation_errors=["Unknown approval request"],
                warnings=[],
                execution_time_ms=0,
            )

        self.pending_approvals[response.request_id]
        try:
            pending_approvals.dec()
        except Exception:
            pass

        result = MutationResult(
            mutation_id=f"mut_{datetime.now().timestamp()}",
            status="success" if response.decision == "approved" else "failed",
            applied_changes=request.proposed_content if response.decision == "approved" else {},
            new_version="v2.0.0" if response.decision == "approved" else "",
            validation_errors=[],
            warnings=[],
            execution_time_ms=100,
        )

        # Persist result for later retrieval
        if self.mutation_store:
            try:
                self.mutation_store.save_result(result)
            except Exception:
                logger.warning("Failed to persist mutation result to store")

        await self._notify_result(request.user_id, result)
        try:
            mutations_completed.inc()
        except Exception:
            pass
        return result

    async def check_response(self, request_id: str) -> Optional[ApprovalResponse]:
        return self.approval_responses.get(request_id)

    async def handle_timeout(self, request_id: str):
        request = self.pending_approvals.get(request_id)
        if not request:
            return MutationResult(
                mutation_id=f"mut_{datetime.now().timestamp()}",
                status="failed",
                applied_changes={},
                new_version="",
                validation_errors=["Approval timeout"],
                warnings=[],
                execution_time_ms=0,
            )

        del self.pending_approvals[request_id]
        try:
            pending_approvals.dec()
        except Exception:
            pass
        if request_id in self.timeout_handlers:
            self.timeout_handlers[request_id].cancel()
            del self.timeout_handlers[request_id]

        response = ApprovalResponse(
            request_id=request_id,
            decision="rejected",
            user_notes="Approval timeout",
            responded_via="system",
            timestamp=datetime.now(),
        )
        self.approval_responses[request_id] = response

        result = MutationResult(
            mutation_id=f"mut_{datetime.now().timestamp()}",
            status="failed",
            applied_changes={},
            new_version="",
            validation_errors=["Approval timeout"],
            warnings=[],
            execution_time_ms=0,
        )

        # Persist timeout result
        if self.mutation_store:
            try:
                self.mutation_store.save_result(result)
            except Exception:
                logger.warning("Failed to persist timeout result to store")

        await self._notify_result(request.user_id, result)
        try:
            mutations_completed.inc()
        except Exception:
            pass
        return result

    async def _select_channel(self, user_id: str) -> str:
        vscode_connected = await self.websocket_hub.is_connected(user_id, client_type="vscode")
        if vscode_connected:
            return "vscode"
        web_active = await self.websocket_hub.is_connected(user_id, client_type="web")
        if web_active:
            return "web"
        return "auto"

    async def _route_approval(self, request: ApprovalRequest):
        if request.preferred_channel == "vscode":
            await self.websocket_hub.send_to_user(
                user_id=request.user_id,
                client_type="vscode",
                event="approval:request",
                data=request.dict(),
            )
        elif request.preferred_channel == "web":
            await self.websocket_hub.send_to_user(
                user_id=request.user_id,
                client_type="web",
                event="approval:request",
                data=request.dict(),
            )

        await self.websocket_hub.send_to_user(
            user_id=request.user_id,
            event="notification",
            data={
                "title": "Approval Required",
                "message": f"Mutation for {request.spec_id} needs review",
                "priority": request.priority,
            },
        )

    def _generate_diff(self, proposal: MutationProposal) -> Dict[str, Any]:
        return {"additions": [], "deletions": [], "modifications": []}

    async def _notify_result(self, user_id: str, result: MutationResult):
        await self.websocket_hub.send_to_user(
            user_id=user_id, event="mutation:result", data=result.dict()
        )

    async def _schedule_timeout(self, request_id: str, timeout_seconds: int):
        await asyncio.sleep(timeout_seconds)
        await self.handle_timeout(request_id)

    def get_pending_approvals(self, user_id: str) -> list[dict[str, Any]]:
        """Get pending approvals for a specific user"""
        return [
            approval.dict() for approval in self.pending_approvals.values()
            if approval.user_id == user_id
        ]

    def get_all_approvals(
        self,
        user_id: Optional[str] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None
    ) -> list[dict[str, Any]]:
        """Get all approvals with optional filtering"""
        approvals = []

        # Add pending approvals
        for approval in self.pending_approvals.values():
            if user_id and approval.user_id != user_id:
                continue
            if status and approval.status != status:
                continue
            if priority and approval.priority != priority:
                continue
            approvals.append(approval.dict())

        # Add completed approvals from responses
        for request_id, response in self.approval_responses.items():
            # Find the original request if available
            original_request = None
            for pending_request in self.pending_approvals.values():
                if pending_request.request_id == request_id:
                    original_request = pending_request
                    break

            if not original_request:
                continue

            # Apply filters to completed approval
            if user_id and original_request.user_id != user_id:
                continue
            if status and response.decision != status:
                continue
            if priority and original_request.priority != priority:
                continue

            # Create completed approval dict
            approval_dict = original_request.dict()
            approval_dict.update({
                "status": response.decision,
                "response_notes": response.user_notes,
                "responded_via": response.responded_via,
                "response_timestamp": response.timestamp.isoformat()
            })
            approvals.append(approval_dict)

        return approvals

    def get_approval_by_id(self, request_id: str) -> Optional[dict[str, Any]]:
        """Get a single approval by ID"""
        # Check pending approvals first
        if request_id in self.pending_approvals:
            return self.pending_approvals[request_id].dict()

        # Check completed approvals
        if request_id in self.approval_responses:
            # Find the original request
            for pending_request in self.pending_approvals.values():
                if pending_request.request_id == request_id:
                    approval_dict = pending_request.dict()
                    response = self.approval_responses[request_id]
                    approval_dict.update({
                        "status": response.decision,
                        "response_notes": response.user_notes,
                        "responded_via": response.responded_via,
                        "response_timestamp": response.timestamp.isoformat()
                    })
                    return approval_dict

        return None

    def respond_to_approval(self, request_id: str, response: ApprovalResponse) -> MutationResult:
        """Respond to an approval request (alias for handle_response for consistency)"""
        return asyncio.create_task(self.handle_response(response))