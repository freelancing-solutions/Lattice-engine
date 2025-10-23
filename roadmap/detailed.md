# Lattice Engine Ecosystem - Detailed Implementation Roadmap to Completion

## 🎯 Executive Summary

This roadmap outlines a **16-week implementation plan** divided into 4 major phases, with each phase containing specific sprints (2-week iterations). The plan prioritizes core stability, developer experience, ecosystem integration, and enterprise readiness.

---

## 📋 Prerequisites & Setup (Week 0)

### Environment Preparation
- [ ] Set up development environments for all team members
- [ ] Configure local PostgreSQL + pgvector extension
- [ ] Set up Neo4j instance (local or cloud)
- [ ] Configure Redis for Celery and Pub/Sub
- [ ] Create development Paddle account and sandbox
- [ ] Set up CI/CD pipelines (GitHub Actions)
- [ ] Establish code review process and guidelines

### Documentation Baseline
- [ ] Audit current documentation completeness
- [ ] Create architecture diagrams for ecosystem
- [ ] Document API contracts between components
- [ ] Set up documentation site structure

---

## 🚀 Phase 1: Core Stability & Foundation (Weeks 1-4)

### **Sprint 1: Database & Authentication (Weeks 1-2)**

#### Week 1: Database Migration
**Lattice Mutation Engine (`/lattice_mutation_engine`)**

**Day 1-2: PostgreSQL Setup**
```python
# Task 1.1: Create Pydantic ORM models
# Location: /lattice_mutation_engine/models/

# models/base.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class TimestampMixin:
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    def update_timestamp(self):
        self.updated_at = datetime.utcnow()

# models/user.py
from sqlalchemy import Boolean, String, Enum
from sqlalchemy.orm import relationship
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    DEVELOPER = "developer"
    REVIEWER = "reviewer"
    VIEWER = "viewer"

class User(Base, TimestampMixin):
    __tablename__ = "users"
    
    id: str = Column(String, primary_key=True)
    email: str = Column(String, unique=True, index=True)
    hashed_password: Optional[str] = Column(String)
    full_name: str = Column(String)
    role: UserRole = Column(Enum(UserRole))
    is_active: bool = Column(Boolean, default=True)
    organization_id: Optional[str] = Column(String, index=True)
    
    # Relationships
    projects = relationship("Project", back_populates="owner")
    mutations = relationship("Mutation", back_populates="initiator")
    
    # Business logic at model level
    def is_subscription_active(self) -> bool:
        """Check if user's subscription is active"""
        if not self.subscription:
            return False
        return self.subscription.status == "active" and \
               self.subscription.expires_at > datetime.utcnow()
    
    def can_propose_mutation(self, project_id: str) -> bool:
        """Check if user can propose mutations for project"""
        if self.role == UserRole.ADMIN:
            return True
        if self.role in [UserRole.DEVELOPER, UserRole.REVIEWER]:
            # Check project membership
            return any(p.id == project_id for p in self.projects)
        return False

# models/subscription.py
class SubscriptionTier(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    TEAM = "team"
    ENTERPRISE = "enterprise"

class Subscription(Base, TimestampMixin):
    __tablename__ = "subscriptions"
    
    id: str = Column(String, primary_key=True)
    user_id: str = Column(String, ForeignKey("users.id"))
    tier: SubscriptionTier = Column(Enum(SubscriptionTier))
    status: str = Column(String)  # active, cancelled, expired
    paddle_subscription_id: Optional[str] = Column(String)
    expires_at: datetime = Column(DateTime)
    
    # Quota tracking
    mutations_used: int = Column(Integer, default=0)
    mutations_limit: int = Column(Integer)
    
    def has_quota(self) -> bool:
        """Check if subscription has remaining quota"""
        return self.mutations_used < self.mutations_limit
    
    def increment_usage(self, amount: int = 1):
        """Increment usage counter"""
        self.mutations_used += amount
        self.update_timestamp()
```

