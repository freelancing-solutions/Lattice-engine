"""
Lattice Engine MCP Client

Main client for interacting with the Lattice Engine API.
Handles authentication, project management, and mutation operations.
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Union
from urllib.parse import urljoin
import aiohttp
from datetime import datetime, timedelta

from .auth import AuthManager
from .models import (
    Project, Mutation, MutationRequest, MutationResponse,
    User, Organization
)
from .exceptions import (
    LatticeError, AuthenticationError, AuthorizationError,
    ProjectNotFoundError, MutationError
)

logger = logging.getLogger(__name__)


class LatticeClient:
    """
    Main client for interacting with the Lattice Engine API
    
    Provides methods for:
    - Authentication and session management
    - Project operations (create, list, update)
    - Mutation operations (propose, execute, monitor)
    - Organization and user management
    """
    
    def __init__(
        self,
        base_url: str = "http://localhost:8000",
        api_key: Optional[str] = None,
        timeout: int = 30,
        max_retries: int = 3
    ):
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.max_retries = max_retries
        self.session: Optional[aiohttp.ClientSession] = None
        
        # Initialize auth manager
        self.auth = AuthManager(api_key=api_key)
        
        # Current context
        self._current_user: Optional[User] = None
        self._current_organization: Optional[Organization] = None
        self._current_project: Optional[Project] = None
    
    async def __aenter__(self):
        """Async context manager entry"""
        await self.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.disconnect()
    
    async def connect(self):
        """Initialize the HTTP session"""
        if self.session is None:
            connector = aiohttp.TCPConnector(limit=100, limit_per_host=30)
            timeout = aiohttp.ClientTimeout(total=self.timeout)
            self.session = aiohttp.ClientSession(
                connector=connector,
                timeout=timeout,
                headers={"User-Agent": "Lattice-MCP-SDK/1.0.0"}
            )
    
    async def disconnect(self):
        """Close the HTTP session"""
        if self.session:
            await self.session.close()
            self.session = None
    
    async def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
        headers: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make an authenticated HTTP request"""
        if not self.session:
            await self.connect()
        
        url = urljoin(self.base_url, endpoint.lstrip('/'))
        request_headers = {}
        
        # Add authentication headers
        auth_headers = await self.auth.get_headers()
        request_headers.update(auth_headers)
        
        if headers:
            request_headers.update(headers)
        
        # Add content type for POST/PUT requests
        if method.upper() in ['POST', 'PUT', 'PATCH'] and data:
            request_headers['Content-Type'] = 'application/json'
        
        for attempt in range(self.max_retries + 1):
            try:
                async with self.session.request(
                    method,
                    url,
                    json=data,
                    params=params,
                    headers=request_headers
                ) as response:
                    
                    # Handle authentication errors
                    if response.status == 401:
                        raise AuthenticationError("Authentication failed")
                    elif response.status == 403:
                        raise AuthorizationError("Insufficient permissions")
                    
                    # Parse response
                    try:
                        response_data = await response.json()
                    except json.JSONDecodeError:
                        response_data = {"message": await response.text()}
                    
                    if response.status >= 400:
                        error_msg = response_data.get('detail', f'HTTP {response.status}')
                        if response.status == 404:
                            raise ProjectNotFoundError(error_msg)
                        else:
                            raise LatticeError(error_msg)
                    
                    return response_data
                    
            except aiohttp.ClientError as e:
                if attempt == self.max_retries:
                    raise LatticeError(f"Request failed after {self.max_retries} retries: {str(e)}")
                
                # Exponential backoff
                await asyncio.sleep(2 ** attempt)
    
    # Authentication Methods
    async def authenticate(self, api_key: Optional[str] = None) -> User:
        """Authenticate with the Lattice Engine"""
        if api_key:
            self.auth.set_api_key(api_key)
        
        response = await self._request('GET', '/auth/me')
        self._current_user = User(**response['user'])
        
        if response.get('organization'):
            self._current_organization = Organization(**response['organization'])
        
        return self._current_user
    
    async def get_current_user(self) -> Optional[User]:
        """Get the current authenticated user"""
        return self._current_user
    
    async def get_current_organization(self) -> Optional[Organization]:
        """Get the current user's organization"""
        return self._current_organization
    
    # Project Methods
    async def list_projects(self) -> List[Project]:
        """List all projects accessible to the current user"""
        response = await self._request('GET', '/projects')
        return [Project(**project) for project in response['projects']]
    
    async def get_project(self, project_id: str) -> Project:
        """Get a specific project by ID"""
        response = await self._request('GET', f'/projects/{project_id}')
        project = Project(**response['project'])
        self._current_project = project
        return project
    
    async def create_project(
        self,
        name: str,
        description: Optional[str] = None,
        spec_content: Optional[str] = None
    ) -> Project:
        """Create a new project"""
        data = {
            "name": name,
            "description": description,
            "spec_content": spec_content
        }
        response = await self._request('POST', '/projects', data=data)
        return Project(**response['project'])
    
    async def update_project(
        self,
        project_id: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
        spec_content: Optional[str] = None
    ) -> Project:
        """Update an existing project"""
        data = {}
        if name is not None:
            data['name'] = name
        if description is not None:
            data['description'] = description
        if spec_content is not None:
            data['spec_content'] = spec_content
        
        response = await self._request('PUT', f'/projects/{project_id}', data=data)
        return Project(**response['project'])
    
    # Mutation Methods
    async def propose_mutation(
        self,
        project_id: str,
        operation_type: str,
        changes: Dict[str, Any],
        description: Optional[str] = None
    ) -> MutationResponse:
        """Propose a mutation for a project"""
        request = MutationRequest(
            project_id=project_id,
            operation_type=operation_type,
            changes=changes,
            description=description
        )
        
        response = await self._request('POST', '/mutations/propose', data=request.dict())
        return MutationResponse(**response)
    
    async def get_mutation(self, mutation_id: str) -> Mutation:
        """Get a specific mutation by ID"""
        response = await self._request('GET', f'/mutations/{mutation_id}')
        return Mutation(**response['mutation'])
    
    async def list_mutations(
        self,
        project_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50
    ) -> List[Mutation]:
        """List mutations with optional filtering"""
        params = {"limit": limit}
        if project_id:
            params['project_id'] = project_id
        if status:
            params['status'] = status
        
        response = await self._request('GET', '/mutations', params=params)
        return [Mutation(**mutation) for mutation in response['mutations']]
    
    async def approve_mutation(self, mutation_id: str) -> Mutation:
        """Approve a pending mutation"""
        response = await self._request('POST', f'/mutations/{mutation_id}/approve')
        return Mutation(**response['mutation'])
    
    async def reject_mutation(self, mutation_id: str, reason: Optional[str] = None) -> Mutation:
        """Reject a pending mutation"""
        data = {"reason": reason} if reason else {}
        response = await self._request('POST', f'/mutations/{mutation_id}/reject', data=data)
        return Mutation(**response['mutation'])
    
    # Utility Methods
    async def health_check(self) -> Dict[str, Any]:
        """Check the health of the Lattice Engine"""
        return await self._request('GET', '/health')
    
    async def get_metrics(self) -> Dict[str, Any]:
        """Get system metrics"""
        return await self._request('GET', '/metrics')
    
    def set_current_project(self, project: Project):
        """Set the current project context"""
        self._current_project = project
    
    def get_current_project(self) -> Optional[Project]:
        """Get the current project context"""
        return self._current_project