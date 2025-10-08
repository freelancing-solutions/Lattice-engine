"""
Authentication Manager for Lattice MCP SDK

Handles API key authentication and token management.
"""

import os
import json
import logging
from typing import Dict, Optional, Any
from datetime import datetime, timedelta
from pathlib import Path

from .exceptions import AuthenticationError

logger = logging.getLogger(__name__)


class AuthManager:
    """
    Manages authentication for the Lattice MCP SDK
    
    Supports:
    - API key authentication
    - Token caching and refresh
    - Credential storage
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('LATTICE_API_KEY')
        self.token: Optional[str] = None
        self.token_expires_at: Optional[datetime] = None
        
        # Credential storage path
        self.credentials_path = Path.home() / '.lattice' / 'credentials.json'
        self.credentials_path.parent.mkdir(exist_ok=True)
        
        # Load stored credentials
        self._load_credentials()
    
    def set_api_key(self, api_key: str):
        """Set the API key for authentication"""
        self.api_key = api_key
        self._save_credentials()
    
    def get_api_key(self) -> Optional[str]:
        """Get the current API key"""
        return self.api_key
    
    async def get_headers(self) -> Dict[str, str]:
        """Get authentication headers for API requests"""
        headers = {}
        
        if self.api_key:
            headers['X-API-Key'] = self.api_key
        elif self.token and not self._is_token_expired():
            headers['Authorization'] = f'Bearer {self.token}'
        else:
            raise AuthenticationError("No valid authentication credentials available")
        
        return headers
    
    def set_token(self, token: str, expires_in: Optional[int] = None):
        """Set JWT token with optional expiration"""
        self.token = token
        
        if expires_in:
            self.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        else:
            # Default to 1 hour if no expiration provided
            self.token_expires_at = datetime.utcnow() + timedelta(hours=1)
        
        self._save_credentials()
    
    def clear_token(self):
        """Clear the current token"""
        self.token = None
        self.token_expires_at = None
        self._save_credentials()
    
    def _is_token_expired(self) -> bool:
        """Check if the current token is expired"""
        if not self.token_expires_at:
            return True
        
        # Add 5 minute buffer for token refresh
        return datetime.utcnow() >= (self.token_expires_at - timedelta(minutes=5))
    
    def _load_credentials(self):
        """Load credentials from storage"""
        try:
            if self.credentials_path.exists():
                with open(self.credentials_path, 'r') as f:
                    data = json.load(f)
                
                self.api_key = self.api_key or data.get('api_key')
                self.token = data.get('token')
                
                if data.get('token_expires_at'):
                    self.token_expires_at = datetime.fromisoformat(
                        data['token_expires_at']
                    )
        except Exception as e:
            logger.warning(f"Failed to load credentials: {e}")
    
    def _save_credentials(self):
        """Save credentials to storage"""
        try:
            data = {
                'api_key': self.api_key,
                'token': self.token,
                'token_expires_at': (
                    self.token_expires_at.isoformat() 
                    if self.token_expires_at else None
                )
            }
            
            with open(self.credentials_path, 'w') as f:
                json.dump(data, f, indent=2)
            
            # Set secure permissions (readable only by owner)
            os.chmod(self.credentials_path, 0o600)
            
        except Exception as e:
            logger.warning(f"Failed to save credentials: {e}")
    
    def is_authenticated(self) -> bool:
        """Check if we have valid authentication credentials"""
        return bool(
            self.api_key or 
            (self.token and not self._is_token_expired())
        )
    
    def get_auth_info(self) -> Dict[str, Any]:
        """Get information about current authentication state"""
        return {
            'has_api_key': bool(self.api_key),
            'has_token': bool(self.token),
            'token_expired': self._is_token_expired() if self.token else None,
            'token_expires_at': (
                self.token_expires_at.isoformat() 
                if self.token_expires_at else None
            ),
            'is_authenticated': self.is_authenticated()
        }