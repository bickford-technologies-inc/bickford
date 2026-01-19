#!/usr/bin/env bash
# Operational Guards - Automated Validation and Self-Correction
# TIMESTAMP: 2026-01-19T23:13:00Z
#
# Fully automated CI/CD operational guards that validate, correct, and enforce
# execution lifecycle from validation to runtime.

set -euo pipefail

GUARD_NAME="operational-guards"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

log_info() {
  echo "[${GUARD_NAME}] [INFO] ${TIMESTAMP}: $*"
}

log_warn() {
  echo "[${GUARD_NAME}] [WARN] ${TIMESTAMP}: $*" >&2
}

log_error() {
  echo "[${GUARD_NAME}] [ERROR] ${TIMESTAMP}: $*" >&2
}

log_success() {
  echo "[${GUARD_NAME}] [SUCCESS] ${TIMESTAMP}: $*"
}

# Guard 1: Node version validation and auto-correction
guard_node_version() {
  log_info "Validating Node.js version..."
  
  REQUIRED_VERSION="20"
  CURRENT_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  
  if [ "$CURRENT_VERSION" != "$REQUIRED_VERSION" ]; then
    log_warn "Node.js version mismatch: required=${REQUIRED_VERSION}, current=${CURRENT_VERSION}"
    
    # Auto-correction attempt
    if command -v nvm &> /dev/null; then
      log_info "Attempting auto-correction with nvm..."
      nvm use "$REQUIRED_VERSION" || {
        log_error "Failed to switch to Node ${REQUIRED_VERSION}"
        return 1
      }
      log_success "Auto-corrected Node.js version to ${REQUIRED_VERSION}"
    else
      log_error "nvm not available for auto-correction"
      return 1
    fi
  else
    log_success "Node.js version validated: ${CURRENT_VERSION}"
  fi
  
  return 0
}

# Guard 2: Dependency integrity validation
guard_dependencies() {
  log_info "Validating dependency integrity..."
  
  if [ ! -d "node_modules" ]; then
    log_warn "node_modules not found, auto-installing..."
    npm ci --quiet || npm install --quiet || {
      log_error "Failed to install dependencies"
      return 1
    }
    log_success "Auto-installed dependencies"
  else
    # Check if package.json is newer than node_modules
    if [ "package.json" -nt "node_modules" ]; then
      log_warn "package.json modified, refreshing dependencies..."
      npm ci --quiet || npm install --quiet || {
        log_error "Failed to refresh dependencies"
        return 1
      }
      log_success "Refreshed dependencies"
    else
      log_success "Dependencies validated"
    fi
  fi
  
  return 0
}

# Guard 3: TypeScript compilation validation
guard_typescript() {
  log_info "Validating TypeScript compilation..."
  
  # Check if we can compile without errors
  if ! npm run typecheck --silent 2>&1 | grep -q "error TS"; then
    log_success "TypeScript compilation validated"
    return 0
  else
    log_error "TypeScript compilation errors detected"
    
    # Attempt auto-correction of common issues
    log_info "Attempting auto-correction..."
    
    # Clean and rebuild
    rm -rf dist/ .tsbuildinfo 2>/dev/null || true
    
    # Try again
    if npm run typecheck --silent 2>&1 | grep -q "error TS"; then
      log_error "Auto-correction failed, manual intervention required"
      return 1
    else
      log_success "Auto-corrected TypeScript errors"
      return 0
    fi
  fi
}

# Guard 4: Environment variables validation
guard_environment() {
  log_info "Validating environment configuration..."
  
  REQUIRED_ENVS=()
  OPTIONAL_ENVS=("OPENAI_API_KEY" "DATABASE_URL" "REDIS_URL")
  
  # Check required (none for now, all optional)
  for env in "${REQUIRED_ENVS[@]}"; do
    if [ -z "${!env:-}" ]; then
      log_error "Required environment variable missing: ${env}"
      return 1
    fi
  done
  
  # Check and warn about optional
  for env in "${OPTIONAL_ENVS[@]}"; do
    if [ -z "${!env:-}" ]; then
      log_warn "Optional environment variable not set: ${env}"
    fi
  done
  
  log_success "Environment configuration validated"
  return 0
}

