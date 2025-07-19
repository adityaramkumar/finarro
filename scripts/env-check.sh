#!/bin/bash

# Environment Check Script for finarro
# This script validates your development environment setup

set -e

# Get the project root directory (parent of scripts directory)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track results
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    ((CHECKS_PASSED++))
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    ((WARNINGS++))
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ((CHECKS_FAILED++))
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js
check_nodejs() {
    log_info "Checking Node.js..."
    
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d 'v' -f 2)
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)
        
        if [ "$MAJOR_VERSION" -ge 18 ]; then
            log_success "✓ Node.js $NODE_VERSION (requirement: 18+)"
        else
            log_error "✗ Node.js $NODE_VERSION is too old (requirement: 18+)"
        fi
    else
        log_error "✗ Node.js is not installed"
    fi
}

# Check npm
check_npm() {
    log_info "Checking npm..."
    
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        log_success "✓ npm $NPM_VERSION"
    else
        log_error "✗ npm is not installed"
    fi
}

# Check PostgreSQL
check_postgresql() {
    log_info "Checking PostgreSQL..."
    
    if command_exists psql; then
        PSQL_VERSION=$(psql --version | awk '{print $3}' | head -n1)
        log_success "✓ PostgreSQL $PSQL_VERSION"
        
        # Check if PostgreSQL is running
        if pg_isready >/dev/null 2>&1; then
            log_success "✓ PostgreSQL server is running"
        else
            log_warning "⚠ PostgreSQL server is not running"
        fi
    else
        log_error "✗ PostgreSQL is not installed"
    fi
}



# Check Git
check_git() {
    log_info "Checking Git..."
    
    if command_exists git; then
        GIT_VERSION=$(git --version | awk '{print $3}')
        log_success "✓ Git $GIT_VERSION"
    else
        log_error "✗ Git is not installed"
    fi
}

# Check curl
check_curl() {
    log_info "Checking curl..."
    
    if command_exists curl; then
        CURL_VERSION=$(curl --version | head -n1 | awk '{print $2}')
        log_success "✓ curl $CURL_VERSION"
    else
        log_error "✗ curl is not installed (needed for testing)"
    fi
}

# Check environment files
check_environment_files() {
    log_info "Checking environment files..."
    
    # Backend .env
    if [ -f "backend/.env" ]; then
        log_success "✓ Backend environment file exists"
        
        # Check critical variables
        if grep -q "DATABASE_URL" backend/.env && [ "$(grep "DATABASE_URL" backend/.env | cut -d'=' -f2)" != "your_database_url_here" ]; then
            log_success "✓ Database URL is configured"
        else
            log_warning "⚠ Database URL needs to be configured in backend/.env"
        fi
        
        if grep -q "JWT_SECRET" backend/.env && [ "$(grep "JWT_SECRET" backend/.env | cut -d'=' -f2)" != "your_jwt_secret_here_64_character_string_change_this_in_production" ]; then
            log_success "✓ JWT secret is configured"
        else
            log_warning "⚠ JWT secret should be changed from default in backend/.env"
        fi
        
        # Check optional but recommended variables
        if grep -q "GEMINI_API_KEY" backend/.env && [ "$(grep "GEMINI_API_KEY" backend/.env | cut -d'=' -f2)" != "your_gemini_api_key_here" ]; then
            log_success "✓ Gemini API key is configured"
        else
            log_warning "⚠ Gemini API key not configured (AI features will be limited)"
        fi
        
        if grep -q "PLAID_CLIENT_ID" backend/.env && [ "$(grep "PLAID_CLIENT_ID" backend/.env | cut -d'=' -f2)" != "your_plaid_client_id" ]; then
            log_success "✓ Plaid credentials are configured"
        else
            log_warning "⚠ Plaid credentials not configured (financial data features will be limited)"
        fi
        
        if grep -q "STRIPE_SECRET_KEY" backend/.env && [ "$(grep "STRIPE_SECRET_KEY" backend/.env | cut -d'=' -f2)" != "sk_test_your_stripe_secret_key" ]; then
            log_success "✓ Stripe credentials are configured"
        else
            log_warning "⚠ Stripe credentials not configured (payment features will be limited)"
        fi
        
    else
        log_error "✗ Backend environment file (backend/.env) is missing"
        log_info "   Run: scripts/local-dev.sh setup"
    fi
    
    # Frontend .env
    if [ -f "frontend/.env.development" ] || [ -f "frontend/.env.local" ] || [ -f "frontend/.env" ]; then
        log_success "✓ Frontend environment file exists"
        
        # Check for API URL configuration
        env_file=""
        if [ -f "frontend/.env.development" ]; then
            env_file="frontend/.env.development"
        elif [ -f "frontend/.env.local" ]; then
            env_file="frontend/.env.local"
        elif [ -f "frontend/.env" ]; then
            env_file="frontend/.env"
        fi
        
        if [ -n "$env_file" ]; then
            if grep -q "REACT_APP_API_URL" "$env_file"; then
                log_success "✓ Frontend API URL is configured"
            else
                log_warning "⚠ Frontend API URL should be configured"
            fi
        fi
    else
        log_error "✗ Frontend environment file is missing"
        log_info "   Run: scripts/local-dev.sh setup"
    fi
}