**Day 3-4: Database Service Layer**
```python
# Task 1.2: Create database service
# Location: /lattice_mutation_engine/services/database.py

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager

class DatabaseService:
    def __init__(self, database_url: str):
        self.engine = create_async_engine(database_url, echo=True)
        self.async_session = sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )
    
    @asynccontextmanager
    async def get_session(self):
        async with self.async_session() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    
    async def init_db(self):
        """Initialize database schema"""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

# Task 1.3: Create repository pattern
# Location: /lattice_mutation_engine/repositories/

class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(
            select(User).filter(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def create(self, user_data: dict) -> User:
        user = User(**user_data)
        self.session.add(user)
        await self.session.flush()
        return user
    
    async def update_subscription_status(self, user_id: str, status: str):
        user = await self.get_by_id(user_id)
        if user and user.subscription:
            user.subscription.status = status
            await self.session.flush()
```

**Day 5: Migration Scripts**
```bash
# Task 1.4: Create Alembic migrations
# Location: /lattice_mutation_engine/alembic/versions/

# Generate initial migration
alembic revision --autogenerate -m "Initial schema with users, subscriptions, projects"

# Create data migration for existing records
alembic revision -m "Migrate existing in-memory data to PostgreSQL"
```

#### Week 2: Enterprise SSO

**Day 1-2: OAuth2 Provider Setup**
```python
# Task 2.1: SSO Configuration
# Location: /lattice_mutation_engine/auth/sso.py

from authlib.integrations.starlette_client import OAuth
from fastapi import Depends

class SSOConfig(BaseModel):
    providers: dict[str, dict] = {
        "google": {
            "client_id": "",
            "client_secret": "",
            "server_metadata_url": "https://accounts.google.com/.well-known/openid-configuration",
        },
        "github": {
            "client_id": "",
            "client_secret": "",
            "authorize_url": "https://github.com/login/oauth/authorize",
            "access_token_url": "https://github.com/login/oauth/access_token",
        },
        "microsoft": {
            "client_id": "",
            "client_secret": "",
            "server_metadata_url": "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
        }
    }

class SSOManager:
    def __init__(self, config: SSOConfig):
        self.oauth = OAuth()
        self._register_providers(config)
    
    def _register_providers(self, config: SSOConfig):
        for provider, settings in config.providers.items():
            self.oauth.register(name=provider, **settings)
    
    async def authenticate(self, provider: str, code: str) -> dict:
        """Exchange authorization code for user info"""
        token = await self.oauth.create_client(provider).authorize_access_token(code)
        user_info = await self.oauth.create_client(provider).userinfo(token=token)
        return user_info

# Task 2.2: SSO Endpoints
# Location: /lattice_mutation_engine/api/endpoints/auth.py

@router.get("/auth/{provider}/login")
async def sso_login(provider: str, sso: SSOManager = Depends()):
    """Redirect to SSO provider"""
    redirect_uri = f"{settings.base_url}/auth/{provider}/callback"
    return await sso.oauth.create_client(provider).authorize_redirect(redirect_uri)

@router.get("/auth/{provider}/callback")
async def sso_callback(
    provider: str,
    code: str,
    sso: SSOManager = Depends(),
    db: DatabaseService = Depends()
):
    """Handle SSO callback and create/update user"""
    user_info = await sso.authenticate(provider, code)
    
    async with db.get_session() as session:
        repo = UserRepository(session)
        user = await repo.get_by_email(user_info["email"])
        
        if not user:
            # Create new user from SSO info
            user = await repo.create({
                "email": user_info["email"],
                "full_name": user_info.get("name", ""),
                "role": UserRole.DEVELOPER,
                "sso_provider": provider,
                "sso_id": user_info["sub"]
            })
        
        # Generate JWT token
        token = create_access_token({"sub": user.id})
        return {"access_token": token, "token_type": "bearer"}
```

