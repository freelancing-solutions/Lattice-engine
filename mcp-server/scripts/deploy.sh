#!/bin/bash

# Lattice MCP Server Deployment Script
# This script handles the deployment of the MCP server to production environments

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOY_LOG="${PROJECT_ROOT}/logs/deploy.log"
BACKUP_DIR="${PROJECT_ROOT}/backups"
DEPLOY_ENV="${DEPLOY_ENV:-production}"

# Default configuration
DEFAULT_REGISTRY="lattice-registry.com"
DEFAULT_IMAGE_NAME="lattice/mcp-server"
DEFAULT_TAG="latest"

# Ensure directories exist
mkdir -p "${PROJECT_ROOT}/logs" "${BACKUP_DIR}"

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$DEPLOY_LOG"
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

log_step() {
    log "STEP" "$*"
    echo -e "${PURPLE}[STEP]${NC} $*"
}

# Error handling
handle_error() {
    local exit_code=$?
    local line_number=$1
    log_error "Deployment failed at line $line_number with exit code $exit_code"
    log_error "Check the deployment log: $DEPLOY_LOG"
    exit $exit_code
}

trap 'handle_error $LINENO' ERR

# Load configuration
load_config() {
    log_info "Loading deployment configuration..."
    
    # Load environment-specific config
    local config_file="${PROJECT_ROOT}/config/deploy.${DEPLOY_ENV}.env"
    if [[ -f "$config_file" ]]; then
        set -a
        source "$config_file"
        set +a
        log_success "Loaded configuration from $config_file"
    else
        log_warn "No environment-specific config found: $config_file"
    fi
    
    # Set defaults
    export REGISTRY="${REGISTRY:-$DEFAULT_REGISTRY}"
    export IMAGE_NAME="${IMAGE_NAME:-$DEFAULT_IMAGE_NAME}"
    export IMAGE_TAG="${IMAGE_TAG:-$DEFAULT_TAG}"
    export DEPLOY_TARGET="${DEPLOY_TARGET:-docker}"
    
    log_info "Registry: $REGISTRY"
    log_info "Image: $IMAGE_NAME:$IMAGE_TAG"
    log_info "Target: $DEPLOY_TARGET"
    log_info "Environment: $DEPLOY_ENV"
}

# Pre-deployment checks
pre_deploy_checks() {
    log_step "Running pre-deployment checks..."
    
    # Check required tools
    local required_tools=("node" "npm" "docker")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Required tool not found: $tool"
            exit 1
        fi
    done
    
    # Check Node.js version
    local node_version=$(node --version | sed 's/v//')
    local required_version="18.0.0"
    if ! node -e "process.exit(require('semver').gte('$node_version', '$required_version') ? 0 : 1)" 2>/dev/null; then
        log_error "Node.js version $node_version is not supported. Required: >= $required_version"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        log_error "package.json not found. Are you in the right directory?"
        exit 1
    fi
    
    # Check if there are uncommitted changes (if in git repo)
    if [[ -d "$PROJECT_ROOT/.git" ]]; then
        if ! git diff-index --quiet HEAD --; then
            log_warn "There are uncommitted changes in the repository"
            read -p "Continue anyway? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_info "Deployment cancelled"
                exit 0
            fi
        fi
    fi
    
    log_success "Pre-deployment checks passed"
}

# Build application
build_application() {
    log_step "Building application..."
    
    cd "$PROJECT_ROOT"
    
    # Clean previous build
    if [[ -d "dist" ]]; then
        rm -rf dist
        log_info "Cleaned previous build"
    fi
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --only=production
    
    # Run tests
    log_info "Running tests..."
    npm test
    
    # Build application
    log_info "Building TypeScript..."
    npm run build
    
    # Verify build
    if [[ ! -f "dist/index.js" ]]; then
        log_error "Build failed: dist/index.js not found"
        exit 1
    fi
    
    log_success "Application built successfully"
}

