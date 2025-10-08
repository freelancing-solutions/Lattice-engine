from prometheus_client import Counter, Gauge, CollectorRegistry, generate_latest, CONTENT_TYPE_LATEST

registry = CollectorRegistry()

mutations_proposed = Counter(
    "mutations_proposed_total", "Total number of proposed mutations", registry=registry
)
mutations_completed = Counter(
    "mutations_completed_total", "Total number of completed mutations", registry=registry
)
websocket_connections = Gauge(
    "websocket_connections", "Current number of active WebSocket connections", registry=registry
)
pending_approvals = Gauge(
    "pending_approvals", "Current number of pending approval requests", registry=registry
)


def metrics_response():
    return generate_latest(registry), CONTENT_TYPE_LATEST