**Day 3-4: RBAC Implementation**
```python
# Task 2.3: Permission System
# Location: /lattice_mutation_engine/auth/permissions.py

from enum import Enum
from typing import Callable
from fastapi import HTTPException, status

class Permission(str, Enum):
    # Project permissions
    PROJECT_CREATE = "project:create"
    PROJECT_READ = "project:read"
    PROJECT_UPDATE = "project:update"
    PROJECT_DELETE = "project:delete"
    
    # Mutation permissions
    MUTATION_PROPOSE = "mutation:propose"
    MUTATION_APPROVE = "mutation:approve"
    MUTATION_REJECT = "mutation:reject"
    MUTATION_DEPLOY = "mutation:deploy"
    
    # Admin permissions
    USER_MANAGE = "user:manage"
    ORG_MANAGE = "org:manage"

ROLE_PERMISSIONS = {
    UserRole.VIEWER: [
        Permission.PROJECT_READ,
    ],
    UserRole.DEVELOPER: [
        Permission.PROJECT_READ,
        Permission.PROJECT_CREATE,
        Permission.MUTATION_PROPOSE,
    ],
    UserRole.REVIEWER: [
        Permission.PROJECT_READ,
        Permission.PROJECT_UPDATE,
        Permission.MUTATION_PROPOSE,
        Permission.MUTATION_APPROVE,
        Permission.MUTATION_REJECT,
    ],
    UserRole.ADMIN: [perm for perm in Permission],  # All permissions
}

class PermissionChecker:
    def __init__(self, required_permission: Permission):
        self.required_permission = required_permission
    
    async def __call__(self, current_user: User = Depends(get_current_user)):
        user_permissions = ROLE_PERMISSIONS.get(current_user.role, [])
        if self.required_permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {self.required_permission}"
            )
        return current_user

# Usage in endpoints
@router.post("/mutations/propose")
async def propose_mutation(
    mutation: MutationCreate,
    user: User = Depends(PermissionChecker(Permission.MUTATION_PROPOSE))
):
    # User is authorized
    pass
```

**Day 5: Organization Management**
```python
# Task 2.4: Organization Models
# Location: /lattice_mutation_engine/models/organization.py

class Organization(Base, TimestampMixin):
    __tablename__ = "organizations"
    
    id: str = Column(String, primary_key=True)
    name: str = Column(String)
    slug: str = Column(String, unique=True, index=True)
    subscription_tier: SubscriptionTier = Column(Enum(SubscriptionTier))
    
    # Relationships
    users = relationship("User", back_populates="organization")
    projects = relationship("Project", back_populates="organization")
    
    def add_member(self, user: User, role: UserRole):
        """Add user to organization"""
        user.organization_id = self.id
        user.role = role
    
    def get_active_members(self) -> list[User]:
        """Get all active organization members"""
        return [u for u in self.users if u.is_active]

# Task 2.5: Team Management Endpoints
# Location: /lattice_mutation_engine/api/endpoints/organizations.py

@router.post("/organizations")
async def create_organization(
    org: OrganizationCreate,
    user: User = Depends(PermissionChecker(Permission.ORG_MANAGE))
):
    """Create new organization"""
    async with db.get_session() as session:
        repo = OrganizationRepository(session)
        organization = await repo.create({
            "name": org.name,
            "slug": org.slug,
            "subscription_tier": org.tier,
        })
        
        # Add creator as admin
        organization.add_member(user, UserRole.ADMIN)
        return organization

@router.post("/organizations/{org_id}/members")
async def add_member(
    org_id: str,
    member: MemberInvite,
    user: User = Depends(PermissionChecker(Permission.ORG_MANAGE))
):
    """Invite member to organization"""
    # Send invitation email
    # Create pending invitation record
    pass
```

---

### **Sprint 2: Subscription & Billing (Weeks 3-4)**

#### Week 3: Paddle Integration

