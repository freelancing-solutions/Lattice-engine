from pydantic import BaseModel
from typing import Literal, List, Dict, Any
from datetime import datetime


class ValidationRule(BaseModel):
    rule_id: str
    rule_type: Literal['schema', 'dependency', 'semantic', 'business']
    severity: Literal['error', 'warning', 'info']
    validator_func: str  # Function name


class ValidationResult(BaseModel):
    spec_id: str
    is_valid: bool
    errors: List[Dict[str, Any]]
    warnings: List[Dict[str, Any]]
    suggestions: List[Dict[str, Any]]
    validation_timestamp: datetime


class DependencyGraph(BaseModel):
    spec_id: str
    direct_dependencies: List[str]
    transitive_dependencies: List[str]
    dependents: List[str]
    depth_level: int
    circular_refs: List[List[str]] = []