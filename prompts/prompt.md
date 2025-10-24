I have created the following plan after thorough exploration and analysis of the codebase. Follow the below plan verbatim. Trust the files and references. Do not re-verify what's written in the plan. Explore only when absolutely necessary. First implement all the proposed file changes and then I'll review all the changes together at the end.

### Observations

## Current State Analysis

**Backend (`lattice_mutation_engine`):**
- Auth middleware exists with JWT token creation/verification in `src/auth/middleware.py`
- `AuthService` class has methods for JWT token creation, verification, and API key authentication
- User models exist with `password_hash` field in `src/models/user_models.py`
- NO authentication endpoints (login, register, logout, refresh, me) are implemented
- `init_auth_service()` is called in startup but requires a `db_session_factory` parameter that's currently not provided
- Requirements include `pyjwt` and `cryptography` but no password hashing library (bcrypt/passlib)

**Frontend (`lattice-portal`):**
- API client calls `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/me` without `/api/v1/` prefix
- No token refresh functionality implemented
- Auth store persists user state but doesn't handle token expiration or refresh
- Axios interceptor redirects to login on 401 but doesn't attempt token refresh

**Documentation (`docs/api-documentation.md`):**
- Specifies `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/logout` endpoints
- Defines JWT token response with `access_token`, `refresh_token`, and `expires_in`
- Shows expected request/response formats

**Key Discrepancies:**
1. Backend missing all auth endpoints
2. Frontend using wrong URL paths (no `/api/v1/` prefix)
3. No refresh token implementation (backend or frontend)
4. No password hashing utility in backend
5. No database session factory setup for auth service
6. Frontend doesn't handle token refresh or expiration proactively

### Approach

Implement a complete authentication system by:
1. Creating auth endpoints router in backend with login, register, logout, refresh, and me endpoints
2. Adding password hashing utility using bcrypt
3. Setting up database session factory and integrating with auth service
4. Creating refresh token model and persistence layer
5. Updating frontend API client to use correct `/api/v1/auth/*` paths
6. Implementing token refresh logic in frontend with automatic retry on 401
7. Updating documentation to match implementation

### Reasoning

Explored the codebase structure by listing directories, reading key files including API client, auth store, backend endpoints, auth middleware, user models, and configuration. Searched for password hashing utilities, database session setup, and existing auth implementations. Reviewed documentation to understand expected API contract. Identified all discrepancies between frontend, backend, and documentation.

## Mermaid Diagram

sequenceDiagram
    participant Client as Frontend (Portal)
    participant API as Auth Endpoints
    participant AuthSvc as Auth Service
    participant DB as Database
    participant Store as Auth Store

    Note over Client,Store: Login Flow
    Client->>API: POST /api/v1/auth/login<br/>{email, password}
    API->>DB: Query user by email
    DB-->>API: User record
    API->>AuthSvc: verify_password(plain, hash)
    AuthSvc-->>API: Valid
    API->>AuthSvc: create_jwt_token(user)
    AuthSvc-->>API: access_token
    API->>AuthSvc: create_refresh_token(user)
    AuthSvc-->>API: refresh_token
    API->>DB: Store refresh_token hash
    API-->>Client: {access_token, refresh_token, expires_in}
    Client->>Store: Update state & localStorage
    Store->>Store: Schedule token refresh

    Note over Client,Store: Token Refresh Flow
    Store->>Client: Token expiring soon
    Client->>API: POST /api/v1/auth/refresh<br/>{refresh_token}
    API->>DB: Verify refresh_token hash
    DB-->>API: Valid & not revoked
    API->>AuthSvc: create_jwt_token(user)
    AuthSvc-->>API: new_access_token
    API->>AuthSvc: create_refresh_token(user)
    AuthSvc-->>API: new_refresh_token
    API->>DB: Update refresh_token
    API-->>Client: {access_token, refresh_token, expires_in}
    Client->>Store: Update tokens & reschedule

    Note over Client,Store: 401 Error Handling
    Client->>API: API request with expired token
    API-->>Client: 401 Unauthorized
    Client->>Client: Intercept 401
    Client->>API: POST /api/v1/auth/refresh
    API-->>Client: New tokens
    Client->>API: Retry original request
    API-->>Client: Success

    Note over Client,Store: Logout Flow
    Client->>API: POST /api/v1/auth/logout<br/>{refresh_token}
    API->>DB: Mark refresh_token as revoked
    API-->>Client: Success
    Client->>Store: Clear state & localStorage