# Guard 5: Canon invariants validation
guard_canon_invariants() {
  log_info "Validating Canon invariants..."
  
  # Check if canonical enforcement scripts exist
  if [ -f "scripts/assert-declared-deps.mjs" ]; then
    if ! node scripts/assert-declared-deps.mjs >/dev/null 2>&1; then
      log_error "Canon dependency invariants violated"
      return 1
    fi
  fi
  
  if [ -f "scripts/require-optr-exports.mjs" ]; then
    if ! node scripts/require-optr-exports.mjs >/dev/null 2>&1; then
      log_error "Canon OPTR exports invariants violated"
      return 1
    fi
  fi
  
  log_success "Canon invariants validated"
  return 0
}

# Guard 6: Build cache health
guard_build_cache() {
  log_info "Validating build cache health..."
  
  # Check for stale build artifacts
  STALE_THRESHOLD_DAYS=7
  STALE_COUNT=0
  
  if [ -d "dist" ]; then
    STALE_COUNT=$(find dist -type f -mtime +${STALE_THRESHOLD_DAYS} 2>/dev/null | wc -l)
  fi
  
  if [ "$STALE_COUNT" -gt 0 ]; then
    log_warn "Found ${STALE_COUNT} stale build artifacts, cleaning..."
    rm -rf dist/ .tsbuildinfo packages/*/dist/ packages/*/.tsbuildinfo 2>/dev/null || true
    log_success "Cleaned stale build cache"
  else
    log_success "Build cache healthy"
  fi
  
  return 0
}

# Guard 7: Git state validation
guard_git_state() {
  log_info "Validating git state..."
  
  # Check for merge conflicts
  if git diff --check 2>&1 | grep -q "conflict"; then
    log_error "Merge conflicts detected"
    return 1
  fi
  
  # Check for untracked large files
  LARGE_FILES=$(git ls-files --others --exclude-standard | xargs -I{} du -sk {} 2>/dev/null | awk '$1 > 10240 {print $2}' || true)
  
  if [ -n "$LARGE_FILES" ]; then
    log_warn "Large untracked files detected:"
    echo "$LARGE_FILES"
  fi
  
  log_success "Git state validated"
  return 0
}

# Guard 8: Runtime integrity check
guard_runtime_integrity() {
  log_info "Validating runtime integrity..."
  
  # Check critical files exist
  CRITICAL_FILES=(
    "package.json"
    "tsconfig.json"
  )
  
  for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
      log_error "Critical file missing: ${file}"
      return 1
    fi
  done
  
  # Validate package.json structure
  if ! node -e "require('./package.json')" 2>/dev/null; then
    log_error "package.json is malformed"
    return 1
  fi
  
  log_success "Runtime integrity validated"
  return 0
}

# Main execution
main() {
  log_info "Starting operational guards validation..."
  
  FAILED_GUARDS=()
  
  # Run all guards
  guard_node_version || FAILED_GUARDS+=("node-version")
  guard_dependencies || FAILED_GUARDS+=("dependencies")
  guard_typescript || FAILED_GUARDS+=("typescript")
  guard_environment || FAILED_GUARDS+=("environment")
  guard_canon_invariants || FAILED_GUARDS+=("canon-invariants")
  guard_build_cache || FAILED_GUARDS+=("build-cache")
  guard_git_state || FAILED_GUARDS+=("git-state")
  guard_runtime_integrity || FAILED_GUARDS+=("runtime-integrity")
  
  # Report results
  if [ ${#FAILED_GUARDS[@]} -eq 0 ]; then
    log_success "All operational guards passed ✓"
    exit 0
  else
    log_error "Failed guards: ${FAILED_GUARDS[*]}"
    log_error "Operational guards validation failed ✗"
    exit 1
  fi
}

# Run guards
main "$@"