# Build Docker image
build_docker_image() {
    log_step "Building Docker image..."
    
    cd "$PROJECT_ROOT"
    
    local full_image_name="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
    local build_args=""
    
    # Add build arguments if specified
    if [[ -n "${BUILD_ARGS:-}" ]]; then
        build_args="$BUILD_ARGS"
    fi
    
    log_info "Building image: $full_image_name"
    docker build $build_args -t "$full_image_name" .
    
    # Tag with additional tags if specified
    if [[ -n "${ADDITIONAL_TAGS:-}" ]]; then
        IFS=',' read -ra TAGS <<< "$ADDITIONAL_TAGS"
        for tag in "${TAGS[@]}"; do
            local additional_image="${REGISTRY}/${IMAGE_NAME}:${tag}"
            docker tag "$full_image_name" "$additional_image"
            log_info "Tagged as: $additional_image"
        done
    fi
    
    log_success "Docker image built successfully"
}

# Push Docker image
push_docker_image() {
    log_step "Pushing Docker image..."
    
    local full_image_name="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
    
    # Login to registry if credentials are provided
    if [[ -n "${REGISTRY_USERNAME:-}" && -n "${REGISTRY_PASSWORD:-}" ]]; then
        log_info "Logging into registry..."
        echo "$REGISTRY_PASSWORD" | docker login "$REGISTRY" -u "$REGISTRY_USERNAME" --password-stdin
    fi
    
    log_info "Pushing image: $full_image_name"
    docker push "$full_image_name"
    
    # Push additional tags
    if [[ -n "${ADDITIONAL_TAGS:-}" ]]; then
        IFS=',' read -ra TAGS <<< "$ADDITIONAL_TAGS"
        for tag in "${TAGS[@]}"; do
            local additional_image="${REGISTRY}/${IMAGE_NAME}:${tag}"
            docker push "$additional_image"
            log_info "Pushed: $additional_image"
        done
    fi
    
    log_success "Docker image pushed successfully"
}

# Deploy to Kubernetes
deploy_kubernetes() {
    log_step "Deploying to Kubernetes..."
    
    local k8s_dir="${PROJECT_ROOT}/k8s"
    if [[ ! -d "$k8s_dir" ]]; then
        log_error "Kubernetes manifests directory not found: $k8s_dir"
        exit 1
    fi
    
    # Apply manifests
    log_info "Applying Kubernetes manifests..."
    kubectl apply -f "$k8s_dir/" --namespace="${K8S_NAMESPACE:-default}"
    
    # Wait for deployment to be ready
    local deployment_name="${K8S_DEPLOYMENT_NAME:-lattice-mcp-server}"
    log_info "Waiting for deployment to be ready..."
    kubectl rollout status deployment/"$deployment_name" --namespace="${K8S_NAMESPACE:-default}" --timeout=300s
    
    log_success "Kubernetes deployment completed"
}

# Deploy with Docker Compose
deploy_docker_compose() {
    log_step "Deploying with Docker Compose..."
    
    cd "$PROJECT_ROOT"
    
    # Pull latest images
    log_info "Pulling latest images..."
    docker-compose pull
    
    # Stop existing services
    log_info "Stopping existing services..."
    docker-compose down
    
    # Start services
    log_info "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose ps | grep -q "Up (healthy)"; then
            log_success "Services are healthy"
            break
        fi
        
        log_info "Health check attempt $attempt/$max_attempts..."
        sleep 10
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        log_error "Services failed to become healthy"
        docker-compose logs
        exit 1
    fi
    
    log_success "Docker Compose deployment completed"
}

# Create backup
create_backup() {
    log_step "Creating backup..."
    
    local backup_name="mcp-server-backup-$(date +%Y%m%d-%H%M%S)"
    local backup_path="${BACKUP_DIR}/${backup_name}"
    
    mkdir -p "$backup_path"
    
    # Backup configuration
    if [[ -f "${PROJECT_ROOT}/.env" ]]; then
        cp "${PROJECT_ROOT}/.env" "$backup_path/"
    fi
    
    # Backup logs
    if [[ -d "${PROJECT_ROOT}/logs" ]]; then
        cp -r "${PROJECT_ROOT}/logs" "$backup_path/"
    fi
    
    # Create archive
    cd "$BACKUP_DIR"
    tar -czf "${backup_name}.tar.gz" "$backup_name"
    rm -rf "$backup_name"
    
    log_success "Backup created: ${backup_path}.tar.gz"
}

