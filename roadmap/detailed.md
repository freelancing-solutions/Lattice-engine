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

```python
@router.get("/search/specs")
async def search_specs(
    query: str,
    limit: int = 10,
    project_id: Optional[str] = None,
    user: User = Depends(get_current_user),
    search_service: SearchService = Depends()
):
    """Search for specs using semantic search"""
    
    # Verify user has access to project if specified
    if project_id:
        await verify_project_access(user, project_id)
    
    results = await search_service.search(query, limit, project_id)
    
    return {
        "query": query,
        "results": results,
        "count": len(results)
    }

@router.get("/search/mutations")
async def search_mutations(
    query: str,
    limit: int = 10,
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    """Search for mutations with semantic search"""
    
    # Generate query embedding
    embedding_service = EmbeddingService(settings.openai_api_key)
    query_embedding = await embedding_service.generate_embedding(query)
    
    # Search mutations
    async with db.get_session() as session:
        repo = MutationRepository(session)
        mutations = await repo.semantic_search(
            query_embedding,
            limit=limit,
            project_id=project_id,
            status=status
        )
    
    return {
        "query": query,
        "results": mutations,
        "count": len(mutations)
    }

@router.post("/search/reindex")
async def reindex_specs(
    project_id: Optional[str] = None,
    user: User = Depends(PermissionChecker(Permission.PROJECT_UPDATE)),
    search_service: SearchService = Depends()
):
    """Reindex specs for search (admin operation)"""
    
    async with db.get_session() as session:
        repo = SpecRepository(session)
        
        if project_id:
            specs = await repo.get_by_project(project_id)
        else:
            specs = await repo.get_all()
        
        indexed_count = 0
        for spec in specs:
            try:
                await search_service.index_spec(spec)
                indexed_count += 1
            except Exception as e:
                logger.error(f"Failed to index spec {spec.id}: {e}")
    
    return {
        "message": f"Reindexed {indexed_count} specs",
        "count": indexed_count
    }

@router.get("/search/similar/{spec_id}")
async def find_similar_specs(
    spec_id: str,
    limit: int = 5,
    user: User = Depends(get_current_user),
    search_service: SearchService = Depends()
):
    """Find specs similar to a given spec"""
    
    # Get the spec
    async with db.get_session() as session:
        repo = SpecRepository(session)
        spec = await repo.get_by_id(spec_id)
        
        if not spec:
            raise HTTPException(404, "Spec not found")
        
        # Verify access
        await verify_project_access(user, spec.project_id)
    
    # Use spec content as query
    spec_text = f"{spec.name}\n{spec.description}\n{spec.content}"
    results = await search_service.search(spec_text, limit)
    
    # Filter out the original spec
    results = [r for r in results if r["spec_id"] != spec_id]
    
    return {
        "spec_id": spec_id,
        "similar_specs": results,
        "count": len(results)
    }

# Task 6.7: Search Tests
# Location: /tests/test_search.py

@pytest.mark.asyncio
async def test_qdrant_indexing():
    """Test indexing spec in Qdrant"""
    qdrant = QdrantService(url="http://localhost:6333")
    spec = create_test_spec()
    embedding = [0.1] * 1536  # Mock embedding
    
    await qdrant.index_spec(spec, embedding)
    
    # Verify indexed
    results = await qdrant.search_similar_specs(embedding, limit=1)
    assert len(results) == 1
    assert results[0]["spec_id"] == spec.id

@pytest.mark.asyncio
async def test_semantic_search():
    """Test semantic search functionality"""
    search_service = create_test_search_service()
    
    # Index test specs
    spec1 = Spec(id="1", name="User Authentication", content="Login and signup")
    spec2 = Spec(id="2", name="Payment Processing", content="Stripe integration")
    
    await search_service.index_spec(spec1)
    await search_service.index_spec(spec2)
    
    # Search for authentication
    results = await search_service.search("user login system")
    
    assert len(results) > 0
    assert results[0]["spec_id"] == "1"  # Should match auth spec

@pytest.mark.asyncio
async def test_pgvector_similarity():
    """Test pgvector similarity search"""
    pgvector = PgVectorService(db_service)
    
    query_embedding = [0.2] * 1536
    results = await pgvector.search_similar(query_embedding, limit=5)
    
    assert isinstance(results, list)
    for result in results:
        assert "spec_id" in result
        assert "score" in result
        assert 0 <= result["score"] <= 1
```

