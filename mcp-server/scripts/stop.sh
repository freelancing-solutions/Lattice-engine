#!/bin/bash

# Lattice MCP Server Stop Script
# This script handles the graceful shutdown of the MCP server

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
LOG_FILE="${PROJECT_ROOT}/logs/shutdown.log"
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

# Check if server is running
check_running() {
    if [[ ! -f "$PID_FILE" ]]; then
        log_warn "PID file not found. Server may not be running."
        return 1
    fi
    
    local pid=$(cat "$PID_FILE")
    if ! kill -0 "$pid" 2>/dev/null; then
        log_warn "Process with PID $pid is not running. Cleaning up stale PID file."
        rm -f "$PID_FILE"
        return 1
    fi
    
    return 0
}

# Graceful shutdown
graceful_shutdown() {
    local pid="$1"
    local timeout="${2:-30}"
    
    log_info "Sending SIGTERM to process $pid..."
    kill -TERM "$pid" 2>/dev/null || {
        log_error "Failed to send SIGTERM to process $pid"
        return 1
    }
    
    # Wait for graceful shutdown
    local count=0
    while kill -0 "$pid" 2>/dev/null && [[ $count -lt $timeout ]]; do
        sleep 1
        ((count++))
        if [[ $((count % 5)) -eq 0 ]]; then
            log_info "Waiting for graceful shutdown... ($count/${timeout}s)"
        fi
    done
    
    if kill -0 "$pid" 2>/dev/null; then
        log_warn "Process did not terminate gracefully within ${timeout}s"
        return 1
    else
        log_success "Process terminated gracefully"
        return 0
    fi
}

# Force shutdown
force_shutdown() {
    local pid="$1"
    
    log_warn "Forcing shutdown of process $pid..."
    kill -KILL "$pid" 2>/dev/null || {
        log_error "Failed to force kill process $pid"
        return 1
    }
    
    # Wait a moment to ensure process is killed
    sleep 2
    
    if kill -0 "$pid" 2>/dev/null; then
        log_error "Failed to kill process $pid"
        return 1
    else
        log_success "Process force killed"
        return 0
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    
    # Remove PID file
    if [[ -f "$PID_FILE" ]]; then
        rm -f "$PID_FILE"
        log_info "Removed PID file"
    fi
    
    # Optional: Clean up temporary files
    local temp_dir="${PROJECT_ROOT}/tmp"
    if [[ -d "$temp_dir" ]]; then
        rm -rf "$temp_dir"
        log_info "Cleaned up temporary files"
    fi
}

# Stop server function
stop_server() {
    log_info "Stopping Lattice MCP Server..."
    
    if ! check_running; then
        log_info "Server is not running"
        cleanup
        return 0
    fi
    
    local pid=$(cat "$PID_FILE")
    log_info "Found running server with PID: $pid"
    
    # Try graceful shutdown first
    if graceful_shutdown "$pid" 30; then
        log_success "Server stopped gracefully"
    else
        log_warn "Graceful shutdown failed, attempting force shutdown..."
        if force_shutdown "$pid"; then
            log_success "Server stopped forcefully"
        else
            log_error "Failed to stop server"
            return 1
        fi
    fi
    
    cleanup
    return 0
}

# Show server status
show_status() {
    log_info "Checking server status..."
    
    if check_running; then
        local pid=$(cat "$PID_FILE")
        log_info "Server is running with PID: $pid"
        
        # Show process info
        if command -v ps &> /dev/null; then
            log_info "Process info:"
            ps -p "$pid" -o pid,ppid,cmd,etime,pcpu,pmem 2>/dev/null || true
        fi
        
        # Check if server is responding
        local port="${MCP_SERVER_PORT:-3001}"
        if command -v curl &> /dev/null; then
            if curl -f -s "http://localhost:${port}/health" > /dev/null 2>&1; then
                log_success "Server is responding to health checks"
            else
                log_warn "Server is running but not responding to health checks"
            fi
        fi
    else
        log_info "Server is not running"
    fi
}

# Main execution
main() {
    local action="${1:-stop}"
    
    log_info "=== Lattice MCP Server Control ==="
    log_info "Timestamp: $(date)"
    log_info "Action: $action"
    
    case "$action" in
        "stop")
            stop_server
            ;;
        "status")
            show_status
            ;;
        "restart")
            log_info "Restarting server..."
            stop_server
            sleep 2
            exec "$SCRIPT_DIR/start.sh"
            ;;
        *)
            echo "Usage: $0 {stop|status|restart}"
            echo "  stop    - Stop the MCP server"
            echo "  status  - Show server status"
            echo "  restart - Restart the MCP server"
            exit 1
            ;;
    esac
    
    log_success "=== Operation completed ==="
}

# Run main function
main "$@"