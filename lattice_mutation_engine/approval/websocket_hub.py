import json
import logging
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from safe_imports import safe_import_redis
Redis = safe_import_redis()

# Import models using absolute path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.approval_models import WebSocketConnection


logger = logging.getLogger(__name__)


class WebSocketHub:
    def __init__(self, redis_url: Optional[str] = None):
        self.connections: Dict[str, List[WebSocketConnection]] = {}
        self.connection_sockets: Dict[str, Any] = {}
        self.redis: Optional[Redis] = None
        self._subscriptions: Dict[str, asyncio.Task] = {}
        if redis_url:
            try:
                self.redis = Redis.from_url(redis_url, decode_responses=True)
                logger.info(f"WebSocketHub using Redis Pub/Sub at {redis_url}")
            except Exception as e:
                logger.error(f"Failed to connect to Redis: {e}")
                self.redis = None

    async def register_client(
        self,
        user_id: str,
        client_type: str,
        websocket_id: str,
        metadata: Dict[str, Any],
        socket: Optional[Any] = None,
    ):
        connection = WebSocketConnection(
            user_id=user_id,
            client_type=client_type,
            websocket_id=websocket_id,
            metadata=metadata,
            connected_at=datetime.now(),
        )

        self.connections.setdefault(user_id, []).append(connection)
        if socket is not None:
            self.connection_sockets[websocket_id] = socket

        logger.info(
            "client_registered", user_id=user_id, client_type=client_type, websocket_id=websocket_id
        )

        # Start subscription for this user if Redis is enabled and not already subscribed
        if self.redis and user_id not in self._subscriptions:
            self._subscriptions[user_id] = asyncio.create_task(self._subscribe_user(user_id))

    async def unregister_client(self, user_id: str, websocket_id: str):
        if user_id in self.connections:
            self.connections[user_id] = [
                c for c in self.connections[user_id] if c.websocket_id != websocket_id
            ]
            if not self.connections[user_id]:
                del self.connections[user_id]

        if websocket_id in self.connection_sockets:
            del self.connection_sockets[websocket_id]

        logger.info("client_unregistered", user_id=user_id, websocket_id=websocket_id)

        # If no more local connections for this user, cancel subscription
        if self.redis and user_id not in self.connections and user_id in self._subscriptions:
            self._subscriptions[user_id].cancel()
            del self._subscriptions[user_id]

    async def send_to_user(
        self,
        user_id: str,
        event: str,
        data: Dict[str, Any],
        client_type: Optional[str] = None,
    ):
        if user_id not in self.connections and not self.redis:
            logger.warning(f"User {user_id} not connected")
            return

        connections = self.connections.get(user_id, [])
        if client_type:
            connections = [c for c in connections if c.client_type == client_type]

        message = {"event": event, "data": data, "timestamp": datetime.now().isoformat()}

        logger.info("websocket_message", user_id=user_id, event=event, message=message)

        # Local send
        for conn in connections:
            try:
                sock = self.connection_sockets.get(conn.websocket_id)
                if sock:
                    await sock.send_text(json.dumps(message))
                else:
                    logger.debug(f"No socket bound for {conn.websocket_id}")
            except Exception as e:
                logger.error(
                    "websocket_send_failed",
                    user_id=user_id,
                    websocket_id=conn.websocket_id,
                    error=str(e),
                )

        # Publish to Redis for cross-node delivery
        if self.redis:
            try:
                await self.redis.publish(self._channel(user_id), json.dumps(message))
            except Exception as e:
                logger.error(f"Redis publish failed for {user_id}: {e}")

    async def is_connected(self, user_id: str, client_type: Optional[str] = None) -> bool:
        if user_id not in self.connections:
            return False
        connections = self.connections[user_id]
        if client_type:
            connections = [c for c in connections if c.client_type == client_type]
        return len(connections) > 0

    def _channel(self, user_id: str) -> str:
        return f"user:{user_id}"

    async def _subscribe_user(self, user_id: str):
        if not self.redis:
            return
        try:
            pubsub = self.redis.pubsub()
            await pubsub.subscribe(self._channel(user_id))
            logger.info(f"Subscribed to Redis channel for user {user_id}")
            while True:
                try:
                    message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                    if message and message.get("type") == "message":
                        data = message.get("data")
                        if isinstance(data, str):
                            payload = json.loads(data)
                            # Forward to local connections
                            for conn in self.connections.get(user_id, []):
                                sock = self.connection_sockets.get(conn.websocket_id)
                                if sock:
                                    await sock.send_text(json.dumps(payload))
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    logger.error(f"Redis subscription error for {user_id}: {e}")
                    await asyncio.sleep(1)
        finally:
            try:
                await pubsub.unsubscribe(self._channel(user_id))
                await pubsub.close()
            except Exception:
                pass
            logger.info(f"Unsubscribed Redis channel for user {user_id}")