---

### **Sprint 4: Mutation Application & Conflict Resolution (Weeks 7-8)**

#### Week 7: Mutation Application Logic

**Day 1-2: Mutation Executor**
```python
# Task 7.1: Mutation Executor Service
# Location: /lattice_mutation_engine/execution/mutation_executor.py

from typing import List, Dict, Any
from enum import Enum

class ExecutionStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"

class ExecutionResult(BaseModel):
    mutation_id: str
    status: ExecutionStatus
    executed_changes: List[str] = []
    failed_changes: List[str] = []
    errors: List[Dict[str, Any]] = []
    rollback_available: bool = True
    execution_time: float = 0.0

class MutationExecutor:
    """Execute mutations and apply changes"""
    
    def __init__(
        self,
        spec_storage: "SpecStorage",
        neo4j_service: "Neo4jService"
    ):
        self.spec_storage = spec_storage
        self.neo4j = neo4j_service
        self.change_handlers = self._register_handlers()
    
    def _register_handlers(self) -> Dict[str, "ChangeHandler"]:
        """Register handlers for different change types"""
        return {
            "create": CreateChangeHandler(),
            "modify": ModifyChangeHandler(),
            "delete": DeleteChangeHandler(),
            "rename": RenameChangeHandler()
        }
    
    async def execute_mutation(
        self,
        mutation: Mutation,
        dry_run: bool = False
    ) -> ExecutionResult:
        """Execute mutation changes"""
        
        result = ExecutionResult(
            mutation_id=mutation.id,
            status=ExecutionStatus.IN_PROGRESS
        )
        
        start_time = time.time()
        
        try:
            # Create execution snapshot for rollback
            snapshot = await self._create_snapshot(mutation)
            
            # Execute each change
            for change in mutation.changes:
                try:
                    handler = self.change_handlers.get(change.operation_type)
                    if not handler:
                        raise ValueError(f"Unknown operation: {change.operation_type}")
                    
                    if not dry_run:
                        await handler.execute(change, self.spec_storage)
                        result.executed_changes.append(change.id)
                    else:
                        # Validate change without applying
                        await handler.validate(change, self.spec_storage)
                
                except Exception as e:
                    logger.error(f"Failed to execute change {change.id}: {e}")
                    result.failed_changes.append(change.id)
                    result.errors.append({
                        "change_id": change.id,
                        "error": str(e),
                        "traceback": traceback.format_exc()
                    })
                    
                    # Stop execution on first failure
                    break
            
            # Update mutation status
            if result.failed_changes:
                result.status = ExecutionStatus.FAILED
                
                # Rollback if not dry run
                if not dry_run:
                    await self._rollback(mutation, snapshot, result)
            else:
                result.status = ExecutionStatus.COMPLETED
                
                # Update graph
                if not dry_run:
                    await self._update_graph(mutation)
            
            result.execution_time = time.time() - start_time
            
            return result
        
        except Exception as e:
            logger.error(f"Mutation execution failed: {e}")
            result.status = ExecutionStatus.FAILED
            result.errors.append({
                "error": str(e),
                "traceback": traceback.format_exc()
            })
            return result
    
    async def _create_snapshot(self, mutation: Mutation) -> Dict[str, Any]:
        """Create snapshot of current state for rollback"""
        snapshot = {
            "mutation_id": mutation.id,
            "timestamp": datetime.utcnow().isoformat(),
            "specs": {},
            "graph_state": {}
        }
        
        # Snapshot affected specs
        for change in mutation.changes:
            spec_id = change.metadata.get("spec_id")
            if spec_id and spec_id not in snapshot["specs"]:
                spec = await self.spec_storage.get_spec(spec_id)
                snapshot["specs"][spec_id] = spec.dict()
        
        # Snapshot graph state
        snapshot["graph_state"] = await self.neo4j.export_subgraph(
            mutation.project_id
        )
        
        # Store snapshot
        await self._store_snapshot(snapshot)
        
        return snapshot
    
    async def _rollback(
        self,
        mutation: Mutation,
        snapshot: Dict[str, Any],
        result: ExecutionResult
    ):
        """Rollback mutation changes"""
        logger.info(f"Rolling back mutation {mutation.id}")
        
        try:
            # Restore specs from snapshot
            for spec_id, spec_data in snapshot["specs"].items():
                await self.spec_storage.restore_spec(spec_id, spec_data)
            
            # Restore graph state
            await self.neo4j.restore_subgraph(snapshot["graph_state"])
            
            result.status = ExecutionStatus.ROLLED_BACK
            result.rollback_available = False
        
        except Exception as e:
            logger.error(f"Rollback failed: {e}")
            result.errors.append({
                "error": "Rollback failed",
                "details": str(e)
            })
    
    async def _update_graph(self, mutation: Mutation):
        """Update Neo4j graph with mutation changes"""
        for change in mutation.changes:
            if change.operation_type == "create":
                await self.neo4j.create_node(change)
            elif change.operation_type == "modify":
                await self.neo4j.update_node(change)
            elif change.operation_type == "delete":
                await self.neo4j.delete_node(change)

# Task 7.2: Change Handlers
# Location: /lattice_mutation_engine/execution/change_handlers.py

class ChangeHandler(ABC):
    """Base class for change handlers"""
    
    @abstractmethod
    async def execute(self, change: FileChange, storage: "SpecStorage"):
        """Execute the change"""
        pass
    
    @abstractmethod
    async def validate(self, change: FileChange, storage: "SpecStorage"):
        """Validate change can be executed"""
        pass

class CreateChangeHandler(ChangeHandler):
    """Handle create operations"""
    
    async def execute(self, change: FileChange, storage: "SpecStorage"):
        """Create new spec or file"""
        
        # Check if already exists
        exists = await storage.exists(change.file_path)
        if exists:
            raise ValueError(f"File already exists: {change.file_path}")
        
        # Create the file
        await storage.create_file(
            path=change.file_path,
            content=change.content,
            metadata=change.metadata
        )
    
    async def validate(self, change: FileChange, storage: "SpecStorage"):
        """Validate create operation"""
        exists = await storage.exists(change.file_path)
        if exists:
            raise ValueError(f"Cannot create, file exists: {change.file_path}")

class ModifyChangeHandler(ChangeHandler):
    """Handle modify operations"""
    
    async def execute(self, change: FileChange, storage: "SpecStorage"):
        """Modify existing spec or file"""
        
        # Check if exists
        exists = await storage.exists(change.file_path)
        if not exists:
            raise ValueError(f"File does not exist: {change.file_path}")
        
        # Get current content
        current = await storage.read_file(change.file_path)
        
        # Apply diff if provided
        if change.diff:
            new_content = self._apply_diff(current, change.diff)
        else:
            new_content = change.content
        
        # Update the file
        await storage.update_file(
            path=change.file_path,
            content=new_content,
            metadata=change.metadata
        )
    
    async def validate(self, change: FileChange, storage: "SpecStorage"):
        """Validate modify operation"""
        exists = await storage.exists(change.file_path)
        if not exists:
            raise ValueError(f"Cannot modify, file not found: {change.file_path}")
    
    def _apply_diff(self, current: str, diff: str) -> str:
        """Apply unified diff to current content"""
        import difflib
        # Parse and apply diff
        lines = current.splitlines(keepends=True)
        diff_lines = diff.splitlines(keepends=True)
        
        # Apply patch
        patched = difflib.unified_diff([], lines, fromfile='', tofile='')
        return ''.join(patched)

class DeleteChangeHandler(ChangeHandler):
    """Handle delete operations"""
    
    async def execute(self, change: FileChange, storage: "SpecStorage"):
        """Delete spec or file"""
        
        exists = await storage.exists(change.file_path)
        if not exists:
            logger.warning(f"File already deleted: {change.file_path}")
            return
        
        await storage.delete_file(change.file_path)
    
    async def validate(self, change: FileChange, storage: "SpecStorage"):
        """Validate delete operation"""
        exists = await storage.exists(change.file_path)
        if not exists:
            raise ValueError(f"Cannot delete, file not found: {change.file_path}")

class RenameChangeHandler(ChangeHandler):
    """Handle rename/move operations"""
    
    async def execute(self, change: FileChange, storage: "SpecStorage"):
        """Rename or move file"""
        
        old_path = change.file_path
        new_path = change.metadata.get("new_path")
        
        if not new_path:
            raise ValueError("Rename operation requires 'new_path' in metadata")
        
        # Check source exists
        exists = await storage.exists(old_path)
        if not exists:
            raise ValueError(f"Source file not found: {old_path}")
        
        # Check destination doesn't exist
        dest_exists = await storage.exists(new_path)
        if dest_exists:
            raise ValueError(f"Destination already exists: {new_path}")
        
        await storage.move_file(old_path, new_path)
    
    async def validate(self, change: FileChange, storage: "SpecStorage"):
        """Validate rename operation"""
        old_path = change.file_path
        new_path = change.metadata.get("new_path")
        
        if not new_path:
            raise ValueError("Rename requires 'new_path' in metadata")
        
        exists = await storage.exists(old_path)
        if not exists:
            raise ValueError(f"Source not found: {old_path}")
        
        dest_exists = await storage.exists(new_path)
        if dest_exists:
            raise ValueError(f"Destination exists: {new_path}")
```

