"""
Lattice Engine MCP SDK

Model Context Protocol SDK for integrating with the Lattice Engine.
Provides authentication, project management, and mutation capabilities.
"""

from .client import LatticeClient
from .auth import AuthManager
from .models import (
    Project,
    Mutation,
    MutationRequest,
    MutationResponse,
    User,
    Organization
)
from .exceptions import (
    LatticeError,
    AuthenticationError,
    AuthorizationError,
    ProjectNotFoundError,
    MutationError
)

__version__ = "1.0.0"
__all__ = [
    "LatticeClient",
    "AuthManager", 
    "Project",
    "Mutation",
    "MutationRequest",
    "MutationResponse",
    "User",
    "Organization",
    "LatticeError",
    "AuthenticationError",
    "AuthorizationError",
    "ProjectNotFoundError",
    "MutationError"
]