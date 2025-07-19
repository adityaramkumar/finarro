# Development Scripts Directory

This directory contains all development and testing tools for the finarro project.

## Quick Reference

| Script | Purpose | Example Usage |
|--------|---------|---------------|
| `dev.sh` | Master development tool | `../dev help` |
| `env-check.sh` | Environment validation | `./env-check.sh check` |
| `local-dev.sh` | Native development | `./local-dev.sh start` |
| `test-local.sh` | Testing suite | `./test-local.sh quick` |

## Documentation

- **Complete Guide**: [`../README.md`](../README.md)

## Quick Start

From the project root:
```bash
# Use the master launcher
./dev help          # Show all commands
./dev check         # Validate environment
./dev start         # Start development
./dev test          # Run tests

# Or call scripts directly
scripts/env-check.sh
scripts/local-dev.sh start
scripts/test-local.sh quick
```

 