# BugSage Backend API

AI-powered debugging platform backend built with FastAPI, PydanticAI, and PostgreSQL.

## Features

- **Error Tracking**: Comprehensive error logging and analysis with AI-powered insights
- **Fix Generation**: Automated fix suggestions using multiple AI models
- **Project Management**: Organize errors and fixes by projects
- **User Management**: Role-based access control and authentication
- **Real-time Analysis**: Vector embeddings for semantic error search
- **Statistics & Analytics**: Comprehensive reporting and metrics
- **Webhook Integration**: Process errors from external systems
- **RESTful API**: Complete CRUD operations for all entities

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy 2.0**: Async ORM with PostgreSQL support
- **PydanticAI**: AI model integration and orchestration
- **PostgreSQL**: Primary database with pgvector extension
- **Alembic**: Database migrations
- **Pydantic 2.0**: Data validation and serialization
- **Python 3.11+**: Runtime environment

## Quick Start

### Prerequisites

- Python 3.11 or higher
- PostgreSQL 14+ with pgvector extension
- Redis (for background tasks)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bugsage-backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv

   # Windows
   venv\Scripts\activate

   # Unix/MacOS
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Setup**

   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

   Configure the following environment variables:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost/bugsage_db

   # AI Models
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key

   # Security
   SECRET_KEY=your_secret_key_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30

   # Application
   DEBUG=true
   LOG_LEVEL=INFO
   ```

5. **Database Setup**

   Install PostgreSQL with pgvector:
   ```bash
   # On Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   sudo apt-get install postgresql-14-pgvector

   # On macOS with Homebrew
   brew install postgresql@14
   brew install pgvector
   ```

   Create database and enable extension:
   ```sql
   CREATE DATABASE bugsage_db;
   \c bugsage_db
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

6. **Run Database Migrations**
   ```bash
   alembic upgrade head
   ```

7. **Start the Application**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at `http://localhost:8000`

## API Documentation

Once the application is running, you can access:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`

## Project Structure

```
bugsage-backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── errors.py
│   │       │   ├── fixes.py
│   │       │   ├── users.py
│   │       │   ├── projects.py
│   │       │   └── health.py
│   │       └── api.py
│   ├── ai/
│   │   ├── agents/
│   │   │   ├── error_analysis_agent.py
│   │   │   ├── fix_generation_agent.py
│   │   │   └── code_analysis_agent.py
│   │   └── agent_manager.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── exceptions.py
│   │   ├── logger.py
│   │   └── middleware.py
│   ├── models/
│   │   ├── base.py
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── error.py
│   │   └── fix.py
│   ├── schemas/
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── error.py
│   │   └── fix.py
│   ├── services/
│   │   ├── user_service.py
│   │   ├── project_service.py
│   │   ├── error_service.py
│   │   ├── fix_service.py
│   │   └── analysis_service.py
│   └── main.py
├── alembic/
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
├── tests/
├── requirements.txt
├── alembic.ini
└── README.md
```

## API Endpoints

### Health Checks
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check with dependencies
- `GET /health/readiness` - Kubernetes readiness probe
- `GET /health/liveness` - Kubernetes liveness probe
- `GET /health/metrics` - Application metrics

### Errors
- `POST /api/v1/errors/` - Create new error
- `GET /api/v1/errors/` - List errors with filtering
- `GET /api/v1/errors/{error_id}` - Get specific error
- `PUT /api/v1/errors/{error_id}` - Update error
- `DELETE /api/v1/errors/{error_id}` - Delete error
- `POST /api/v1/errors/{error_id}/analyze` - Analyze error with AI
- `POST /api/v1/errors/{error_id}/resolve` - Mark error as resolved
- `GET /api/v1/errors/statistics/overview` - Error statistics
- `GET /api/v1/errors/search` - Search errors
- `POST /api/v1/errors/webhook` - Process webhook

### Fixes
- `POST /api/v1/fixes/` - Create new fix
- `GET /api/v1/fixes/` - List fixes with filtering
- `GET /api/v1/fixes/{fix_id}` - Get specific fix
- `PUT /api/v1/fixes/{fix_id}` - Update fix
- `DELETE /api/v1/fixes/{fix_id}` - Delete fix
- `POST /api/v1/fixes/{fix_id}/apply` - Apply fix
- `POST /api/v1/fixes/{fix_id}/reject` - Reject fix
- `GET /api/v1/fixes/statistics/overview` - Fix statistics
- `GET /api/v1/fixes/search` - Search fixes
- `GET /api/v1/fixes/{fix_id}/similar` - Get similar fixes

### Users
- `POST /api/v1/users/` - Create new user
- `POST /api/v1/users/login` - Authenticate user
- `GET /api/v1/users/` - List users
- `GET /api/v1/users/{user_id}` - Get specific user
- `PUT /api/v1/users/{user_id}` - Update user
- `DELETE /api/v1/users/{user_id}` - Delete user
- `POST /api/v1/users/{user_id}/activate` - Activate user
- `POST /api/v1/users/{user_id}/deactivate` - Deactivate user
- `POST /api/v1/users/{user_id}/change-password` - Change password

### Projects
- `POST /api/v1/projects/` - Create new project
- `GET /api/v1/projects/` - List projects
- `GET /api/v1/projects/{project_id}` - Get specific project
- `PUT /api/v1/projects/{project_id}` - Update project
- `DELETE /api/v1/projects/{project_id}` - Delete project
- `GET /api/v1/projects/{project_id}/statistics` - Project statistics
- `GET /api/v1/projects/{project_id}/activity` - Project activity
- `GET /api/v1/projects/{project_id}/health` - Project health

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User accounts and authentication
- **projects**: Project management and organization
- **errors**: Error tracking and analysis data
- **fixes**: Fix suggestions and application tracking

All tables include comprehensive indexing for performance and support full-text search capabilities.

## AI Integration

The application integrates with multiple AI models:

- **OpenAI GPT-4**: Error analysis and fix generation
- **Anthropic Claude**: Code analysis and improvement suggestions
- **Custom Agents**: Specialized analysis using PydanticAI

AI features include:
- Automatic error categorization and severity assessment
- Fix suggestion generation with confidence scoring
- Code quality analysis and improvement recommendations
- Semantic similarity search using vector embeddings

## Development

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest

# Run with coverage
pytest --cov=app
```

### Code Quality

```bash
# Format code
black app/

# Type checking
mypy app/

# Linting
flake8 app/
```

### Database Migrations

Create new migration:
```bash
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback migrations:
```bash
alembic downgrade -1
```

## Configuration

The application uses Pydantic Settings for configuration management. Key configuration areas:

- **Database**: PostgreSQL connection settings
- **AI Models**: API keys and model configurations
- **Security**: JWT settings and encryption
- **Logging**: Log levels and output formatting
- **Monitoring**: Metrics and health check settings

## Deployment

### Docker

Build and run with Docker:
```bash
docker build -t bugsage-api .
docker run -p 8000:8000 bugsage-api
```

### Environment Variables

Key environment variables for production:

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
SECRET_KEY=your-secret-key
DEBUG=false
LOG_LEVEL=WARNING
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/docs`
- Review the logs for detailed error information