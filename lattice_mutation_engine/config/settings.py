from pydantic import BaseModel, Field
from typing import List, Optional


class EngineConfig(BaseModel):
    # LLM Configuration
    primary_model: str = Field(default="claude-sonnet-4-5")
    fallback_model: str = Field(default="gpt-4o")
    temperature: float = Field(default=0.7)
    max_tokens: int = Field(default=4000)

    # Agent Configuration
    max_concurrent_agents: int = Field(default=10)
    agent_timeout_seconds: int = Field(default=300)
    retry_attempts: int = Field(default=3)

    # Validation Thresholds
    auto_approve_threshold: float = Field(default=0.85)
    semantic_similarity_threshold: float = Field(default=0.75)

    # Queue Configuration
    celery_broker: str = Field(default="redis://localhost:6379/0")
    celery_backend: str = Field(default="redis://localhost:6379/1")
    celery_enabled: bool = Field(default=False)

    # Persistence Backends
    graph_backend: str = Field(default="memory", description="memory | neo4j")
    graph_db_url: str = Field(default="neo4j://localhost:7687")
    graph_db_user: Optional[str] = Field(default="neo4j")
    graph_db_password: Optional[str] = Field(default="password")
    embeddings_backend: str = Field(default="none", description="none | qdrant | pgvector")
    vector_db_url: str = Field(default="qdrant://localhost:6333")
    pg_dsn: Optional[str] = Field(default=None, description="Postgres DSN when using pgvector")

    # Performance
    embedding_cache_ttl: int = Field(default=3600)
    max_graph_traversal_depth: int = Field(default=10)

    # WebSocket
    websocket_host: str = Field(default="localhost")
    websocket_port: int = Field(default=8765)
    redis_url: str = Field(default="redis://localhost:6379/0")

    # API Auth
    api_keys: List[str] = Field(default_factory=list)
    
    # LLM API Keys
    anthropic_api_key: Optional[str] = Field(default=None)
    openai_api_key: Optional[str] = Field(default=None)

    # Spec Sync
    spec_sync_enabled: bool = Field(default=False)
    spec_sync_dir: str = Field(default="specs")
    
    # Mutation settings
    max_mutations_per_batch: int = 10
    mutation_timeout_seconds: int = 300
    enable_rollback: bool = True
    
    # Semantic search settings
    embeddings_backend: str = "tfidf"  # Options: "tfidf", "qdrant", "pgvector"
    qdrant_url: str = "http://localhost:6333"
    qdrant_collection_name: str = "lattice_specs"
    embedding_model: str = "all-MiniLM-L6-v2"  # SentenceTransformer model
    embedding_dimension: int = 384  # Dimension for all-MiniLM-L6-v2


config = EngineConfig()