**Day 1-2: Paddle SDK Setup**
```python
# Task 3.1: Paddle Configuration
# Location: /lattice_mutation_engine/billing/paddle.py

from paddle_billing import Client, Environment
from paddle_billing.Resources.Subscriptions import Subscription as PaddleSubscription

class PaddleService:
    def __init__(self, api_key: str, environment: str = "sandbox"):
        self.client = Client(
            api_key=api_key,
            environment=Environment.SANDBOX if environment == "sandbox" else Environment.PRODUCTION
        )
    
    async def create_subscription(
        self,
        customer_id: str,
        price_id: str,
        user_email: str
    ) -> dict:
        """Create a new subscription in Paddle"""
        try:
            subscription = self.client.subscriptions.create(
                customer_id=customer_id,
                items=[{"price_id": price_id, "quantity": 1}],
                customer_email=user_email,
                collection_mode="automatic",
            )
            return {
                "id": subscription.id,
                "status": subscription.status,
                "next_billed_at": subscription.next_billed_at,
            }
        except Exception as e:
            raise BillingError(f"Failed to create subscription: {e}")
    
    async def cancel_subscription(self, subscription_id: str):
        """Cancel subscription"""
        return self.client.subscriptions.cancel(
            subscription_id=subscription_id,
            effective_from="next_billing_period"
        )
    
    async def update_subscription(
        self,
        subscription_id: str,
        new_price_id: str
    ):
        """Upgrade/downgrade subscription"""
        return self.client.subscriptions.update(
            subscription_id=subscription_id,
            items=[{"price_id": new_price_id, "quantity": 1}],
            proration_billing_mode="prorated_immediately"
        )

# Task 3.2: Subscription Tiers Configuration
# Location: /lattice_mutation_engine/billing/tiers.py

SUBSCRIPTION_TIERS = {
    SubscriptionTier.FREE: {
        "price_id": None,
        "mutations_limit": 10,
        "projects_limit": 1,
        "team_members": 1,
        "features": ["basic_mutations", "local_specs"],
    },
    SubscriptionTier.PRO: {
        "price_id": "pri_pro_monthly",
        "mutations_limit": 100,
        "projects_limit": 5,
        "team_members": 1,
        "features": ["advanced_mutations", "ai_suggestions", "cloud_specs"],
        "price_monthly": 29,
    },
    SubscriptionTier.TEAM: {
        "price_id": "pri_team_monthly",
        "mutations_limit": 500,
        "projects_limit": 20,
        "team_members": 10,
        "features": ["all_pro_features", "team_collaboration", "priority_support"],
        "price_monthly": 99,
    },
    SubscriptionTier.ENTERPRISE: {
        "price_id": "pri_enterprise_monthly",
        "mutations_limit": -1,  # unlimited
        "projects_limit": -1,
        "team_members": -1,
        "features": ["all_features", "sso", "dedicated_support", "sla"],
        "price_monthly": None,  # custom pricing
    },
}

class SubscriptionManager:
    def __init__(self, paddle: PaddleService, db: DatabaseService):
        self.paddle = paddle
        self.db = db
    
    async def subscribe_user(
        self,
        user_id: str,
        tier: SubscriptionTier,
        payment_method_id: str
    ):
        """Subscribe user to a tier"""
        tier_config = SUBSCRIPTION_TIERS[tier]
        
        async with self.db.get_session() as session:
            repo = UserRepository(session)
            user = await repo.get_by_id(user_id)
            
            if tier == SubscriptionTier.FREE:
                # Free tier, no Paddle interaction
                subscription = await self._create_local_subscription(user, tier)
            else:
                # Create Paddle subscription
                paddle_sub = await self.paddle.create_subscription(
                    customer_id=user.paddle_customer_id,
                    price_id=tier_config["price_id"],
                    user_email=user.email
                )
                
                subscription = await self._create_local_subscription(
                    user, tier, paddle_sub["id"]
                )
            
            return subscription
    
    async def check_quota(self, user_id: str) -> bool:
        """Check if user has quota for mutation"""
        async with self.db.get_session() as session:
            repo = UserRepository(session)
            user = await repo.get_by_id(user_id)
            
            if not user.subscription:
                return False
            
            return user.subscription.has_quota()
```

**Day 3-4: Webhook Handling**
```python
# Task 3.3: Paddle Webhook Handler
# Location: /lattice_mutation_engine/api/endpoints/webhooks.py

from paddle_billing.Notifications import Notification

@router.post("/webhooks/paddle")
async def paddle_webhook(
    request: Request,
    paddle: PaddleService = Depends(),
    db: DatabaseService = Depends()
):
    """Handle Paddle webhook events"""
    body = await request.body()
    signature = request.headers.get("Paddle-Signature")
    
    # Verify webhook signature
    try:
        notification = Notification.from_json(body.decode())
        
        event_type = notification.event_type
        data = notification.data
        
        if event_type == "subscription.created":
            await handle_subscription_created(data, db)
        elif event_type == "subscription.updated":
            await handle_subscription_updated(data, db)
        elif event_type == "subscription.canceled":
            await handle_subscription_canceled(data, db)
        elif event_type == "transaction.completed":
            await handle_payment_completed(data, db)
        elif event_type == "transaction.failed":
            await handle_payment_failed(data, db)
        
        return {"status": "success"}
    
    except Exception as e:
        logger.error(f"Webhook processing failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid webhook")

async def handle_subscription_created(data: dict, db: DatabaseService):
    """Handle new subscription creation"""
    paddle_sub_id = data["id"]
    customer_id = data["customer_id"]
    
    async with db.get_session() as session:
        repo = UserRepository(session)
        user = await repo.get_by_paddle_customer(customer_id)
        
        if user and user.subscription:
            user.subscription.paddle_subscription_id = paddle_sub_id
            user.subscription.status = "active"
            user.subscription.expires_at = datetime.fromisoformat(
                data["next_billed_at"]
            )

async def handle_payment_failed(data: dict, db: DatabaseService):
    """Handle failed payment"""
    # Send notification to user
    # Update subscription status
    # Grace period logic
    pass
```