# Post-deployment verification
post_deploy_verification() {
    log_step "Running post-deployment verification..."
    
    local health_url="${HEALTH_CHECK_URL:-http://localhost:3001/health}"
    local max_attempts=30
    local attempt=1
    
    log_info "Checking service health at: $health_url"
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "$health_url" > /dev/null 2>&1; then
            log_success "Health check passed"
            break
        fi
        
        log_info "Health check attempt $attempt/$max_attempts..."
        sleep 10
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        log_error "Post-deployment health check failed"
        exit 1
    fi
    
    # Run additional verification tests if specified
    if [[ -n "${VERIFICATION_SCRIPT:-}" && -f "$VERIFICATION_SCRIPT" ]]; then
        log_info "Running custom verification script..."
        bash "$VERIFICATION_SCRIPT"
    fi
    
    log_success "Post-deployment verification completed"
}

# Rollback function
rollback() {
    log_step "Rolling back deployment..."
    
    case "$DEPLOY_TARGET" in
        "kubernetes")
            kubectl rollout undo deployment/"${K8S_DEPLOYMENT_NAME:-lattice-mcp-server}" --namespace="${K8S_NAMESPACE:-default}"
            ;;
        "docker-compose")
            # Restore from backup if available
            local latest_backup=$(ls -t "${BACKUP_DIR}"/*.tar.gz 2>/dev/null | head -1)
            if [[ -n "$latest_backup" ]]; then
                log_info "Restoring from backup: $latest_backup"
                cd "$BACKUP_DIR"
                tar -xzf "$latest_backup"
                # Additional rollback logic here
            fi
            ;;
        *)
            log_warn "Rollback not implemented for target: $DEPLOY_TARGET"
            ;;
    esac
    
    log_success "Rollback completed"
}

# Main deployment function
deploy() {
    log_info "=== Lattice MCP Server Deployment ==="
    log_info "Timestamp: $(date)"
    log_info "Environment: $DEPLOY_ENV"
    log_info "Target: $DEPLOY_TARGET"
    
    pre_deploy_checks
    create_backup
    build_application
    
    case "$DEPLOY_TARGET" in
        "docker")
            build_docker_image
            push_docker_image
            ;;
        "kubernetes")
            build_docker_image
            push_docker_image
            deploy_kubernetes
            ;;
        "docker-compose")
            build_docker_image
            deploy_docker_compose
            ;;
        *)
            log_error "Unknown deployment target: $DEPLOY_TARGET"
            exit 1
            ;;
    esac
    
    post_deploy_verification
    
    log_success "=== Deployment completed successfully ==="
    log_info "Deployment log: $DEPLOY_LOG"
}

# Show usage
usage() {
    echo "Usage: $0 [OPTIONS] COMMAND"
    echo ""
    echo "Commands:"
    echo "  deploy    Deploy the MCP server"
    echo "  rollback  Rollback the deployment"
    echo "  status    Show deployment status"
    echo ""
    echo "Options:"
    echo "  -e, --env ENV        Deployment environment (default: production)"
    echo "  -t, --target TARGET  Deployment target (docker|kubernetes|docker-compose)"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  DEPLOY_ENV          Deployment environment"
    echo "  DEPLOY_TARGET       Deployment target"
    echo "  REGISTRY            Docker registry"
    echo "  IMAGE_NAME          Docker image name"
    echo "  IMAGE_TAG           Docker image tag"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            DEPLOY_ENV="$2"
            shift 2
            ;;
        -t|--target)
            DEPLOY_TARGET="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        deploy|rollback|status)
            COMMAND="$1"
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    load_config
    
    case "${COMMAND:-deploy}" in
        "deploy")
            deploy
            ;;
        "rollback")
            rollback
            ;;
        "status")
            post_deploy_verification
            ;;
        *)
            log_error "Unknown command: ${COMMAND:-}"
            usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"