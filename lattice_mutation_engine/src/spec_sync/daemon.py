import threading
import time
import uuid
from pathlib import Path
from typing import Optional

from src.watchdog.observers import Observer
from src.watchdog.events import FileSystemEventHandler, FileSystemEvent

from src.models.spec_graph_models import Node, NodeType, Status


def stable_spec_id(path: Path) -> str:
    # Stable UUID based on absolute path string
    return str(uuid.uuid5(uuid.NAMESPACE_URL, str(path.resolve())))


class _SpecEventHandler(FileSystemEventHandler):
    def __init__(self, repo, base_dir: Path, index_rebuild_callback):
        super().__init__()
        self.repo = repo
        self.base_dir = base_dir
        self.index_rebuild_callback = index_rebuild_callback

    def on_created(self, event: FileSystemEvent):
        if event.is_directory:
            return
        self._upsert_spec(Path(event.src_path))
        self.index_rebuild_callback()

    def on_modified(self, event: FileSystemEvent):
        if event.is_directory:
            return
        self._upsert_spec(Path(event.src_path))
        self.index_rebuild_callback()

    def on_deleted(self, event: FileSystemEvent):
        if event.is_directory:
            return
        path = Path(event.src_path)
        spec_id = stable_spec_id(path)
        try:
            self.repo.delete_node(spec_id)
        except Exception:
            pass
        self.index_rebuild_callback()

    def _upsert_spec(self, path: Path):
        if path.suffix.lower() not in {".md", ".markdown"}:
            return
        try:
            content = path.read_text(encoding="utf-8")
        except Exception:
            return
        spec_id = stable_spec_id(path)
        name = path.stem
        node = self.repo.get_node(spec_id)
        if node:
            self.repo.update_node(spec_id, {"content": content, "name": name})
        else:
            node = Node(
                id=spec_id,
                name=name,
                type=NodeType.SPEC,
                description=f"Synced from {path.relative_to(self.base_dir)}",
                content=content,
                spec_source=str(path.relative_to(self.base_dir)),
                metadata={"origin": "local"},
                status=Status.DRAFT,
            )
            self.repo.create_node(node)


class SpecSyncDaemon:
    def __init__(self, repo, directory: str, index_rebuild_callback=None):
        self.repo = repo
        self.dir = Path(directory)
        self.observer: Optional[Observer] = None
        self.thread: Optional[threading.Thread] = None
        self.index_rebuild_callback = index_rebuild_callback or (lambda: None)

    def start(self):
        self.dir.mkdir(parents=True, exist_ok=True)
        handler = _SpecEventHandler(self.repo, self.dir, self.index_rebuild_callback)
        self.observer = Observer()
        self.observer.schedule(handler, str(self.dir), recursive=True)

        def _run():
            self.observer.start()
            try:
                while self.observer.is_alive():
                    time.sleep(0.5)
            finally:
                self.observer.stop()
                self.observer.join()

        self.thread = threading.Thread(target=_run, daemon=True)
        self.thread.start()

    def stop(self):
        if self.observer:
            self.observer.stop()
            self.observer.join(timeout=2)
        if self.thread and self.thread.is_alive():
            try:
                self.thread.join(timeout=2)
            except Exception:
                pass

    def is_running(self) -> bool:
        try:
            return bool(self.observer) and self.observer.is_alive()
        except Exception:
            return False