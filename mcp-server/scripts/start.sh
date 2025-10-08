#!/bin/bash

# Lattice MCP Server Startup Script
# This script handles the initialization and startup of the MCP server

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="${PROJECT_ROOT}/logs/startup.log"
PID_FILE="${PROJECT_ROOT}/mcp-server.pid"

# Ensure logs directory exists
mkdir -p "${PROJECT_ROOT}/logs"

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() {
    log "INFO" "$*"
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_warn() {
    log "WARN" "$*"
    echo -e "${YELLOW}[WARN]${NC} $*"
}

log_error() {
    log "ERROR" "$*"
    echo -e "${RED}[ERROR]${NC} $*"
}

log_success() {
    log "SUCCESS" "$*"
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            log_info "Stopping MCP server (PID: $pid)..."
            kill -TERM "$pid" 2>/dev/null || true
            sleep 2
            if kill -0 "$pid" 2>/dev/null; then
                log_warn "Force killing MCP server..."
                kill -KILL "$pid" 2>/dev/null || true
            fi
        fi
        rm -f "$PID_FILE"
    fi
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Check if already running
check_running() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            log_error "MCP server is already running (PID: $pid)"
            exit 1
        else
            log_warn "Stale PID file found, removing..."
            rm -f "$PID_FILE"
        fi
    fi
}

# Validate environment
validate_environment() {
    log_info "Validating environment..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    local node_version=$(node --version | sed 's/v//')
    local required_version="18.0.0"
    
    if ! node -e "process.exit(require('semver').gte('$node_version', '$required_version') ? 0 : 1)" 2>/dev/null; then
        log_error "Node.js version $node_version is not supported. Required: >= $required_version"
        exit 1
    fi
    
    log_success "Node.js version: $node_version"
    
    # Check if dependencies are installed
    if [[ ! -d "$PROJECT_ROOT/node_modules" ]]; then
        log_error "Dependencies not installed. Run 'npm install' first."
        exit 1
    fi
    
    # Check if build exists
    if [[ ! -d "$PROJECT_ROOT/dist" ]]; then
        log_warn "Build directory not found. Building..."
        cd "$PROJECT_ROOT"
        npm run build
    fi
    
    log_success "Environment validation completed"
}

# Load environment variables
load_environment() {
    log_info "Loading environment configuration..."
    
    # Load .env file if it exists
    if [[ -f "$PROJECT_ROOT/.env" ]]; then
        set -a
        source "$PROJECT_ROOT/.env"
        set +a
        log_success "Loaded environment from .env file"
    else
        log_warn "No .env file found, using default configuration"
    fi
    
    # Set default values
    export NODE_ENV="${NODE_ENV:-production}"
    export MCP_SERVER_PORT="${MCP_SERVER_PORT:-3001}"
    export MCP_SERVER_HOST="${MCP_SERVER_HOST:-0.0.0.0}"
    export LOG_LEVEL="${LOG_LEVEL:-info}"
    
    log_info "Environment: $NODE_ENV"
    log_info "Server will listen on: ${MCP_SERVER_HOST}:${MCP_SERVER_PORT}"
}

# Health check function
health_check() {
    local max_attempts=30
    local attempt=1
    
    log_info "Performing health check..."
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "http://localhost:${MCP_SERVER_PORT}/health" > /dev/null 2>&1; then
            log_success "Health check passed"
            return 0
        fi
        
        log_info "Health check attempt $attempt/$max_attempts failed, retrying in 2 seconds..."
        sleep 2
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Start the server
start_server() {
    log_info "Starting Lattice MCP Server..."
    
    cd "$PROJECT_ROOT"
    
    # Start the server in background
    nohup node dist/index.js > "$LOG_FILE" 2>&1 &
    local pid=$!
    
    # Save PID
    echo "$pid" > "$PID_FILE"
    
    log_info "MCP server started with PID: $pid"
    
    # Wait a moment for the server to initialize
    sleep 3
    
    # Check if process is still running
    if ! kill -0 "$pid" 2>/dev/null; then
        log_error "MCP server failed to start"
        return 1
    fi
    
    # Perform health check
    if health_check; then
        log_success "Lattice MCP Server is running successfully!"
        log_info "PID: $pid"
        log_info "Logs: $LOG_FILE"
        log_info "To stop the server, run: ./scripts/stop.sh"
        return 0
    else
        log_error "Server started but health check failed"
        cleanup
        return 1
    fi
}

# Main execution
main() {
    log_info "=== Lattice MCP Server Startup ==="
    log_info "Timestamp: $(date)"
    log_info "Script: $0"
    log_info "Working directory: $(pwd)"
    
    check_running
    validate_environment
    load_environment
    start_server
    
    log_success "=== Startup completed successfully ==="
}

# Run main function
main "$@"