## Proposed File Changes

### lattice_mutation_engine\src\utils\password.py(NEW)

Create a password hashing utility module using bcrypt (via passlib library). Implement `hash_password(password: str) -> str` function to hash passwords with bcrypt using 12 rounds. Implement `verify_password(plain_password: str, hashed_password: str) -> bool` function to verify passwords against their hashes. Use `passlib.context.CryptContext` with bcrypt scheme. This will be used by auth endpoints for user registration and login.

### lattice_mutation_engine\src\models\refresh_token_models.py(NEW)

References: 

- lattice_mutation_engine\src\models\user_models.py
- lattice_mutation_engine\src\models\api_key_models.py

Create refresh token models for database persistence. Define `RefreshTokenTable` SQLAlchemy model with fields: id (UUID), token_hash (SHA-256 hash), user_id (FK to users), organization_id (optional FK), expires_at (DateTime), revoked (Boolean), revoked_at (DateTime), created_at (DateTime), last_used_at (DateTime). Add relationship to UserTable. Define Pydantic models: `RefreshTokenCreate`, `RefreshToken`. Implement utility functions: `generate_refresh_token() -> tuple[str, str]` to generate token and hash, `hash_refresh_token(token: str) -> str` for hashing, `verify_refresh_token(token: str, stored_hash: str) -> bool` for verification. Set token expiration to 30 days by default.

### lattice_mutation_engine\src\core\database.py(NEW)

References: 

- lattice_mutation_engine\src\config\settings.py(MODIFY)
- lattice_mutation_engine\src\models\user_models.py

Create database session management module. Import SQLAlchemy's `create_engine`, `sessionmaker`, and `Session`. Read database URL from `engine_config.database_url` (add to settings if missing, default to sqlite for development). Create engine with connection pooling settings. Create `SessionLocal` sessionmaker factory. Implement `get_db()` generator function that yields database sessions and ensures proper cleanup with try/finally. Implement `init_database()` function to create all tables using `Base.metadata.create_all()`. This will be used by auth service and auth endpoints.

### lattice_mutation_engine\src\config\settings.py(MODIFY)

Add database and JWT configuration fields to `EngineConfig` class. Add `database_url: str` field with default value for SQLite development database. Add `jwt_secret: str` field with default value (should be overridden via environment variable in production). Add `jwt_access_token_expire_minutes: int` field with default 60 (1 hour). Add `jwt_refresh_token_expire_days: int` field with default 30 days. These settings will be used by the auth service and database module.

### lattice_mutation_engine\src\api\auth_endpoints.py(NEW)

References: 

- lattice_mutation_engine\src\auth\middleware.py(MODIFY)
- lattice_mutation_engine\src\models\user_models.py
- lattice_mutation_engine\src\core\database.py(NEW)
- lattice_mutation_engine\src\utils\password.py(NEW)

Create authentication endpoints router. Import FastAPI's APIRouter, HTTPException, Depends, Response. Import auth service, password utility, database session, user models, refresh token models. Create router with prefix `/api/v1/auth` and tag `auth`. 

Implement `POST /login` endpoint: accept LoginRequest (email, password), query user from database, verify password using `verify_password()`, create access and refresh tokens using `AuthService.create_jwt_token()` and refresh token generator, store refresh token in database, return `{ success: true, data: { access_token, refresh_token, expires_in } }` matching frontend expectations.

Implement `POST /register` endpoint: accept RegisterRequest (email, password, name, organization_name), validate email uniqueness, hash password using `hash_password()`, create user and organization records in transaction, create tokens, return same format as login.

Implement `POST /refresh` endpoint: accept refresh token in request body or Authorization header, verify token hash in database, check expiration and revocation status, generate new access and refresh tokens, update refresh token last_used_at, return new token pair.

Implement `POST /logout` endpoint: accept refresh token, mark it as revoked in database, return success response.

Implement `GET /me` endpoint: use `get_current_user` dependency, return current user information from TenantContext.

All responses should use `APIResponse` envelope format matching frontend expectations: `{ success: boolean, data?: T, error?: { code, message } }`.

### lattice_mutation_engine\src\auth\middleware.py(MODIFY)

References: 

- lattice_mutation_engine\src\models\refresh_token_models.py(NEW)
- lattice_mutation_engine\src\config\settings.py(MODIFY)

