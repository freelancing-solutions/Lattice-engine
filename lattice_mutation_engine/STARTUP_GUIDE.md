# Lattice Mutation Engine - Startup Guide

## Quick Start

### 1. Install Dependencies

You have two options:

**Option A: Install all dependencies (recommended for full functionality)**
```bash
pip install -r requirements.txt
```

**Option B: Install minimal dependencies first (for testing)**
```bash
pip install -r minimal_requirements.txt
```

### 2. Fix Import Issues

The engine uses relative imports that can fail when running directly. We've provided two solutions:

**Option A: Use the dedicated runner script (recommended)**
```bash
python run.py
```

**Option B: Run as a Python module**
```bash
python -m lattice_mutation_engine.main
```

**Option C: Set PYTHONPATH environment variable**
```bash
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
python main.py
```

### 3. Test Your Setup

Before running the full engine, test your imports:
```bash
python test_imports.py
```

### 4. Configure Environment

Make sure your `.env` file is properly configured:
```bash
cp .env.example .env
# Edit .env with your specific configuration
```

### 5. Run the Engine

Once dependencies are installed and imports are working:
```bash
python run.py
```

## Troubleshooting

### Import Errors
- **Error**: `ImportError: attempted relative import with no known parent package`
- **Solution**: Use `python run.py` instead of `python main.py`

### Missing Dependencies
- **Error**: `No module named 'anthropic'` or similar
- **Solution**: Run `pip install -r requirements.txt`

### Redis Connection Issues
- **Error**: Redis connection failures
- **Solution**: Ensure Redis is running or disable it in `.env` (set `REDIS_URL=`)

### Neo4j Connection Issues
- **Error**: Neo4j connection failures
- **Solution**: The engine will automatically fall back to in-memory storage

## Development Mode

For development, you can use the minimal requirements and gradually add features:

1. Start with minimal dependencies
2. Test basic functionality
3. Add AI/ML dependencies as needed
4. Add database dependencies as needed

## Production Mode

For production, install all requirements:
```bash
pip install -r requirements.txt
```

And ensure all external services (Redis, Neo4j, Qdrant) are properly configured and running.