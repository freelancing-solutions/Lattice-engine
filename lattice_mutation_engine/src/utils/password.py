"""
Password hashing utilities using bcrypt.
"""

from passlib.context import CryptContext

# Create a password context with bcrypt scheme
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: Plain text password to hash

    Returns:
        Hashed password string
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.

    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to verify against

    Returns:
        True if password matches hash, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)