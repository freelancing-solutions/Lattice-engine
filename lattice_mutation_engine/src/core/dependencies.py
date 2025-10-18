"""
Dependency Injection Module for Lattice Mutation Engine

This module provides centralized dependency injection and service management
for the Lattice Engine, following FastAPI best practices.
"""

import logging
from typing import Dict, Any, Optional, Type, TypeVar, Generic
from functools import lru_cache
from contextlib import asynccontextmanager

from fastapi import HTTPException, Depends
from pydantic import BaseModel

from src.config.settings import config, EngineConfig

logger = logging.getLogger(__name__)

T = TypeVar('T')

class ServiceContainer:
    """
    Service container for dependency injection.
    Manages service lifecycle and provides singleton access to services.
    """
    
    def __init__(self):
        self._services: Dict[str, Any] = {}
        self._factories: Dict[str, callable] = {}
        self._singletons: Dict[str, Any] = {}
        self._initialized = False
    
    def register_factory(self, name: str, factory: callable) -> None:
        """Register a factory function for a service"""
        self._factories[name] = factory
        logger.debug(f"Registered factory for service: {name}")
    
    def register_singleton(self, name: str, instance: Any) -> None:
        """Register a singleton instance"""
        self._singletons[name] = instance
        logger.debug(f"Registered singleton: {name}")
    
    def get(self, name: str) -> Any:
        """Get a service instance"""
        # Check singletons first
        if name in self._singletons:
            return self._singletons[name]
        
        # Check if we have a factory
        if name in self._factories:
            instance = self._factories[name]()
            # Cache as singleton
            self._singletons[name] = instance
            return instance
        
        # Check direct services
        if name in self._services:
            return self._services[name]
        
        raise ValueError(f"Service '{name}' not found in container")
    
    def set(self, name: str, instance: Any) -> None:
        """Set a service instance directly"""
        self._services[name] = instance
        logger.debug(f"Set service: {name}")
    
    def has(self, name: str) -> bool:
        """Check if a service is available"""
        return (name in self._services or 
                name in self._factories or 
                name in self._singletons)
    
    def clear(self) -> None:
        """Clear all services (useful for testing)"""
        self._services.clear()
        self._factories.clear()
        self._singletons.clear()
        self._initialized = False
        logger.debug("Service container cleared")
    
    async def initialize(self) -> None:
        """Initialize all services"""
        if self._initialized:
            return
        
        logger.info("Initializing service container...")
        
        # Initialize services that need async setup
        for name, factory in self._factories.items():
            if hasattr(factory, '__annotations__') and 'return' in factory.__annotations__:
                # Check if factory is async
                import inspect
                if inspect.iscoroutinefunction(factory):
                    instance = await factory()
                    self._singletons[name] = instance
        
        self._initialized = True
        logger.info("Service container initialized successfully")
    
    async def shutdown(self) -> None:
        """Shutdown all services gracefully"""
        logger.info("Shutting down service container...")
        
        # Call shutdown methods on services that have them
        for name, service in {**self._services, **self._singletons}.items():
            if hasattr(service, 'shutdown'):
                try:
                    if inspect.iscoroutinefunction(service.shutdown):
                        await service.shutdown()
                    else:
                        service.shutdown()
                    logger.debug(f"Shutdown service: {name}")
                except Exception as e:
                    logger.error(f"Error shutting down service {name}: {e}")
        
        self.clear()
        logger.info("Service container shutdown complete")

# Global service container
container = ServiceContainer()

class ServiceDependency(Generic[T]):
    """
    Generic service dependency for FastAPI dependency injection
    """
    
    def __init__(self, service_name: str, service_type: Type[T]):
        self.service_name = service_name
        self.service_type = service_type
    
    def __call__(self) -> T:
        """Get the service instance"""
        if not container.has(self.service_name):
            raise HTTPException(
                status_code=503, 
                detail=f"Service '{self.service_name}' not available"
            )
        
        service = container.get(self.service_name)
        
        # Type checking in development
        if not isinstance(service, self.service_type):
            logger.warning(
                f"Service '{self.service_name}' is not of expected type {self.service_type}"
            )
        
        return service

# Configuration dependency
@lru_cache()
def get_config() -> EngineConfig:
    """Get the engine configuration"""
    return config

# Common service dependencies
def get_orchestrator():
    """Get the agent orchestrator"""
    return ServiceDependency("orchestrator", object)()

def get_websocket_hub():
    """Get the WebSocket hub"""
    return ServiceDependency("websocket_hub", object)()

def get_approval_manager():
    """Get the approval manager"""
    return ServiceDependency("approval_manager", object)()

def get_mutation_store():
    """Get the mutation store"""
    return ServiceDependency("mutation_store", object)()

def get_graph_service():
    """Get the graph service"""
    return ServiceDependency("graph", object)()

def get_semantic_index():
    """Get the semantic index"""
    return ServiceDependency("semantic_index", object)()

def get_spec_sync_daemon():
    """Get the spec sync daemon"""
    return ServiceDependency("spec_sync_daemon", object)()

def get_paddle_service():
    """Get the Paddle service"""
    return ServiceDependency("paddle_service", object)()

def get_usage_tracker():
    """Get the usage tracker service"""
    return ServiceDependency("usage_tracker", object)()

# Health check dependency
class HealthStatus(BaseModel):
    """Health status model"""
    status: str
    services: Dict[str, bool]
    timestamp: str

def get_health_status() -> HealthStatus:
    """Get system health status"""
    from datetime import datetime
    
    services = {}
    required_services = [
        "orchestrator", "websocket_hub", "approval_manager", 
        "mutation_store", "graph", "semantic_index"
    ]
    
    for service_name in required_services:
        services[service_name] = container.has(service_name)
    
    overall_status = "healthy" if all(services.values()) else "degraded"
    
    return HealthStatus(
        status=overall_status,
        services=services,
        timestamp=datetime.utcnow().isoformat()
    )

# Service registration helpers
def register_service_factory(name: str, factory: callable):
    """Register a service factory"""
    container.register_factory(name, factory)

def register_service_singleton(name: str, instance: Any):
    """Register a service singleton"""
    container.register_singleton(name, instance)

# Context manager for service lifecycle
@asynccontextmanager
async def service_lifespan():
    """Context manager for service lifecycle"""
    try:
        await container.initialize()
        yield container
    finally:
        await container.shutdown()

# Utility functions
def inject_dependencies(**dependencies):
    """
    Decorator to inject dependencies into a function
    
    Usage:
    @inject_dependencies(orchestrator="orchestrator", store="mutation_store")
    async def my_function(orchestrator, store):
        # Use injected dependencies
        pass
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Inject dependencies
            for param_name, service_name in dependencies.items():
                if param_name not in kwargs:
                    kwargs[param_name] = container.get(service_name)
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Export commonly used dependencies
__all__ = [
    'ServiceContainer',
    'ServiceDependency', 
    'container',
    'get_config',
    'get_orchestrator',
    'get_websocket_hub',
    'get_approval_manager',
    'get_mutation_store',
    'get_graph_service',
    'get_semantic_index',
    'get_spec_sync_daemon',
    'get_paddle_service',
    'get_usage_tracker',
    'get_health_status',
    'register_service_factory',
    'register_service_singleton',
    'service_lifespan',
    'inject_dependencies',
    'HealthStatus'
]