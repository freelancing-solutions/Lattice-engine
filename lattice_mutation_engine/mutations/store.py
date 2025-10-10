import threading
from typing import Dict, List, Optional, Tuple

from ..models.mutation_models import MutationProposal, MutationResult


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