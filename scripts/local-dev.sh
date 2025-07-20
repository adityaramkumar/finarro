#!/bin/bash

# Local Development Script for finarro
# This script provides a comprehensive way to run and test your application locally

set -e  # Exit on any error

# Get the project root directory (parent of scripts directory)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=3001
FRONTEND_PORT=3000
DB_NAME="finarro_dev"
LOG_DIR="./logs"

# Create logs directory
mkdir -p $LOG_DIR

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command_exists node; then
        log_error "Node.js is not installed. Please install Node.js 20+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    if ! command_exists psql; then
        log_error "PostgreSQL is not installed. Please install PostgreSQL 12+ first."
        exit 1
    fi
    
    if ! command_exists npm; then
        log_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    log_success "All prerequisites are met"
}

# Check and create database
setup_database() {
    log_info "Setting up database..."
    
    # Check if database exists
    if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        log_success "Database '$DB_NAME' already exists"
    else
        log_info "Creating database '$DB_NAME'..."
        createdb $DB_NAME || {
            log_error "Failed to create database. Make sure PostgreSQL is running and you have the necessary permissions."
            exit 1
        }
        log_success "Database '$DB_NAME' created successfully"
    fi
}

# Validate environment files
validate_environment() {
    log_info "Validating environment files..."
    
    # Check backend .env
    if [ ! -f "backend/.env" ]; then
        log_warning "Backend .env file not found. Creating template..."
        cat > backend/.env << 'EOF'
# Database Configuration
DATABASE_URL=postgres://postgres:password@localhost:5432/finarro_dev
NODE_ENV=development
PORT=3001

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your_jwt_secret_here_64_character_string_change_this_in_production
JWT_REFRESH_SECRET=your_refresh_secret_here_64_character_string_change_this_too

# Google Gemini AI (Optional for basic functionality)
GEMINI_API_KEY=your_gemini_api_key_here

# Plaid Configuration (Optional for financial data)
PLAID_CLIENT_ID=plaid_client_id_here_get_from_plaid_dashboard
PLAID_SECRET=plaid_secret_key_here_get_from_plaid_dashboard
PLAID_ENV=sandbox

# Stripe Configuration (Optional for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PRICE_ID=price_your_monthly_subscription_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration (Optional for user verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EOF
        log_warning "Please edit backend/.env with your actual credentials"
    fi
    
    # Check frontend .env
    if [ ! -f "frontend/.env.development" ]; then
        log_warning "Frontend .env.development file not found. Creating template..."
        cat > frontend/.env.development << 'EOF'
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# Stripe Configuration (Optional)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Environment
NODE_ENV=development
GENERATE_SOURCEMAP=true
EOF
        log_warning "Please edit frontend/.env.development with your actual credentials"
    fi
    
    log_success "Environment files validated"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Root dependencies
    log_info "Installing root dependencies..."
    npm install
    
    # Backend dependencies
    log_info "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Frontend dependencies
    log_info "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    log_success "All dependencies installed"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    cd backend
    npm run migrate || {
        log_error "Failed to run migrations. Check your database connection."
        exit 1
    }
    cd ..
    log_success "Database migrations completed"
}

# Check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 1
    else
        return 0
    fi
}

# Kill processes on ports
cleanup_ports() {
    log_info "Cleaning up ports..."
    
    if ! check_port $BACKEND_PORT; then
        log_warning "Port $BACKEND_PORT is in use. Attempting to free it..."
        lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
    fi
    
    if ! check_port $FRONTEND_PORT; then
        log_warning "Port $FRONTEND_PORT is in use. Attempting to free it..."
        lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
    fi
    
    sleep 2
}

# Start backend
start_backend() {
    log_info "Starting backend server..."
    cd backend
    npm run dev > ../$LOG_DIR/backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    log_info "Waiting for backend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:$BACKEND_PORT/health >/dev/null 2>&1; then
            log_success "Backend started successfully on port $BACKEND_PORT"
            return 0
        fi
        sleep 1
    done
    
    log_error "Backend failed to start. Check logs: $LOG_DIR/backend.log"
    return 1
}

# Start frontend
start_frontend() {
    log_info "Starting frontend server..."
    cd frontend
    npm start > ../$LOG_DIR/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to start
    log_info "Waiting for frontend to start..."
    for i in {1..60}; do
        if curl -s http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
            log_success "Frontend started successfully on port $FRONTEND_PORT"
            return 0
        fi
        sleep 1
    done
    
    log_error "Frontend failed to start. Check logs: $LOG_DIR/frontend.log"
    return 1
}

# Health checks
run_health_checks() {
    log_info "Running health checks..."
    
    # Backend health check
    if curl -s http://localhost:$BACKEND_PORT/health >/dev/null 2>&1; then
        log_success "✓ Backend health check passed"
    else
        log_error "✗ Backend health check failed"
        return 1
    fi
    
    # Frontend health check
    if curl -s http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
        log_success "✓ Frontend health check passed"
    else
        log_error "✗ Frontend health check failed"
        return 1
    fi
    
    log_success "All health checks passed!"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    cleanup_ports
    log_info "Cleanup completed"
}

# Trap cleanup on exit
trap cleanup EXIT INT TERM

# Main function
main() {
    echo "🚀 finarro Local Development Environment"
    echo "========================================"
    echo ""
    
    case "${1:-start}" in
        "start")
            check_prerequisites
            validate_environment
            setup_database
            install_dependencies
            run_migrations
            cleanup_ports
            
            if start_backend; then
                if start_frontend; then
                    echo ""
                    log_success "🎉 finarro is running locally!"
                    echo ""
                    echo "📱 Frontend: http://localhost:$FRONTEND_PORT"
                    echo "🔧 Backend:  http://localhost:$BACKEND_PORT"
                    echo "📊 Health:   http://localhost:$BACKEND_PORT/health"
                    echo ""
                    echo "📝 Logs:"
                    echo "   Backend: $LOG_DIR/backend.log"
                    echo "   Frontend: $LOG_DIR/frontend.log"
                    echo ""
                    echo "Press Ctrl+C to stop all services"
                    
                    # Keep script running
                    wait
                else
                    log_error "Failed to start frontend"
                    exit 1
                fi
            else
                log_error "Failed to start backend"
                exit 1
            fi
            ;;
        "health")
            run_health_checks
            ;;
        "setup")
            check_prerequisites
            validate_environment
            setup_database
            install_dependencies
            run_migrations
            log_success "Setup completed! Run 'scripts/local-dev.sh start' to start the development environment."
            ;;
        "clean")
            cleanup_ports
            log_success "Ports cleaned up"
            ;;
        "logs")
            echo "📝 Showing logs..."
            echo ""
            echo "=== Backend Logs ==="
            tail -n 50 $LOG_DIR/backend.log 2>/dev/null || echo "No backend logs found"
            echo ""
            echo "=== Frontend Logs ==="
            tail -n 50 $LOG_DIR/frontend.log 2>/dev/null || echo "No frontend logs found"
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  start   - Start the full development environment (default)"
            echo "  setup   - Setup environment and dependencies only"
            echo "  health  - Run health checks on running services"
            echo "  clean   - Clean up ports and processes"
            echo "  logs    - Show recent logs from both services"
            echo "  help    - Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 start    # Start everything"
            echo "  $0 setup    # Setup only, don't start services"
            echo "  $0 health   # Check if services are running"
            ;;
        *)
            log_error "Unknown command: $1"
            echo "Run '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 