# Check dependencies
check_dependencies() {
    log_info "Checking project dependencies..."
    
    # Root dependencies
    if [ -f "package.json" ]; then
        if [ -d "node_modules" ]; then
            log_success "✓ Root dependencies are installed"
        else
            log_warning "⚠ Root dependencies need to be installed (run: npm install)"
        fi
    fi
    
    # Backend dependencies
    if [ -f "backend/package.json" ]; then
        if [ -d "backend/node_modules" ]; then
            log_success "✓ Backend dependencies are installed"
        else
            log_warning "⚠ Backend dependencies need to be installed (run: cd backend && npm install)"
        fi
    fi
    
    # Frontend dependencies
    if [ -f "frontend/package.json" ]; then
        if [ -d "frontend/node_modules" ]; then
            log_success "✓ Frontend dependencies are installed"
        else
            log_warning "⚠ Frontend dependencies need to be installed (run: cd frontend && npm install)"
        fi
    fi
}

# Check database
check_database() {
    log_info "Checking database..."
    
    if command_exists psql; then
        # Check if finarro_dev database exists
        if psql -lqt | cut -d \| -f 1 | grep -qw finarro_dev; then
            log_success "✓ Development database 'finarro_dev' exists"
        else
            log_warning "⚠ Development database 'finarro_dev' does not exist"
            log_info "   Run: createdb finarro_dev"
        fi
    fi
}

# Check ports
check_ports() {
    log_info "Checking port availability..."
    
    # Check if ports are available
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
        log_warning "⚠ Port 3000 is in use (frontend port)"
    else
        log_success "✓ Port 3000 is available (frontend)"
    fi
    
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
        log_warning "⚠ Port 3001 is in use (backend port)"
    else
        log_success "✓ Port 3001 is available (backend)"
    fi
    
    if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null ; then
        log_success "✓ Port 5432 is in use (PostgreSQL running)"
    else
        log_warning "⚠ Port 5432 is not in use (PostgreSQL may not be running)"
    fi
}

# Generate environment report
generate_report() {
    echo ""
    echo "🔍 Environment Check Report"
    echo "=========================="
    echo ""
    echo "Checks Passed: $CHECKS_PASSED"
    echo "Checks Failed: $CHECKS_FAILED"
    echo "Warnings:      $WARNINGS"
    echo ""
    
    if [ $CHECKS_FAILED -eq 0 ]; then
        if [ $WARNINGS -eq 0 ]; then
            log_success "🎉 Perfect! Your environment is fully configured!"
            echo ""
            echo "You can now:"
            echo "• Run 'scripts/local-dev.sh start' to start the application"
            echo "• Run 'scripts/test-local.sh' to validate your setup"
        else
            log_success "✅ Your environment is ready for development!"
            echo ""
            echo "Note: Some optional features have warnings, but basic functionality will work."
            echo ""
            echo "Next steps:"
            echo "• Run 'scripts/local-dev.sh start' to start the application"
            echo "• Configure API keys for full functionality"
        fi
    else
        log_error "❌ Your environment has issues that need to be resolved"
        echo ""
        echo "Please fix the errors above before proceeding."
        echo ""
        echo "Common fixes:"
        echo "• Install missing software (Node.js, PostgreSQL, etc.)"
        echo "• Run 'scripts/local-dev.sh setup' to create environment files"
        echo "• Run 'npm install' in root, backend, and frontend directories"
        return 1
    fi
}

# Fix common issues
fix_issues() {
    log_info "Attempting to fix common issues..."
    
    # Create environment files if missing
    if [ ! -f "backend/.env" ] || [ ! -f "frontend/.env.development" ]; then
        log_info "Creating missing environment files..."
        scripts/local-dev.sh setup
    fi
    
    # Install dependencies if missing
    if [ ! -d "node_modules" ]; then
        log_info "Installing root dependencies..."
        npm install
    fi
    
    if [ ! -d "backend/node_modules" ]; then
        log_info "Installing backend dependencies..."
        cd backend && npm install && cd ..
    fi
    
    if [ ! -d "frontend/node_modules" ]; then
        log_info "Installing frontend dependencies..."
        cd frontend && npm install && cd ..
    fi
    
    # Create database if missing
    if command_exists psql && ! psql -lqt | cut -d \| -f 1 | grep -qw finarro_dev; then
        log_info "Creating development database..."
        createdb finarro_dev || log_warning "Failed to create database automatically"
    fi
    
    log_success "Common issues fixed! Run the check again."
}

# Main function
main() {
    echo "🔍 finarro Environment Check"
    echo "==========================="
    echo ""
    
    case "${1:-check}" in
        "check")
            check_nodejs
            check_npm
            check_postgresql
            check_git
            check_curl
            echo ""
            check_environment_files
            check_dependencies
            check_database
            check_ports
            generate_report
            ;;
        "fix")
            fix_issues
            ;;
        "quick")
            check_nodejs
            check_npm
            check_postgresql
            check_environment_files
            generate_report
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  check   - Run full environment check (default)"
            echo "  quick   - Run essential checks only"
            echo "  fix     - Attempt to fix common issues automatically"
            echo "  help    - Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0        # Run full check"
            echo "  $0 quick  # Run quick check"
            echo "  $0 fix    # Fix common issues"
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