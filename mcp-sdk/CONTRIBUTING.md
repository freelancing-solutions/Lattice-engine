# Contributing to Lattice MCP SDK

Thank you for your interest in contributing to the Lattice MCP SDK! This guide will help you get started with contributing to both the Python and Node.js implementations of the Model Context Protocol (MCP) SDK for Lattice Engine.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Project Structure](#project-structure)
5. [Making Changes](#making-changes)
6. [Testing Requirements](#testing-requirements)
7. [Documentation](#documentation)
8. [Pull Request Process](#pull-request-process)
9. [Release Process](#release-process)
10. [Getting Help](#getting-help)
11. [License](#license)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- Be respectful and considerate in all interactions
- Use inclusive language and welcome all perspectives
- Focus on constructive feedback and collaboration
- Help others learn and grow
- Follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/)

## Getting Started

### Prerequisites

- **Git**: For version control
- **GitHub Account**: For pull requests and issues
- **Python 3.8+**: For Python SDK development
- **Node.js 16+**: For Node.js SDK development
- **Code Editor**: VSCode recommended (with extensions for Python and TypeScript)

### Initial Setup

1. **Fork the Repository**
   ```bash
   # Fork the repository on GitHub
   # Then clone your fork
   git clone https://github.com/YOUR_USERNAME/Lattice-engine.git
   cd Lattice-engine/mcp-sdk
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/freelancing-solutions/Lattice-engine.git
   git fetch upstream
   ```

3. **Create Development Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

## Development Setup

### Python SDK Development

```bash
# Navigate to Python SDK directory
cd python-sdk

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install development dependencies
pip install -r requirements-dev.txt
pip install -e .

# Install pre-commit hooks
pre-commit install
```

#### Python Development Tools

- **Black**: Code formatting
- **isort**: Import sorting
- **flake8**: Linting
- **mypy**: Type checking
- **pytest**: Testing framework
- **pre-commit**: Git hooks

### Node.js SDK Development

```bash
# Navigate to Node.js SDK directory
cd nodejs-sdk

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Build TypeScript
npm run build
# or
yarn build
# or
pnpm build

# Run tests
npm test
# or
yarn test
# or
pnpm test
```

#### Node.js Development Tools

- **TypeScript**: Type system
- **ESLint**: Linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **ts-node**: TypeScript execution
- **husky**: Git hooks

## Project Structure

```
mcp-sdk/
├── python-sdk/                 # Python implementation
│   ├── src/
│   │   ├── mcp_sdk/           # Main package
│   │   │   ├── __init__.py
│   │   │   ├── client.py      # Main client class
│   │   │   ├── auth.py        # Authentication
│   │   │   ├── models/        # Pydantic models
│   │   │   ├── exceptions.py  # Custom exceptions
│   │   │   └── utils/         # Utility functions
│   │   └── tests/             # Test files
│   ├── requirements.txt       # Runtime dependencies
│   ├── requirements-dev.txt   # Development dependencies
│   ├── pyproject.toml        # Project configuration
│   └── README.md              # Python SDK documentation
├── nodejs-sdk/                # TypeScript/JavaScript implementation
│   ├── src/
│   │   ├── index.ts          # Main entry point
│   │   ├── client.ts         # Main client class
│   │   ├── auth.ts           # Authentication
│   │   ├── models/           # TypeScript interfaces
│   │   ├── exceptions.ts     # Custom errors
│   │   └── utils/            # Utility functions
│   ├── tests/                # Test files
│   ├── package.json          # Dependencies and scripts
│   ├── tsconfig.json         # TypeScript configuration
│   ├── jest.config.js        # Jest configuration
│   └── README.md             # Node.js SDK documentation
└── CONTRIBUTING.md            # This file
```

### Shared Documentation

- **[MCP SDK Guide](../docs/mcp-sdk-guide.md)**: Comprehensive documentation
- **[Migration Examples](../docs/migration-examples.md)**: Migration guidance
- **[API Documentation](../docs/api-documentation.md)**: API reference

## Making Changes

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow coding standards for your language
   - Write tests for new functionality
   - Update documentation as needed

3. **Run Local Tests**
   ```bash
   # Python SDK
   cd python-sdk
   pytest

   # Node.js SDK
   cd nodejs-sdk
   npm test
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(python-sdk): add automatic token refresh functionality

fix(nodejs-sdk): resolve memory leak in file upload

docs(migration): update examples for v2.0

test(python-sdk): add integration tests for authentication

refactor(nodejs-sdk): improve error handling consistency
```

### Coding Standards

#### Python (PEP 8)

```python
# Good
from typing import Optional, List
from mcp_sdk.models import Project, MutationCreate


async def create_project_with_mutation(
    client: LatticeClient,
    project_name: str,
    mutation_title: str,
    files: List[str],
) -> Optional[Project]:
    """Create a project and initial mutation.

    Args:
        client: The Lattice client instance
        project_name: Name for the new project
        mutation_title: Title for the initial mutation
        files: List of file paths to include

    Returns:
        The created project or None if creation failed
    """
    try:
        project = await client.create_project(
            ProjectCreate(name=project_name)
        )

        mutation = await client.propose_mutation(
            project.id,
            MutationCreate(
                title=mutation_title,
                changes=prepare_file_changes(files)
            )
        )

        return project

    except Exception as e:
        logger.error(f"Failed to create project: {e}")
        return None


# Bad
def createProject(name, title, files):
    try:
        p = client.create_project(name)
        m = client.propose_mutation(p.id, title, files)
        return p
    except:
        return None
```

#### TypeScript (ESLint + Prettier)

```typescript
// Good
import { LatticeClient } from './client';
import { ProjectCreate, MutationCreate } from './models';

export async function createProjectWithMutation(
  client: LatticeClient,
  projectName: string,
  mutationTitle: string,
  files: string[],
): Promise<Project | null> {
  try {
    const project = await client.createProject(
      new ProjectCreate({ name: projectName })
    );

    const mutation = await client.proposeMutation(
      project.id,
      new MutationCreate({
        title: mutationTitle,
        changes: prepareFileChanges(files),
      }),
    );

    return project;
  } catch (error) {
    logger.error(`Failed to create project: ${error}`);
    return null;
  }
}

// Bad
export function createProject(name, title, files) {
  try {
    let p = client.createProject(name);
    let m = client.proposeMutation(p.id, title, files);
    return p;
  } catch (e) {
    return null;
  }
}
```

## Testing Requirements

### Python Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=mcp_sdk --cov-report=html

# Run specific test file
pytest tests/test_client.py

# Run with verbose output
pytest -v

# Run integration tests
pytest tests/integration/
```

#### Test Structure

```python
# tests/test_client.py
import pytest
from unittest.mock import AsyncMock, patch
from mcp_sdk import LatticeClient
from mcp_sdk.exceptions import AuthenticationError


class TestLatticeClient:
    @pytest.fixture
    def client(self):
        return LatticeClient(
            base_url="https://test.example.com",
            api_key="test-key"
        )

    @pytest.mark.asyncio
    async def test_authentication_success(self, client):
        """Test successful authentication"""
        with patch('aiohttp.ClientSession.post') as mock_post:
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.json.return_value = {
                "access_token": "test-token",
                "refresh_token": "refresh-token"
            }
            mock_post.return_value.__aenter__.return_value = mock_response

            result = await client.authenticate("test@example.com", "password")

            assert result.access_token == "test-token"
            mock_post.assert_called_once()

    @pytest.mark.asyncio
    async def test_authentication_failure(self, client):
        """Test authentication failure"""
        with patch('aiohttp.ClientSession.post') as mock_post:
            mock_response = AsyncMock()
            mock_response.status = 401
            mock_post.return_value.__aenter__.return_value = mock_response

            with pytest.raises(AuthenticationError):
                await client.authenticate("test@example.com", "wrong-password")
```

### Node.js Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- client.test.ts

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration
```

#### Test Structure

```typescript
// tests/client.test.ts
import { LatticeClient } from '../src/client';
import { AuthenticationError } from '../src/exceptions';
import { jest } from '@jest/globals';

describe('LatticeClient', () => {
  let client: LatticeClient;

  beforeEach(() => {
    client = new LatticeClient({
      baseUrl: 'https://test.example.com',
      apiKey: 'test-key',
    });
  });

  describe('authentication', () => {
    it('should authenticate successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          access_token: 'test-token',
          refresh_token: 'refresh-token',
        }),
      };

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await client.authenticate('test@example.com', 'password');

      expect(result.accessToken).toBe('test-token');
      expect(fetch).toHaveBeenCalledWith(
        'https://test.example.com/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password',
          }),
        }),
      );
    });

    it('should throw AuthenticationError on failure', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({
          detail: 'Invalid credentials',
        }),
      };

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      await expect(
        client.authenticate('test@example.com', 'wrong-password'),
      ).rejects.toThrow(AuthenticationError);
    });
  });
});
```

### Testing Requirements

- **Unit Tests**: Required for all new features
- **Integration Tests**: Required for API interactions
- **Code Coverage**: Minimum 80% coverage
- **Test Documentation**: Clear test descriptions and assertions
- **Mock Dependencies**: Use mocks for external services

## Documentation

### Documentation Standards

1. **Docstrings (Python)**: Use Google style
2. **JSDoc (TypeScript)**: Use JSDoc format
3. **README Updates**: Update relevant README files
4. **Examples**: Include usage examples
5. **Migration Guides**: Update for breaking changes

### Python Documentation Example

```python
def propose_mutation(
    self,
    project_id: str,
    mutation: MutationCreate,
    timeout: Optional[int] = None,
) -> Mutation:
    """Propose a new mutation for a project.

    This method creates a new mutation proposal that can be reviewed
    and approved by authorized users.

    Args:
        project_id: The ID of the project to create the mutation for
        mutation: The mutation details including title, description, and changes
        timeout: Optional timeout in seconds (defaults to client timeout)

    Returns:
        The created mutation object with ID and metadata

    Raises:
        ProjectNotFoundError: If the project doesn't exist
        PermissionError: If user lacks permission to create mutations
        ValidationError: If mutation data is invalid

    Example:
        >>> client = LatticeClient(api_key="your-key")
        >>> mutation = await client.propose_mutation(
        ...     "project-123",
        ...     MutationCreate(
        ...         title="Fix authentication bug",
        ...         description="Update login validation logic",
        ...         changes=[
        ...             FileChange(
        ...                 file_path="src/auth.py",
        ...                 operation="modify",
        ...                 content="# Updated code"
        ...             )
        ...         ]
        ...     )
        ... )
        >>> print(f"Created mutation: {mutation.id}")
    """
```

### TypeScript Documentation Example

```typescript
/**
 * Proposes a new mutation for a project.
 *
 * This method creates a new mutation proposal that can be reviewed
 * and approved by authorized users.
 *
 * @param projectId - The ID of the project to create the mutation for
 * @param mutation - The mutation details including title, description, and changes
 * @param timeout - Optional timeout in seconds (defaults to client timeout)
 * @returns The created mutation object with ID and metadata
 *
 * @throws {ProjectNotFoundError} If the project doesn't exist
 * @throws {PermissionError} If user lacks permission to create mutations
 * @throws {ValidationError} If mutation data is invalid
 *
 * @example
 * ```typescript
 * const client = new LatticeClient({ apiKey: "your-key" });
 * const mutation = await client.proposeMutation(
 *   "project-123",
 *   new MutationCreate({
 *     title: "Fix authentication bug",
 *     description: "Update login validation logic",
 *     changes: [
 *       new FileChange({
 *         filePath: "src/auth.ts",
 *         operation: "modify",
 *         content: "// Updated code"
 *       })
 *     ]
 *   })
 * );
 * console.log(`Created mutation: ${mutation.id}`);
 * ```
 */
public async proposeMutation(
  projectId: string,
  mutation: MutationCreate,
  timeout?: number,
): Promise<Mutation> {
  // Implementation
}
```

## Pull Request Process

### Pre-submission Checklist

- [ ] Code follows project style guidelines
- [ ] All tests pass (both Python and Node.js if applicable)
- [ ] Code coverage is at least 80%
- [ ] Documentation is updated
- [ ] Commit messages follow conventional format
- [ ] Changes are rebased onto latest main branch
- [ ] No merge commits in the PR branch

### Pull Request Template

```markdown
## Description
Brief description of the changes made in this pull request.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests pass locally

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] CHANGELOG updated (if applicable)

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Additional Context
Any additional context about the changes.
```

### Pull Request Review Process

1. **Automated Checks**
   - CI/CD pipeline runs tests
   - Code coverage validation
   - Linting and formatting checks
   - Security vulnerability scanning

2. **Code Review**
   - At least one maintainer review required
   - Focus on functionality, security, and maintainability
   - Discuss design decisions and implementation

3. **Approval and Merge**
   - Address all review feedback
   - Maintain approval from reviewers
   - Squash commits if requested
   - Merge into main branch

## Release Process

This section is for maintainers who create releases.

### Version Management

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Update Version Numbers**
   ```bash
   # Python SDK
   cd python-sdk
   bump2version patch  # or minor, major

   # Node.js SDK
   cd nodejs-sdk
   npm version patch   # or minor, major
   ```

2. **Update CHANGELOG**
   ```bash
   # Add release notes to CHANGELOG.md
   # Include new features, bug fixes, breaking changes
   ```

3. **Create Release Tag**
   ```bash
   git tag -a v1.2.3 -m "Release version 1.2.3"
   git push origin v1.2.3
   ```

4. **Publish to Package Managers**
   ```bash
   # Python SDK
   cd python-sdk
   python -m build
   twine upload dist/*

   # Node.js SDK
   cd nodejs-sdk
   npm publish
   ```

5. **Create GitHub Release**
   - Create release on GitHub
   - Include changelog information
   - Link to documentation

## Getting Help

### Resources

- **[MCP SDK Guide](../docs/mcp-sdk-guide.md)**: Complete documentation
- **[API Documentation](../docs/api-documentation.md)**: API reference
- **[Migration Examples](../docs/migration-examples.md)**: Migration guidance
- **[GitHub Issues](https://github.com/freelancing-solutions/Lattice-engine/issues)**: Bug reports and feature requests

### Community

- **[Discord Community](https://discord.gg/lattice)**: Real-time discussion
- **[GitHub Discussions](https://github.com/freelancing-solutions/Lattice-engine/discussions)**: Q&A and discussions
- **[Email Support](mailto:support@project-lattice.site)**: Direct support

### Getting Help for Contributions

If you need help with contributing:

1. **Check existing issues** and documentation
2. **Search discussions** for similar questions
3. **Create an issue** with the "question" label
4. **Join Discord** for real-time help
5. **Start a discussion** on GitHub

When asking for help, please include:

- What you're trying to accomplish
- What you've tried so far
- Any error messages or logs
- Your environment details (OS, versions, etc.)

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License, as specified in the [LICENSE](LICENSE) file.

### License Summary

- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

See the [LICENSE](LICENSE) file for the full license text.

---

Thank you for contributing to the Lattice MCP SDK! Your contributions help make the project better for everyone. 🚀