#!/bin/bash
# Bickford → Anthropic Value Demo Deployment Script
# Deterministic, auditable, and ready for CI/CD or manual execution
#
# Deploys all Anthropic-facing demos and compliance artifact generators to Railway
# and verifies build, test, and deployment status.
#
# Usage: ./deploy-anthropic-value-demo.sh
#
# Requirements:
#   - Bun installed
#   - Railway CLI installed and authenticated
#   - Railway project linked (run `railway link` if not already)
#
# Steps:
#   1. Install dependencies
#   2. Run and verify all Anthropic-facing demos
#   3. Deploy to Railway
#   4. Output deployment status and demo endpoints

set -euo pipefail

# 1. Install dependencies
echo "[1/4] Installing dependencies (bun install)..."
bun install

echo "[2/4] Running Anthropic-facing demos and compliance artifact generators..."

# Claude comparison demo
echo "\n--- Claude Comparison Demo ---"
bun run packages/demo/claude-comparison.ts || { echo "Claude comparison demo failed"; exit 1; }

# Compliance artifact generator
echo "\n--- Compliance Artifact Generator ---"
bun run packages/demo/compliance-demo.ts || { echo "Compliance artifact generator failed"; exit 1; }

# Regulator verification demo
echo "\n--- Regulator Verification Demo ---"
bun run packages/demo/regulator-demo.ts || { echo "Regulator verification demo failed"; exit 1; }

# (Optional) Comprehensive platform demo
echo "\n--- Comprehensive Platform Demo (optional) ---"
bun run demos/comprehensive-platform-demo.ts || echo "(Optional) Comprehensive platform demo failed, continuing..."

echo "[3/4] Deploying to Railway..."
railway up || { echo "Railway deployment failed"; exit 1; }

echo "[4/4] Deployment complete."
echo "Check Railway dashboard for live endpoints and logs."
echo "If public endpoints are enabled, share with Anthropic for review."

exit 0
