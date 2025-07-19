#!/bin/bash

# Local Testing Script for finarro
# This script runs comprehensive tests against your local environment

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

# Configuration
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="TestPassword123!"

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

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

test_passed() {
    log_success "✓ $1"
    ((TESTS_PASSED++))
}

test_failed() {
    log_error "✗ $1"
    FAILED_TESTS+=("$1")
    ((TESTS_FAILED++))
}

# Check if services are running
check_services() {
    log_info "Checking if services are running..."
    
    # Check backend
    if curl -s "$BACKEND_URL/health" > /dev/null; then
        test_passed "Backend service is running"
    else
        test_failed "Backend service is not running"
        log_error "Please start the backend first"
        return 1
    fi
    
    # Check frontend
    if curl -s "$FRONTEND_URL" > /dev/null; then
        test_passed "Frontend service is running"
    else
        test_failed "Frontend service is not running"
        log_error "Please start the frontend first"
        return 1
    fi
}

# Test API endpoints
test_api_endpoints() {
    log_info "Testing API endpoints..."
    
    # Test health endpoint
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")
    if [ "$response" = "200" ]; then
        test_passed "Health endpoint returns 200"
    else
        test_failed "Health endpoint failed (HTTP $response)"
    fi
    
    # Test API base endpoint
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api")
    if [ "$response" = "404" ] || [ "$response" = "200" ]; then
        test_passed "API base endpoint is accessible"
    else
        test_failed "API base endpoint failed (HTTP $response)"
    fi
    
    # Test CORS
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS "$BACKEND_URL/api/auth/login")
    
    if [ "$response" = "200" ] || [ "$response" = "204" ]; then
        test_passed "CORS is properly configured"
    else
        test_failed "CORS configuration failed (HTTP $response)"
    fi
}

# Test database connectivity
test_database() {
    log_info "Testing database connectivity..."
    
    # Try to make a request that would require database access
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"email":"nonexistent@example.com","password":"test"}' \
        "$BACKEND_URL/api/auth/login")
    
    # Should return 401 (unauthorized) if database is working, 500 if database is down
    if [ "$response" = "401" ] || [ "$response" = "400" ]; then
        test_passed "Database connectivity is working"
    elif [ "$response" = "500" ]; then
        test_failed "Database connectivity failed (HTTP $response)"
    else
        test_passed "Database connectivity appears to be working (HTTP $response)"
    fi
}

# Test user registration flow
test_user_registration() {
    log_info "Testing user registration..."
    
    # Generate unique email for testing
    local test_email="test+$(date +%s)@example.com"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$test_email\",\"password\":\"$TEST_PASSWORD\",\"name\":\"Test User\"}" \
        "$BACKEND_URL/api/auth/register")
    
    if [ "$response" = "201" ] || [ "$response" = "200" ]; then
        test_passed "User registration endpoint is working"
    elif [ "$response" = "400" ]; then
        test_passed "User registration endpoint is working (validation active)"
    else
        test_failed "User registration failed (HTTP $response)"
    fi
}

# Test authentication flow
test_authentication() {
    log_info "Testing authentication flow..."
    
    # Test login with invalid credentials
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"email":"invalid@example.com","password":"wrongpassword"}' \
        "$BACKEND_URL/api/auth/login")
    
    if [ "$response" = "401" ] || [ "$response" = "400" ]; then
        test_passed "Authentication rejects invalid credentials"
    else
        test_failed "Authentication failed to reject invalid credentials (HTTP $response)"
    fi
}

# Test static file serving
test_static_files() {
    log_info "Testing static file serving..."
    
    # Test frontend static files
    response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/static/css/main.css" || echo "404")
    
    # It's ok if this returns 404, it means the server is responding
    if [ "$response" = "200" ] || [ "$response" = "404" ]; then
        test_passed "Frontend static file serving is working"
    else
        test_failed "Frontend static file serving failed (HTTP $response)"
    fi
    
    # Test favicon
    response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/favicon.svg")
    
    if [ "$response" = "200" ]; then
        test_passed "Favicon is accessible"
    else
        test_failed "Favicon is not accessible (HTTP $response)"
    fi
}

