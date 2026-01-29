#!/usr/bin/env bash

set -euo pipefail

echo "railway-build: node=$(node -v) npm=$(npm -v)"

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

echo "railway-build: build:types"
npm run build:types

echo "railway-build: prisma generate"
npx prisma generate

echo "railway-build: build:web"
npm run build:web