**Day 3-4: Conflict Detection & Resolution**
```python
# Task 7.3: Conflict Detection
# Location: /lattice_mutation_engine/execution/conflict_detector.py

class ConflictType(str, Enum):
    CONCURRENT_MODIFICATION = "concurrent_modification"
    DEPENDENCY_VIOLATION = "dependency_violation"
    SCHEMA_INCOMPATIBILITY = "schema_incompatibility"
    FILE_COLLISION = "file_collision"

class Conflict(BaseModel):
    type: ConflictType
    severity: str  # "error", "warning"
    description: str
    affected_files: List[str] = []
    conflicting_mutations: List[str] = []
    resolution_suggestions: List[str] = []

class ConflictDetector:
    """Detect conflicts between mutations"""
    
    async def detect_conflicts(
        self,
        mutation: Mutation,
        context: Dict[str, Any]
    ) -> List[Conflict]:
        """Detect all conflicts for a mutation"""
        
        conflicts = []
        
        # Check concurrent modifications
        concurrent_conflicts = await self._check_concurrent_modifications(mutation)
        conflicts.extend(concurrent_conflicts)
        
        # Check dependency violations
        dependency_conflicts = await self._check_dependencies(mutation)
        conflicts.extend(dependency_conflicts)
        
        # Check schema compatibility
        schema_conflicts = await self._check_schema_compatibility(mutation)
        conflicts.extend(schema_conflicts)
        
        # Check file collisions
        file_conflicts = await self._check_file_collisions(mutation)
        conflicts.extend(file_conflicts)
        
        return conflicts
    
    async def _check_concurrent_modifications(
        self,
        mutation: Mutation
    ) -> List[Conflict]:
        """Check for concurrent modifications to same files"""
        
        conflicts = []
        
        # Get pending mutations for same project
        async with db.get_session() as session:
            repo = MutationRepository(session)
            pending_mutations = await repo.get_pending(mutation.project_id)
        
        # Check for overlapping file changes
        mutation_files = set(c.file_path for c in mutation.changes)
        
        for pending in pending_mutations:
            if pending.id == mutation.id:
                continue
            
            pending_files = set(c.file_path for c in pending.changes)
            overlapping = mutation_files & pending_files
            
            if overlapping:
                conflicts.append(Conflict(
                    type=ConflictType.CONCURRENT_MODIFICATION,
                    severity="error",
                    description=f"Concurrent modification detected with mutation {pending.id}",
                    affected_files=list(overlapping),
                    conflicting_mutations=[pending.id],
                    resolution_suggestions=[
                        "Merge changes manually",
                        "Wait for other mutation to complete",
                        "Rebase your changes"
                    ]
                ))
        
        return conflicts
    
    async def _check_dependencies(
        self,
        mutation: Mutation
    ) -> List[Conflict]:
        """Check for dependency violations"""
        
        conflicts = []
        
        # Query Neo4j for dependencies
        dependencies = await self.neo4j.get_dependencies(mutation.project_id)
        
        # Check if mutation breaks any dependencies
        for change in mutation.changes:
            if change.operation_type == "delete":
                # Check if other specs depend on this
                dependents = [
                    d for d in dependencies 
                    if d["source"] == change.file_path
                ]
                
                if dependents:
                    conflicts.append(Conflict(
                        type=ConflictType.DEPENDENCY_VIOLATION,
                        severity="error",
                        description=f"Cannot delete {change.file_path}, other specs depend on it",
                        affected_files=[change.file_path],
                        resolution_suggestions=[
                            "Remove dependencies first",
                            "Update dependent specs",
                            "Change operation to modify instead of delete"
                        ]
                    ))
        
        return conflicts
    
    async def _check_schema_compatibility(
        self,
        mutation: Mutation
    ) -> List[Conflict]:
        """Check schema compatibility"""
        
        conflicts = []
        
        # Get project schema
        spec = await self.spec_storage.get_spec(mutation.spec_id)
        if not spec or not spec.schema_definition:
            return conflicts
        
        schema = json.loads(spec.schema_definition)
        
        # Validate each change against schema
        for change in mutation.changes:
            try:
                self._validate_against_schema(change, schema)
            except ValidationError as e:
                conflicts.append(Conflict(
                    type=ConflictType.SCHEMA_INCOMPATIBILITY,
                    severity="error",
                    description=f"Schema validation failed: {e}",
                    affected_files=[change.file_path],
                    resolution_suggestions=[
                        "Update schema definition",
                        "Modify change to match schema",
                        "Create schema migration"
                    ]
                ))
        
        return conflicts

# Task 7.4: Conflict Resolution Strategies
# Location: /lattice_mutation_engine/execution/conflict_resolver.py

class ResolutionStrategy(str, Enum):
    MANUAL = "manual"
    AUTO_MERGE = "auto_merge"
    REBASE = "rebase"
    ACCEPT_THEIRS = "accept_theirs"
    ACCEPT_OURS = "accept_ours"

class ConflictResolver:
    """Resolve conflicts between mutations"""
    
    async def resolve(
        self,
        mutation: Mutation,
        conflicts: List[Conflict],
        strategy: ResolutionStrategy
    ) -> Mutation:
        """Resolve conflicts and return updated mutation"""
        
        if strategy == ResolutionStrategy.MANUAL:
            # Mark for manual resolution
            mutation.status = "needs_manual_resolution"
            mutation.metadata["conflicts"] = [c.dict() for c in conflicts]
            return mutation
        
        elif strategy == ResolutionStrategy.AUTO_MERGE:
            return await self._auto_merge(mutation, conflicts)
        
        elif strategy == ResolutionStrategy.REBASE:
            return await self._rebase_mutation(mutation, conflicts)
        
        elif strategy == ResolutionStrategy.ACCEPT_THEIRS:
            return await self._accept_conflicting_changes(mutation, conflicts)
        
        elif strategy == ResolutionStrategy.ACCEPT_OURS:
            # Keep our changes, ignore conflicts
            return mutation
    
    async def _auto_merge(
        self,
        mutation: Mutation,
        conflicts: List[Conflict]
    ) -> Mutation:
        """Automatically merge non-conflicting changes"""
        
        # Get conflicting mutations
        conflicting_mutation_ids = set()
        for conflict in conflicts:
            conflicting_mutation_ids.update(conflict.conflicting_mutations)
        
        # Load conflicting mutations
        async with db.get_session() as session:
            repo = MutationRepository(session)
            conflicting_mutations = [
                await repo.get_by_id(mid)
                for mid in conflicting_mutation_ids
            ]
        
        # Perform three-way merge
        merged_changes = []
        for change in mutation.changes:
            # Find corresponding changes in conflicting mutations
            conflict_changes = []
            for conf_mut in conflicting_mutations:
                for conf_change in conf_mut.changes:
                    if conf_change.file_path == change.file_path:
                        conflict_changes.append(conf_change)
            
            if not conflict_changes:
                # No conflict, keep our change
                merged_changes.append(change)
            else:
                # Attempt automatic merge
                merged = await self._merge_changes(change, conflict_changes)
                merged_changes.append(merged)
        
        mutation.changes = merged_changes
        return mutation
    
    async def _merge_changes(
        self,
        our_change: FileChange,
        their_changes: List[FileChange]
    ) -> FileChange:
        """Merge multiple changes to same file"""
        
        # Use diff3 algorithm for three-way merge
        # This is simplified - real implementation would use proper merge tools
        
        base_content = await self.spec_storage.read_file(our_change.file_path)
        our_content = our_change.content
        
        for their_change in their_changes:
            their_content = their_change.content
            
            # Perform three-way merge
            merged_content = self._three_way_merge(
                base_content,
                our_content,
                their_content
            )
            
            # Update for next iteration
            our_content = merged_content
        
        # Create merged change
        merged_change = our_change.copy()
        merged_change.content = merged_content
        merged_change.metadata["merged"] = True
        merged_change.metadata["merged_from"] = [c.id for c in their_changes]
        
        return merged_change
    
    def _three_way_merge(
        self,
        base: str,
        ours: str,
        theirs: str
    ) -> str:
        """Three-way merge algorithm"""
        
        import difflib
        
        # Split into lines
        base_lines = base.splitlines(keepends=True)
        our_lines = ours.splitlines(keepends=True)
        their_lines = theirs.splitlines(keepends=True)
        
        # Create diffs
        our_diff = list(difflib.unified_diff(base_lines, our_lines))
        their_diff = list(difflib.unified_diff(base_lines, their_lines))
        
        # Merge diffs (simplified)
        merged_lines = base_lines.copy()
        
        # Apply non-overlapping changes
        # Real implementation would handle conflicts properly
        
        return ''.join(merged_lines)
```