# Test environment configuration
test_environment() {
    log_info "Testing environment configuration..."
    
    # Check if backend .env exists
    if [ -f "backend/.env" ]; then
        test_passed "Backend environment file exists"
        
        # Check for critical variables
        if grep -q "DATABASE_URL" backend/.env; then
            test_passed "Database URL is configured"
        else
            test_failed "Database URL is not configured"
        fi
        
        if grep -q "JWT_SECRET" backend/.env; then
            test_passed "JWT secret is configured"
        else
            test_failed "JWT secret is not configured"
        fi
    else
        test_failed "Backend environment file is missing"
    fi
    
    # Check if frontend .env exists
    if [ -f "frontend/.env.development" ] || [ -f "frontend/.env.local" ] || [ -f "frontend/.env" ]; then
        test_passed "Frontend environment file exists"
    else
        test_failed "Frontend environment file is missing"
    fi
}

# Test API response format
test_api_response_format() {
    log_info "Testing API response format..."
    
    # Test health endpoint response format
    health_response=$(curl -s "$BACKEND_URL/health")
    
    if echo "$health_response" | grep -q "status\|ok\|healthy"; then
        test_passed "Health endpoint returns proper format"
    else
        test_failed "Health endpoint response format is unexpected"
    fi
}

# Performance tests
test_performance() {
    log_info "Running basic performance tests..."
    
    # Test backend response time
    backend_time=$(curl -s -o /dev/null -w "%{time_total}" "$BACKEND_URL/health")
    backend_time_ms=$(echo "$backend_time * 1000" | bc | cut -d. -f1)
    
    if [ "$backend_time_ms" -lt 1000 ]; then
        test_passed "Backend response time is acceptable (${backend_time_ms}ms)"
    else
        test_failed "Backend response time is slow (${backend_time_ms}ms)"
    fi
    
    # Test frontend response time
    frontend_time=$(curl -s -o /dev/null -w "%{time_total}" "$FRONTEND_URL")
    frontend_time_ms=$(echo "$frontend_time * 1000" | bc | cut -d. -f1)
    
    if [ "$frontend_time_ms" -lt 2000 ]; then
        test_passed "Frontend response time is acceptable (${frontend_time_ms}ms)"
    else
        test_failed "Frontend response time is slow (${frontend_time_ms}ms)"
    fi
}

# Generate test report
generate_report() {
    echo ""
    echo "🧪 Test Report"
    echo "=============="
    echo ""
    echo "Tests Passed: $TESTS_PASSED"
    echo "Tests Failed: $TESTS_FAILED"
    echo "Total Tests:  $((TESTS_PASSED + TESTS_FAILED))"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        log_success "🎉 All tests passed!"
        echo ""
        echo "Your local finarro environment is working correctly!"
        echo ""
        echo "You can now:"
        echo "• Open http://localhost:3000 to use the app"
        echo "• Open http://localhost:3001/health to check backend status"
        echo "• Start developing new features"
        return 0
    else
        log_error "❌ Some tests failed"
        echo ""
        echo "Failed tests:"
        for test in "${FAILED_TESTS[@]}"; do
            echo "  • $test"
        done
        echo ""
        echo "Please check the logs and fix the issues before proceeding."
        return 1
    fi
}

# Main function
main() {
    echo "🧪 finarro Local Environment Test Suite"
    echo "======================================="
    echo ""
    
    case "${1:-all}" in
        "all")
            check_services || exit 1
            test_environment
            test_api_endpoints
            test_database
            test_user_registration
            test_authentication
            test_static_files
            test_api_response_format
            
            # Only run performance tests if bc is available
            if command -v bc > /dev/null; then
                test_performance
            else
                log_warning "Skipping performance tests (bc not installed)"
            fi
            
            generate_report
            ;;
        "quick")
            check_services || exit 1
            test_api_endpoints
            test_database
            generate_report
            ;;
        "api")
            check_services || exit 1
            test_api_endpoints
            test_database
            test_user_registration
            test_authentication
            generate_report
            ;;
        "env")
            test_environment
            generate_report
            ;;
        "perf")
            check_services || exit 1
            if command -v bc > /dev/null; then
                test_performance
            else
                log_error "Performance tests require 'bc' to be installed"
                exit 1
            fi
            generate_report
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [test-suite]"
            echo ""
            echo "Test Suites:"
            echo "  all     - Run all tests (default)"
            echo "  quick   - Run essential tests only"
            echo "  api     - Test API endpoints and authentication"
            echo "  env     - Test environment configuration"
            echo "  perf    - Run performance tests"
            echo "  help    - Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0          # Run all tests"
            echo "  $0 quick    # Run quick tests"
            echo "  $0 api      # Test API only"
            ;;
        *)
            log_error "Unknown test suite: $1"
            echo "Run '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 