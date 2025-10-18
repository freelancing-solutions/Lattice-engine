import threading
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime

from src.models.mutation_models import MutationProposal, MutationResult


class InMemoryMutationStore:
    """Simple in-memory store for mutation proposals and results.

    This store maintains proposals and results keyed by their IDs. It is intended
    for development and testing. A production implementation should persist to a
    database.
    """

    def __init__(self):
        self._proposal_lock = threading.Lock()
        self._result_lock = threading.Lock()
        self._proposals: Dict[str, MutationProposal] = {}
        self._proposal_order: List[str] = []
        self._results: Dict[str, MutationResult] = {}
        self._result_order: List[str] = []

    # Proposal operations
    def save_proposal(self, proposal: MutationProposal) -> MutationProposal:
        with self._proposal_lock:
            self._proposals[proposal.proposal_id] = proposal
            if proposal.proposal_id not in self._proposal_order:
                self._proposal_order.append(proposal.proposal_id)
        return proposal

    def get_proposal(self, proposal_id: str) -> Optional[MutationProposal]:
        return self._proposals.get(proposal_id)

    def list_proposals(self) -> List[MutationProposal]:
        # Return in insertion order (oldest first)
        return [self._proposals[pid] for pid in self._proposal_order]

    # Result operations
    def save_result(self, result: MutationResult) -> MutationResult:
        with self._result_lock:
            self._results[result.mutation_id] = result
            if result.mutation_id not in self._result_order:
                self._result_order.append(result.mutation_id)
        return result

    def get_result(self, mutation_id: str) -> Optional[MutationResult]:
        return self._results.get(mutation_id)

    def list_results(self) -> List[MutationResult]:
        return [self._results[mid] for mid in self._result_order]

    # Convenience utilities
    def get_status(self, identifier: str) -> Dict[str, str]:
        """Return a status summary for a proposal or result identifier.

        - If `identifier` is a result `mutation_id`, return its status.
        - If `identifier` is a proposal `proposal_id`, return a proposed/awaiting status.
        - Otherwise indicate not found.
        """
        res = self.get_result(identifier)
        if res:
            return {"id": identifier, "kind": "result", "status": res.status}

        prop = self.get_proposal(identifier)
        if prop:
            status = "awaiting_approval" if prop.requires_approval else "scheduled"
            return {"id": identifier, "kind": "proposal", "status": status}

        return {"id": identifier, "kind": "unknown", "status": "not_found"}

    # Store methods for backward compatibility and new functionality
    def store_proposal(self, proposal: MutationProposal) -> MutationProposal:
        """Alias for save_proposal for backward compatibility"""
        return self.save_proposal(proposal)

    def update_proposal(self, proposal_id: str, updates: Dict[str, Any], tenant_id: str) -> Optional[MutationProposal]:
        """Update a mutation proposal with tenant verification"""
        with self._proposal_lock:
            proposal = self._proposals.get(proposal_id)
            if not proposal:
                return None

            # Verify tenant ownership
            if proposal.tenant_id != tenant_id:
                return None

            # Check if proposal is deleted
            if proposal.deleted:
                return None

            # Apply updates to allowed fields
            if 'operation_type' in updates:
                proposal.operation_type = updates['operation_type']
            if 'proposed_changes' in updates:
                proposal.proposed_changes = updates['proposed_changes']
            if 'reasoning' in updates:
                proposal.reasoning = updates['reasoning']
            if 'confidence' in updates:
                proposal.confidence = updates['confidence']
            if 'impact_analysis' in updates:
                proposal.impact_analysis = updates['impact_analysis']

            return proposal

    def delete_proposal(self, proposal_id: str, tenant_id: str) -> bool:
        """Soft delete a mutation proposal with tenant verification"""
        with self._proposal_lock:
            proposal = self._proposals.get(proposal_id)
            if not proposal:
                return False

            # Verify tenant ownership
            if proposal.tenant_id != tenant_id:
                return False

            # Mark as deleted
            proposal.deleted = True
            proposal.deleted_at = datetime.utcnow().isoformat()
            return True

    def list_mutations(self, tenant_id: str, kind: Optional[str] = None) -> List[Dict[str, Any]]:
        """List mutations for a specific tenant, optionally filtered by kind"""
        with self._proposal_lock:
            proposals = []
            for proposal_id in self._proposal_order:
                proposal = self._proposals.get(proposal_id)
                if proposal and proposal.tenant_id == tenant_id and not proposal.deleted:
                    # Filter by kind (operation_type) if specified
                    if kind and proposal.operation_type != kind:
                        continue

                    # Create merged dict with proposal and result data
                    mutation_data = {
                        "id": proposal.proposal_id,
                        "type": "proposal",
                        "operation_type": proposal.operation_type,
                        "spec_id": proposal.spec_id,
                        "status": "awaiting_approval" if proposal.requires_approval else "scheduled",
                        "reasoning": proposal.reasoning,
                        "confidence": proposal.confidence,
                        "tenant_id": proposal.tenant_id,
                        "user_id": proposal.user_id,
                        "reviews": proposal.reviews,
                        "proposed_changes": proposal.proposed_changes,
                        "impact_analysis": proposal.impact_analysis,
                        "requires_approval": proposal.requires_approval,
                        "affected_specs": proposal.affected_specs
                    }

                    # Check if there's a corresponding result
                    result = self._results.get(proposal_id)
                    if result:
                        mutation_data.update({
                            "type": "result",
                            "status": result.status,
                            "applied_changes": result.applied_changes,
                            "new_version": result.new_version,
                            "validation_errors": result.validation_errors,
                            "warnings": result.warnings,
                            "execution_time_ms": result.execution_time_ms
                        })

                    proposals.append(mutation_data)

            return proposals

    def get_mutation(self, identifier: str, tenant_id: str) -> Optional[Dict[str, Any]]:
        """Get a mutation by ID with tenant verification"""
        with self._proposal_lock:
            # Try to find as proposal first
            proposal = self._proposals.get(identifier)
            if proposal and proposal.tenant_id == tenant_id and not proposal.deleted:
                mutation_data = {
                    "id": proposal.proposal_id,
                    "type": "proposal",
                    "operation_type": proposal.operation_type,
                    "spec_id": proposal.spec_id,
                    "status": "awaiting_approval" if proposal.requires_approval else "scheduled",
                    "reasoning": proposal.reasoning,
                    "confidence": proposal.confidence,
                    "tenant_id": proposal.tenant_id,
                    "user_id": proposal.user_id,
                    "reviews": proposal.reviews,
                    "proposed_changes": proposal.proposed_changes,
                    "impact_analysis": proposal.impact_analysis,
                    "requires_approval": proposal.requires_approval,
                    "affected_specs": proposal.affected_specs,
                    "deleted": proposal.deleted,
                    "deleted_at": proposal.deleted_at
                }

                # Check if there's a corresponding result
                result = self._results.get(identifier)
                if result:
                    mutation_data.update({
                        "type": "result",
                        "status": result.status,
                        "applied_changes": result.applied_changes,
                        "new_version": result.new_version,
                        "validation_errors": result.validation_errors,
                        "warnings": result.warnings,
                        "execution_time_ms": result.execution_time_ms
                    })

                return mutation_data

            # Try to find as result
            result = self._results.get(identifier)
            if result:
                # Find the corresponding proposal to verify tenant access
                proposal = self._proposals.get(identifier)
                if proposal and proposal.tenant_id == tenant_id and not proposal.deleted:
                    mutation_data = {
                        "id": result.mutation_id,
                        "type": "result",
                        "operation_type": proposal.operation_type,
                        "spec_id": proposal.spec_id,
                        "status": result.status,
                        "applied_changes": result.applied_changes,
                        "new_version": result.new_version,
                        "validation_errors": result.validation_errors,
                        "warnings": result.warnings,
                        "execution_time_ms": result.execution_time_ms,
                        "tenant_id": proposal.tenant_id,
                        "user_id": proposal.user_id
                    }
                    return mutation_data

            return None

    def get_mutation_status(self, identifier: str, tenant_id: str) -> Optional[str]:
        """Get the status of a mutation with tenant verification"""
        with self._proposal_lock:
            # Check as result first
            result = self._results.get(identifier)
            if result:
                # Find the corresponding proposal to verify tenant access
                proposal = self._proposals.get(identifier)
                if proposal and proposal.tenant_id == tenant_id and not proposal.deleted:
                    return result.status

            # Check as proposal
            proposal = self._proposals.get(identifier)
            if proposal and proposal.tenant_id == tenant_id and not proposal.deleted:
                return "awaiting_approval" if proposal.requires_approval else "scheduled"

            return None