#!/bin/bash

# Master Development Script for finarro
# Unified interface to all development tools

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

# Show development menu
show_menu() {
    echo "🚀 finarro Development Tools"
    echo "==========================="
    echo ""
    echo "Quick Start:"
    echo "  check     - Check environment setup"
    echo "  start     - Start development environment"
    echo "  test      - Test the application"
    echo "  format    - Format code (Prettier + ESLint)"
    echo ""
    echo "Detailed Commands:"
    echo "  env       - Environment management"
    echo "  local     - Native development"
    echo "  validate  - Test and validation"
    echo ""
    echo "Other:"
    echo "  help      - Show this menu"
    echo "  docs      - Open development documentation"
    echo ""
}

# Main function
main() {
    case "${1:-help}" in
        # Quick start commands
        "check")
            log_info "Checking environment..."
            scripts/env-check.sh
            ;;
        "start")
            log_info "Starting development environment..."
            scripts/local-dev.sh start
            ;;
        "test")
            log_info "Running tests..."
            scripts/test-local.sh ${2:-quick}
            ;;
        "format")
            log_info "🎨 Formatting code..."
            echo ""
            
            # Format frontend
            log_info "Formatting frontend..."
            cd frontend
            npm run format:lint || {
                log_error "Frontend formatting failed"
                exit 1
            }
            cd ..
            
            # Format backend
            log_info "Formatting backend..."
            cd backend
            npm run format:lint || {
                log_error "Backend formatting failed"
                exit 1
            }
            cd ..
            
            log_success "✅ Code formatting completed successfully!"
            ;;
            
        # Detailed commands
        "env")
            shift
            scripts/env-check.sh "$@"
            ;;
        "local")
            shift
            scripts/local-dev.sh "$@"
            ;;
        "validate")
            shift
            scripts/test-local.sh "$@"
            ;;
            
        # Documentation
        "docs")
            if command -v code >/dev/null 2>&1; then
                code README.md
                log_success "Opened documentation in VS Code"
            elif command -v open >/dev/null 2>&1; then
                open README.md
                log_success "Opened documentation"
            else
                log_info "Documentation: README.md"
                echo ""
                head -30 README.md
                echo "..."
                echo ""
                log_info "Full documentation available in README.md"
            fi
            ;;
            
        # Help and menu
        "help"|"-h"|"--help"|"menu")
            show_menu
            ;;
            
        *)
            log_error "Unknown command: $1"
            echo ""
            show_menu
            exit 1
            ;;
    esac
}

# Show menu if no arguments
if [ $# -eq 0 ]; then
    show_menu
    exit 0
fi

# Run main function with all arguments
main "$@" 