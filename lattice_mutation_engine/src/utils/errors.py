class MutationError(Exception):
    """Base exception for mutation operations"""
    pass


class ValidationError(MutationError):
    """Spec validation failed"""
    pass


class DependencyError(MutationError):
    """Dependency resolution failed"""
    pass


class ConflictError(MutationError):
    """Unresolvable spec conflict"""
    pass


class AgentTimeoutError(MutationError):
    """Agent execution timeout"""
    pass


class ApprovalError(MutationError):
    """Approval process error"""
    pass