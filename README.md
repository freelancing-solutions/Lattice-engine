Lattice Mutation Engine
========================

Overview
--------
This repository contains the Lattice Mutation Engine implementation, including:
- FastAPI API for mutation proposals, approvals, and health checks
- WebSocket hub for real-time approval requests and notifications
- Agent orchestrator with a ValidatorAgent stub for validation
- ApprovalManager coordinating multi-channel approvals

Quick Start
-----------
Requirements: Python 3.10+

1) Install dependencies
   - python -m pip install -r requirements.txt

2) Run the API server
   - python -m uvicorn lattice_mutation_engine.api.endpoints:app --host 127.0.0.1 --port 8000

3) Health check
   - GET http://127.0.0.1:8000/health

Optional: Enable scaling features
--------------------------------
- Celery background tasks
  - Set environment or config values to enable Celery (in lattice_mutation_engine/config/settings.py):
    - celery_enabled = True
    - celery_broker and celery_backend to your Redis URLs
  - Run a Celery worker: celery -A lattice_mutation_engine.queue.celery_app.celery worker -Q mutations -l info

- Redis Pub/Sub for WebSockets
  - Set redis_url in settings.py to your Redis instance
  - When celery_enabled is True, WebSocketHub uses Redis to publish events across nodes

- API key authentication
  - Set api_keys in settings.py (e.g., ["local-dev-key"]).
  - REST: include header X-API-Key: local-dev-key
  - WebSocket: connect with ?token=local-dev-key

- Prometheus metrics
  - GET http://127.0.0.1:8000/metrics for metrics exposition

Persistence (Neo4j) and Semantic Search
---------------------------------------
- Neo4j persistence for the Spec Graph
  - Configure in lattice_mutation_engine/config/settings.py:
    - graph_backend = "neo4j"
    - graph_db_url = "neo4j://localhost:7687"
    - graph_db_user = "neo4j"
    - graph_db_password = "your-password"
  - Ensure Neo4j is running locally or accessible
  - Install dependencies: python -m pip install -r requirements.txt
  - If the Neo4j driver fails to initialize, the engine falls back to in-memory

- Semantic search backends (planned)
  - embeddings_backend = "none" | "qdrant" | "pgvector" (default: none)
  - Current implementation uses a naive contains search; vector backends to be wired next

Spec Sync Daemon (Local Markdown to Graph)
------------------------------------------
- Enable automatic mirroring of local Markdown specs into the graph repository
  - In settings.py:
    - spec_sync_enabled = True
    - spec_sync_dir = "specs" (or your preferred directory)
  - When enabled, the daemon watches the directory and:
    - Creates/updates SPEC nodes on file create/modify
    - Deletes SPEC nodes on file removal
  - Files are identified with stable IDs derived from their absolute path, ensuring consistent mapping across restarts

Example settings.py configuration
---------------------------------
    graph_backend = "neo4j"
    graph_db_url = "neo4j://localhost:7687"
    graph_db_user = "neo4j"
    graph_db_password = "your-password"
    embeddings_backend = "none"
    spec_sync_enabled = True
    spec_sync_dir = "specs"

Key Endpoints
-------------
- POST /mutations/propose
  Example body:
  {
    "spec_id": "spec-123",
    "operation_type": "update",
    "changes": {"field": "title", "value": "New Title"},
    "initiated_by": "user-42"
  }

- POST /approvals/{request_id}/respond
  Example body:
  {
    "request_id": "<approval-request-id>",
    "approved": true,
    "responded_by": "user-42",
    "responded_via": "web",
    "comments": "Looks good"
  }

- GET /approvals/pending?user_id=user-42

- WebSocket: ws://127.0.0.1:8000/ws/{user_id}/{client_type}

WebSocket Demo Client
---------------------
A simple HTML client is provided in demo/approval_client.html to:
- Connect to the WebSocket for a given user_id and client_type
- Receive approval requests in real-time
- Approve or reject mutation proposals via WebSocket

To run the demo locally:
1) Start the API server (as above)
2) Serve the demo folder (in a second terminal):
   - cd demo
   - python -m http.server 5500
3) Open http://127.0.0.1:5500/approval_client.html in your browser
4) Enter your user_id and client_type (e.g., "web") and click Connect
5) When an approval request arrives, use Approve/Reject buttons to respond
   - If API keys are enabled, add ?token=<your_key> to the websocket URL by editing the client or using /demo mount: http://127.0.0.1:8000/demo/approval_client.html

Notes
-----
- The current ValidatorAgent is a minimal stub; expand validation rules per your spec
- Orchestrator currently stubs mutation application; integrate with your spec storage
- WebSocket cross-origin is allowed by default
- For REST calls from the demo page, configure CORS in FastAPI if needed
 - For multi-node scale, run multiple API pods with sticky sessions and a shared Redis for Pub/Sub and Celery


 ## Project Structure
 ----

** Lattice Engine**
 /lattice_mutation_engine

** MCP Server**
 /mcp-server

 ** VSCode Extension **
 /vscode-extension
----

## Important 

## MCP SDK
Should be located at the following folder
/mcp=sdk

## Important Do not attempt 
Enterprise SSO


## Database Considerations

Use postgresql
with a pydantic based ORM Model (there is a package for this) 
presently our models are already pydantic based so adopt them. 

## Architecture considerations

You can move some of the model related logic into the model itself
for example determining if a subscription is active can be done at model
levels.

## Payment Processor

Use https://paddle.com 
see documentation for a python based implementation


# important 

Documentation inside 

/docs 
is intended for one shotting the platform so keep it updated with all the changes you are making.

once you are all done create a prompt file which is based on the docs
ensure the prompt is very clear on what it is that is to be implemented and what is available on the API, MCP, and VSCode Extensions

do not implement the website.

do not install any packages / do not prepare any environment 
just create code as instructured this is a thin client so it cant 
handle heavy loads.


Do not implement mobile applications - 
Dont bother with analytics for now we will do this later.

Make minimal code changes to have the system working. with the features we want.

Take careful note of where each part of the eco system is located.