**Day 5: Usage Tracking**
```python
# Task 3.4: Usage Tracking Middleware
# Location: /lattice_mutation_engine/middleware/usage_tracking.py

class UsageTrackingMiddleware:
    async def __call__(self, request: Request, call_next):
        # Track API calls per user
        user = request.state.user if hasattr(request.state, "user") else None
        
        if user and request.url.path.startswith("/api/"):
            await self._track_usage(user.id, request.method, request.url.path)
        
        response = await call_next(request)
        return response
    
    async def _track_usage(self, user_id: str, method: str, path: str):
        """Track API usage"""
        # Increment counters in Redis for rate limiting
        # Log to database for billing
        pass

# Task 3.5: Quota Enforcement Decorator
def require_quota(resource_type: str):
    """Decorator to enforce quota limits"""
    async def decorator(func):
        async def wrapper(*args, user: User = None, **kwargs):
            if not user:
                raise HTTPException(401, "Authentication required")
            
            if not user.subscription or not user.subscription.is_subscription_active():
                raise HTTPException(402, "Active subscription required")
            
            if not user.subscription.has_quota():
                raise HTTPException(
                    429,
                    f"Quota exceeded for {resource_type}. Please upgrade your plan."
                )
            
            result = await func(*args, user=user, **kwargs)
            
            # Increment usage after successful operation
            user.subscription.increment_usage()
            
            return result
        return wrapper
    return decorator

# Usage
@router.post("/mutations/propose")
@require_quota("mutations")
async def propose_mutation(
    mutation: MutationCreate,
    user: User = Depends(get_current_user)
):
    pass
```

#### Week 4: Billing Dashboard & Invoice Management

**Day 1-2: Billing API Endpoints**
```python
# Task 4.1: Billing Endpoints
# Location: /lattice_mutation_engine/api/endpoints/billing.py

@router.get("/billing/subscription")
async def get_subscription(user: User = Depends(get_current_user)):
    """Get current user subscription details"""
    if not user.subscription:
        return {
            "tier": "free",
            "status": "active",
            "limits": SUBSCRIPTION_TIERS[SubscriptionTier.FREE]
        }
    
    return {
        "tier": user.subscription.tier,
        "status": user.subscription.status,
        "expires_at": user.subscription.expires_at,
        "usage": {
            "mutations_used": user.subscription.mutations_used,
            "mutations_limit": user.subscription.mutations_limit,
            "percentage": (user.subscription.mutations_used / user.subscription.mutations_limit) * 100
        },
        "limits": SUBSCRIPTION_TIERS[user.subscription.tier]
    }

@router.post("/billing/subscription/upgrade")
async def upgrade_subscription(
    upgrade: SubscriptionUpgrade,
    user: User = Depends(get_current_user),
    paddle: PaddleService = Depends()
):
    """Upgrade/downgrade subscription"""
    new_tier = upgrade.tier
    current_tier = user.subscription.tier if user.subscription else SubscriptionTier.FREE
    
    if new_tier == current_tier:
        raise HTTPException(400, "Already on this tier")
    
    tier_config = SUBSCRIPTION_TIERS[new_tier]
    
    if user.subscription and user.subscription.paddle_subscription_id:
        # Update existing Paddle subscription
        await paddle.update_subscription(
            user.subscription.paddle_subscription_id,
            tier_config["price_id"]
        )
    else:
        # Create new subscription
        paddle_sub = await paddle.create_subscription(
            customer_id=user.paddle_customer_id,
            price_id=tier_config["price_id"],
            user_email=user.email
        )
        
        # Update local subscription
        async with db.get_session() as session:
            repo = SubscriptionRepository(session)
            await repo.update_or_create(
                user_id=user.id,
                tier=new_tier,
                paddle_subscription_id=paddle_sub["id"]
            )
    
    return {"message": "Subscription updated successfully"}

@router.post("/billing/subscription/cancel")
async def cancel_subscription(
    user: User = Depends(get_current_user),
    paddle: PaddleService = Depends()
):
    """Cancel subscription"""
    if not user.subscription or not user.subscription.paddle_subscription_id:
        raise HTTPException(400, "No active subscription to cancel")
    
    await paddle.cancel_subscription(user.subscription.paddle_subscription_id)
    
    return {"message": "Subscription will be canceled at end of billing period"}

@router.get("/billing/invoices")
async def list_invoices(
    user: User = Depends(get_current_user),
    paddle: PaddleService = Depends()
):
    """List user invoices"""
    invoices = await paddle.list_transactions(user.paddle_customer_id)
    return invoices

@router.get("/billing/usage")
async def get_usage_history(
    user: User = Depends(get_current_user),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """Get detailed usage history"""
    # Query usage logs from database
    async with db.get_session() as session:
        repo = UsageRepository(session)
        usage = await repo.get_user_usage(
            user.id,
            start_date or date.today() - timedelta(days=30),
            end_date or date.today()
        )
    
    return {
        "mutations": usage.mutations_count,
        "api_calls": usage.api_calls_count,
        "storage_used": usage.storage_bytes,
        "period": {"start": start_date, "end": end_date}
    }
```