**Day 5: Execution API & Testing**
```python
# Task 7.5: Execution API Endpoints
# Location: /lattice_mutation_engine/api/endpoints/execution.py

@router.post("/mutations/{mutation_id}/execute")
async def execute_mutation(
    mutation_id: str,
    dry_run: bool = False,
    user: User = Depends(PermissionChecker(Permission.MUTATION_DEPLOY)),
    executor: MutationExecutor = Depends()
):
    """Execute a mutation"""
    
    # Get mutation
    async with db.get_session() as session:
        repo = MutationRepository(session)
        mutation = await repo.get_by_id(mutation_id)
        
        if not mutation:
            raise HTTPException(404, "Mutation not found")
        
        if mutation.status != "approved":
            raise HTTPException(400, "Mutation must be approved before execution")
    
    # Execute mutation
    result = await executor.execute_mutation(mutation, dry_run=dry_run)
    
    # Update mutation status
    if not dry_run:
        mutation.status = result.status
        mutation.metadata["execution_result"] = result.dict()
        await repo.update(mutation)
    
    return result

@router.post("/mutations/{mutation_id}/detect-conflicts")
async def detect_conflicts(
    mutation_id: str,
    user: User = Depends(get_current_user),
    detector: ConflictDetector = Depends()
):
    """Detect conflicts for a mutation"""
    
    async with db.get_session() as session:
        repo = MutationRepository(session)
        mutation = await repo.get_by_id(mutation_id)
        
        if not mutation:
            raise HTTPException(404, "Mutation not found")
    
    conflicts = await detector.detect_conflicts(mutation, {})
    
    return {
        "mutation_id": mutation_id,
        "conflicts": conflicts,
        "has_conflicts": len(conflicts) > 0,
        "conflict_count": len(conflicts)
    }

@router.post("/mutations/{mutation_id}/resolve-conflicts")
async def resolve_conflicts(
    mutation_id: str,
    strategy: ResolutionStrategy,
    user: User = Depends(PermissionChecker(Permission.MUTATION_APPROVE)),
    resolver: ConflictResolver = Depends()
):
    """Resolve conflicts for a mutation"""
    
    async with db.get_session() as session:
        repo = MutationRepository(session)
        mutation = await repo.get_by_id(mutation_id)
        
        if not mutation:
            raise HTTPException(404, "Mutation not found")
        
        # Detect conflicts
        detector = ConflictDetector()
        conflicts = await detector.detect_conflicts(mutation, {})
        
        if not conflicts:
            return {"message": "No conflicts to resolve"}
        
        # Resolve conflicts
        resolved_mutation = await resolver.resolve(mutation, conflicts, strategy)
        
        # Update mutation
        await repo.update(resolved_mutation)
    
    return {
        "mutation_id": mutation_id,
        "strategy": strategy,
        "resolved": True
    }

@router.post("/mutations/{mutation_id}/rollback")
async def rollback_mutation(
    mutation_id: str,
    user: User = Depends(PermissionChecker(Permission.MUTATION_DEPLOY)),
    executor: MutationExecutor = Depends()
):
    """Rollback a mutation"""
    
    async with db.get_session() as session:
        repo = MutationRepository(session)
        mutation = await repo.get_by_id(mutation_id)
        
        if not mutation:
            raise HTTPException(404, "Mutation not found")
        
        if mutation.status != "completed":
            raise HTTPException(400, "Can only rollback completed mutations")
        
        # Load snapshot
        snapshot = await load_snapshot(mutation_id)
        if not snapshot:
            raise HTTPException(404, "Snapshot not found for rollback")
        
        # Perform rollback
        result = ExecutionResult(mutation_id=mutation_id, status=ExecutionStatus.IN_PROGRESS)
        await executor._rollback(mutation, snapshot, result)
        
        # Update mutation
        mutation.status = "rolled_back"
        await repo.update(mutation)
    
    return {
        "mutation_id": mutation_id,
        "rolled_back": True,
        "status": "rolled_back"
    }

# Task 7.6: Execution Tests
# Location: /tests/test_execution.py

@pytest.mark.asyncio
async def test_execute_mutation_success():
    """Test successful mutation execution"""
    executor = create_test_executor()
    mutation = create_test_mutation()
    
    result = await executor.execute_mutation(mutation)
    
    assert result.status == ExecutionStatus.COMPLETED
    assert len(result.executed_changes) == len(mutation.changes)
    assert len(result.failed_changes) == 0

@pytest.mark.asyncio
async def test_conflict_detection():
    """Test conflict detection"""
    detector = ConflictDetector()
    mutation1 = create_test_mutation(file_path="api/users.py")
    mutation2 = create_test_mutation(file_path="api/users.py")
    
    # Store first mutation as pending
    await store_pending_mutation(mutation1)
    
    # Detect conflicts for