Update `AuthService` class to support refresh tokens. Add `create_refresh_token(user: UserTable) -> tuple[str, datetime]` method that generates a refresh token with 30-day expiration and returns token and expiration datetime. Update `create_jwt_token()` to use `jwt_access_token_expire_minutes` from config instead of hardcoded 24 hours. Add `verify_refresh_token(token: str, db: Session) -> Optional[UserTable]` method that verifies refresh token hash in database, checks expiration and revocation, and returns user if valid. Update `init_auth_service()` to accept optional db_session_factory parameter with default None for backward compatibility. Update the function signature to handle the case when db_session_factory is not provided initially.

### lattice_mutation_engine\src\api\endpoints.py(MODIFY)

References: 

- lattice_mutation_engine\src\core\database.py(NEW)

Import and register the new auth router. Add `from src.api.auth_endpoints import router as auth_router` at the top with other router imports. Add `app.include_router(auth_router)` after line 112 where other routers are included. Also add `api_router.include_router(auth_router)` after line 119. Update the `startup_event()` function to initialize database and auth service properly: import `init_database` and `get_db` from `src.core.database`, call `init_database()` before initializing auth service, pass `get_db` as the db_session_factory parameter to `init_auth_service(get_db)`. This ensures auth endpoints are available at `/api/v1/auth/*` paths.

### lattice-portal\src\lib\api.ts(MODIFY)

References: 

- lattice-portal\src\types\index.ts

Update authentication endpoint paths to use `/api/v1/auth/*` prefix matching documentation. Change `login()` method to call `/api/v1/auth/login` instead of `/auth/login`. Change `register()` method to call `/api/v1/auth/register` instead of `/auth/register`. Change `logout()` method to call `/api/v1/auth/logout` instead of `/auth/logout`. Change `getCurrentUser()` method to call `/api/v1/auth/me` instead of `/auth/me`. 

Add new `refreshToken()` method that accepts a refresh token, calls `POST /api/v1/auth/refresh` with the token in request body, updates stored tokens on success, and returns the new token pair. 

Update the response interceptor (lines 43-56) to handle 401 errors by attempting token refresh: on 401 error, check if refresh_token exists in localStorage, call `refreshToken()`, if successful retry the original request with new access token, if refresh fails clear tokens and redirect to login. Add a flag to prevent infinite refresh loops. 

Update `logout()` to send refresh_token in request body for server-side revocation.

### lattice-portal\src\stores\auth-store.ts(MODIFY)

References: 

- lattice-portal\src\lib\api.ts(MODIFY)

Add token refresh logic to auth store. Add new state fields: `tokenExpiresAt: number | null` to track access token expiration timestamp, `isRefreshing: boolean` to prevent concurrent refresh attempts. 

Add `refreshToken()` action that calls `apiClient.refreshToken()`, updates tokens and expiration time in state and localStorage, handles errors by logging out user. 

Add `scheduleTokenRefresh()` private method that calculates time until token expiration (using `expires_in` from login/register response), schedules automatic refresh 5 minutes before expiration using setTimeout, stores timeout ID for cleanup. 

Update `login()` and `register()` actions to: extract `expires_in` from response, calculate and store `tokenExpiresAt`, call `scheduleTokenRefresh()` after successful authentication. 

Update `logout()` action to: clear the scheduled refresh timeout, clear `tokenExpiresAt` and `isRefreshing` state. 

Add `checkTokenExpiration()` method that can be called on app initialization to check if stored token is expired and trigger refresh if needed.

### docs\api-documentation.md(MODIFY)

Update authentication section to accurately reflect the implementation. Update Login endpoint (lines 33-55) to show correct response format with `success`, `data`, and `error` envelope matching `APIResponse<AuthTokens>` type. Update Refresh Token endpoint (lines 57-61) to show request body format: `{ "refresh_token": "token-here" }` and response format matching login. Update Logout endpoint (lines 63-67) to show it's a POST request (not DELETE) with refresh_token in request body: `{ "refresh_token": "token-here" }`. Add note about token expiration: access tokens expire in 60 minutes (configurable), refresh tokens expire in 30 days. Add section on automatic token refresh: explain that clients should refresh tokens before expiration, handle 401 responses by attempting refresh, and implement exponential backoff for failed refreshes. Update all example code snippets to use correct endpoint paths and request/response formats.

### lattice_mutation_engine\requirements.txt(MODIFY)

Add password hashing library to dependencies. Add `passlib[bcrypt]` to the AUTHENTICATION & SECURITY section (after line 88) to enable bcrypt password hashing. This provides the `CryptContext` class used by the password utility module. The bcrypt extra ensures the bcrypt library is installed as a dependency.