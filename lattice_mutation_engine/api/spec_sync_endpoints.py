from fastapi import APIRouter, Depends, HTTPException

from .endpoints import verify_api_key
from ..spec_sync.daemon import SpecSyncDaemon
from ..config.settings import config as engine_config


router = APIRouter(prefix="/spec-sync", tags=["spec-sync"])


def _get_components():
    from ..api.endpoints import components
    if not components:
        raise HTTPException(status_code=503, detail="Engine not initialized")
    return components


@router.get("/status")
async def status(_auth=Depends(verify_api_key)):
    components = _get_components()
    daemon = components.get("spec_sync_daemon")
    return {
        "enabled": bool(daemon),
        "running": bool(daemon and daemon.is_running()),
        "dir": engine_config.spec_sync_dir,
    }


@router.post("/start")
async def start(_auth=Depends(verify_api_key)):
    components = _get_components()
    daemon = components.get("spec_sync_daemon")
    if daemon and daemon.is_running():
        return {"status": "already_running"}
    # Initialize if missing
    if not daemon:
        repo = components.get("graph_repo")
        daemon = SpecSyncDaemon(repo, engine_config.spec_sync_dir)
        components["spec_sync_daemon"] = daemon
    try:
        daemon.start()
        return {"status": "started", "dir": engine_config.spec_sync_dir}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start spec sync: {e}")


@router.post("/stop")
async def stop(_auth=Depends(verify_api_key)):
    components = _get_components()
    daemon = components.get("spec_sync_daemon")
    if not daemon:
        return {"status": "not_running"}
    try:
        daemon.stop()
        return {"status": "stopped"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop spec sync: {e}")