"""
Deployment Models for Lattice Mutation Engine

This module defines models for managing deployments of mutations,
including deployment strategies, environments, and status tracking.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any, List
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, validator


class DeploymentStrategy(str, Enum):
    """Deployment strategy types"""
    BLUE_GREEN = "blue_green"
    ROLLING = "rolling"
    CANARY = "canary"
    RECREATE = "recreate"


class DeploymentEnvironment(str, Enum):
    """Deployment environment types"""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    TESTING = "testing"


class DeploymentStatus(str, Enum):
    """Deployment status states"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUCCESS = "success"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"
    CANCELLED = "cancelled"


class DeploymentRequest(BaseModel):
    """Request model for triggering a deployment"""
    mutation_id: str = Field(..., description="ID of the mutation to deploy")
    environment: DeploymentEnvironment = Field(..., description="Target deployment environment")
    strategy: DeploymentStrategy = Field(default=DeploymentStrategy.ROLLING, description="Deployment strategy")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional deployment metadata")
    
    class Config:
        use_enum_values = True


class DeploymentConfig(BaseModel):
    """Configuration for a deployment"""
    timeout_minutes: int = Field(default=30, description="Deployment timeout in minutes")
    rollback_on_failure: bool = Field(default=True, description="Automatically rollback on failure")
    health_check_enabled: bool = Field(default=True, description="Enable health checks during deployment")
    health_check_interval_seconds: int = Field(default=30, description="Health check interval in seconds")
    max_concurrent_pods: Optional[int] = Field(default=None, description="Maximum concurrent pods for rolling deployment")
    canary_percentage: Optional[int] = Field(default=None, description="Percentage of traffic for canary deployment (1-100)")
    
    @validator('canary_percentage')
    def validate_canary_percentage(cls, v):
        if v is not None and (v < 1 or v > 100):
            raise ValueError('Canary percentage must be between 1 and 100')
        return v


class DeploymentStep(BaseModel):
    """Individual step in a deployment process"""
    name: str = Field(..., description="Step name")
    status: DeploymentStatus = Field(..., description="Step status")
    started_at: Optional[datetime] = Field(default=None, description="Step start time")
    completed_at: Optional[datetime] = Field(default=None, description="Step completion time")
    error_message: Optional[str] = Field(default=None, description="Error message if step failed")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Step-specific metadata")


class Deployment(BaseModel):
    """Complete deployment model"""
    id: str = Field(default_factory=lambda: str(uuid4()), description="Unique deployment ID")
    mutation_id: str = Field(..., description="ID of the deployed mutation")
    environment: DeploymentEnvironment = Field(..., description="Deployment environment")
    strategy: DeploymentStrategy = Field(..., description="Deployment strategy used")
    status: DeploymentStatus = Field(default=DeploymentStatus.PENDING, description="Current deployment status")
    config: DeploymentConfig = Field(..., description="Deployment configuration")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Deployment creation time")
    started_at: Optional[datetime] = Field(default=None, description="Deployment start time")
    completed_at: Optional[datetime] = Field(default=None, description="Deployment completion time")
    
    # Execution details
    steps: List[DeploymentStep] = Field(default_factory=list, description="Deployment steps")
    current_step: Optional[str] = Field(default=None, description="Currently executing step")
    
    # Results and metadata
    deployed_version: Optional[str] = Field(default=None, description="Deployed version/hash")
    rollback_version: Optional[str] = Field(default=None, description="Version to rollback to")
    error_message: Optional[str] = Field(default=None, description="Error message if deployment failed")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional deployment metadata")
    
    class Config:
        use_enum_values = True


class DeploymentResponse(BaseModel):
    """Response model for deployment operations"""
    deployment: Deployment = Field(..., description="Deployment details")
    message: str = Field(..., description="Response message")
    
    
class DeploymentListResponse(BaseModel):
    """Response model for listing deployments"""
    deployments: List[Deployment] = Field(..., description="List of deployments")
    total: int = Field(..., description="Total number of deployments")
    
    
class DeploymentStatusResponse(BaseModel):
    """Response model for deployment status"""
    deployment_id: str = Field(..., description="Deployment ID")
    status: DeploymentStatus = Field(..., description="Current status")
    current_step: Optional[str] = Field(default=None, description="Current step")
    progress_percentage: int = Field(default=0, description="Deployment progress percentage")
    estimated_remaining_minutes: Optional[int] = Field(default=None, description="Estimated remaining time in minutes")
    
    @validator('progress_percentage')
    def validate_progress_percentage(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Progress percentage must be between 0 and 100')
        return v


class DeploymentRollbackRequest(BaseModel):
    """Request model for deployment rollback"""
    reason: Optional[str] = Field(default=None, description="Reason for rollback")
    target_version: Optional[str] = Field(default=None, description="Target version to rollback to")


class DeploymentLog(BaseModel):
    """Deployment log entry"""
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Log timestamp")
    level: str = Field(..., description="Log level (INFO, WARN, ERROR)")
    message: str = Field(..., description="Log message")
    step_name: Optional[str] = Field(default=None, description="Related deployment step")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional log metadata")