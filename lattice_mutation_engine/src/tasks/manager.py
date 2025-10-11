import uuid
from datetime import datetime
from typing import Dict, Optional, Any, List

from lattice_mutation_engine.approval.websocket_hub import WebSocketHub
from lattice_mutation_engine.models.task_models import (
    TaskRecord,
    TaskRequestPayload,
    TaskClarificationPayload,
    TaskCompletionPayload,
    TaskStatus,
)


class TaskManager:
    """In-memory task manager to coordinate task lifecycle and notifications."""

    def __init__(self, websocket_hub: Optional[WebSocketHub] = None):
        self._tasks: Dict[str, TaskRecord] = {}
        self.websocket_hub = websocket_hub

    def request_task(self, payload: TaskRequestPayload) -> TaskRecord:
        task_id = str(uuid.uuid4())
        record = TaskRecord(
            task_id=task_id,
            requester_id=payload.requester_id,
            operation=payload.operation,
            input_data=payload.input_data,
            status=TaskStatus.PENDING,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            target_agent_type=payload.target_agent_type,
        )
        self._tasks[task_id] = record
        # Notify requester via WebSocket if available
        if self.websocket_hub:
            # For MVP, notify the same requester. In future, route to assigned human gate.
            # Event names follow Remote MCP doc patterns
            try:
                # send_to_user is async, but TaskManager may be used in sync context; schedule fire-and-forget
                import asyncio

                asyncio.create_task(
                    self.websocket_hub.send_to_user(
                        user_id=payload.requester_id,
                        event="task:requested",
                        data={"task": record.dict()},
                    )
                )
            except RuntimeError:
                # No running loop; ignore notification
                pass
        return record

    def clarify_task(self, payload: TaskClarificationPayload) -> Optional[TaskRecord]:
        record = self._tasks.get(payload.task_id)
        if not record:
            return None
        record.status = TaskStatus.CLARIFICATION_REQUESTED
        record.updated_at = datetime.utcnow()
        record.clarification_notes.append(
            {
                "note": payload.note,
                "from_user_id": payload.from_user_id,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )
        if self.websocket_hub:
            try:
                import asyncio

                asyncio.create_task(
                    self.websocket_hub.send_to_user(
                        user_id=record.requester_id,
                        event="task:clarify",
                        data={"task": record.dict()},
                    )
                )
            except RuntimeError:
                pass
        return record

    def complete_task(self, payload: TaskCompletionPayload) -> Optional[TaskRecord]:
        record = self._tasks.get(payload.task_id)
        if not record:
            return None
        record.status = TaskStatus.COMPLETED if payload.success else TaskStatus.FAILED
        record.result = payload.result
        if not payload.success and payload.notes:
            record.error = payload.notes
        record.updated_at = datetime.utcnow()
        if self.websocket_hub:
            try:
                import asyncio

                asyncio.create_task(
                    self.websocket_hub.send_to_user(
                        user_id=record.requester_id,
                        event="task:completed",
                        data={"task": record.dict()},
                    )
                )
            except RuntimeError:
                pass
        return record

    def get_status(self, task_id: str) -> Optional[TaskRecord]:
        return self._tasks.get(task_id)

    def list_tasks(self, requester_id: Optional[str] = None) -> List[TaskRecord]:
        if requester_id is None:
            return list(self._tasks.values())
        return [t for t in self._tasks.values() if t.requester_id == requester_id]