**Day 3-4: Invoice Generation**
```python
# Task 4.2: Invoice Service
# Location: /lattice_mutation_engine/billing/invoices.py

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO

class InvoiceGenerator:
    def __init__(self, organization_info: dict):
        self.org_info = organization_info
    
    def generate_invoice_pdf(
        self,
        user: User,
        subscription: Subscription,
        transaction: dict
    ) -> BytesIO:
        """Generate PDF invoice"""
        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=letter)
        
        # Header
        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(50, 750, "INVOICE")
        
        # Organization info
        pdf.setFont("Helvetica", 10)
        y = 720
        for line in self._format_org_info():
            pdf.drawString(50, y, line)
            y -= 15
        
        # Customer info
        y = 650
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y, "Bill To:")
        pdf.setFont("Helvetica", 10)
        y -= 20
        pdf.drawString(50, y, user.full_name)
        y -= 15
        pdf.drawString(50, y, user.email)
        
        # Invoice details
        y = 580
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y, "Invoice Details")
        y -= 20
        pdf.setFont("Helvetica", 10)
        pdf.drawString(50, y, f"Invoice Number: {transaction['id']}")
        y -= 15
        pdf.drawString(50, y, f"Date: {transaction['created_at']}")
        y -= 15
        pdf.drawString(50, y, f"Amount: ${transaction['amount']}")
        
        # Line items table
        y -= 40
        self._draw_line_items(pdf, subscription, y)
        
        pdf.save()
        buffer.seek(0)
        return buffer
    
    async def send_invoice_email(self, user: User, invoice_pdf: BytesIO):
        """Send invoice via email"""
        # Email service integration
        pass

# Task 4.3: Scheduled Invoice Generation
# Location: /lattice_mutation_engine/tasks/billing.py

from celery import shared_task

@shared_task
def generate_monthly_invoices():
    """Generate invoices for all subscriptions (monthly cron)"""
    # Query all active subscriptions
    # Generate invoices
    # Send emails
    pass

@shared_task
def check_subscription_renewals():
    """Check and process subscription renewals"""
    # Find subscriptions expiring in 3 days
    # Send renewal reminders
    pass

@shared_task
def handle_failed_payments():
    """Handle subscriptions with failed payments"""
    # Send payment retry notifications
    # Apply grace period
    # Downgrade to free tier after grace period
    pass
```

**Day 5: Testing & Documentation**
```python
# Task 4.4: Billing Tests
# Location: /tests/test_billing.py

import pytest
from unittest.mock import Mock, AsyncMock

@pytest.mark.asyncio
async def test_subscribe_to_pro_tier():
    """Test subscribing user to Pro tier"""
    paddle_mock = Mock(spec=PaddleService)
    paddle_mock.create_subscription = AsyncMock(return_value={
        "id": "sub_123",
        "status": "active",
        "next_billed_at": "2025-11-23T00:00:00Z"
    })
    
    manager =
