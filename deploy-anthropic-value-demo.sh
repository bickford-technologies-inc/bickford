#!/bin/bash
# Bickford → Anthropic Value Demo Deployment Script
# Deterministic, auditable, and ready for CI/CD or manual execution
#
# Deploys all Anthropic-facing demos and compliance artifact generators
# and verifies build, test, and deployment status.
#
# Usage: ./deploy-anthropic-value-demo.sh
#
# Requirements:
#   - Bun installed
#
# Steps:
#   1. Install dependencies
#   2. Run and verify all Anthropic-facing demos
#   3. Output deployment status and demo endpoints

set -euo pipefail

# 0. Validate required environment variables
echo "[0/3] Checking required environment variables..."

if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
    echo "ERROR: ANTHROPIC_API_KEY is not set."
    echo ""
    echo "Please set the environment variable before running:"
    echo "  export ANTHROPIC_API_KEY=\"your-api-key-here\""
    echo ""
    echo "Or run with inline variables:"
    echo "  ANTHROPIC_API_KEY=\"your-key\" ./deploy-anthropic-value-demo.sh"
    exit 1
fi

if [[ -z "${ANTHROPIC_ORG_ID:-}" ]]; then
    echo "WARNING: ANTHROPIC_ORG_ID is not set."
    echo "  Some API calls may fail if your key requires an organization ID."
    echo "  Set with: export ANTHROPIC_ORG_ID=\"your-org-id\""
    echo ""
fi

echo "  ANTHROPIC_API_KEY: set (${#ANTHROPIC_API_KEY} chars)"
echo "  ANTHROPIC_ORG_ID: ${ANTHROPIC_ORG_ID:-not set}"
echo ""

# 1. Install dependencies
echo "[1/3] Installing dependencies (bun install)..."
bun install

echo "[2/3] Running Anthropic-facing demos and compliance artifact generators..."

# Claude comparison demo
echo "\n--- Claude Comparison Demo ---"
bun run bickford-intelligence/packages/demo/claude-comparison.ts || { echo "Claude comparison demo failed"; exit 1; }

# Compliance artifact generator
echo "\n--- Compliance Artifact Generator ---"
bun run bickford-intelligence/packages/demo/compliance-demo.ts || { echo "Compliance artifact generator failed"; exit 1; }

# Regulator verification demo
echo "\n--- Regulator Verification Demo ---"
bun run bickford-intelligence/packages/demo/regulator-demo.ts || { echo "Regulator verification demo failed"; exit 1; }

echo "[3/3] Deployment complete."
echo "If public endpoints are enabled, share with Anthropic for review."

# Pre-flight runner token validation (multi-system, optional)
if [[ -n "$RUNNER_TOKEN" && -n "$RUNNER_REPO" && -n "$RUNNER_OWNER" && -n "$RUNNER_SYSTEM" ]]; then
    echo "[INFO] Running pre-flight runner token validation (multi-system)..."
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if "$SCRIPT_DIR/../runner-preflight-check-generic.sh" "$RUNNER_SYSTEM" "$RUNNER_OWNER" "$RUNNER_REPO" "$RUNNER_TOKEN"; then
        echo "[INFO] Runner token validated for $RUNNER_SYSTEM. Proceeding."
    else
        echo "[ERROR] Runner token invalid or expired for $RUNNER_SYSTEM. Aborting."
        exit 2
    fi
fi

exit 0
