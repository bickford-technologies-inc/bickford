#!/usr/bin/env bash
# Auto-build and manage web-ui for all common tasks
# Usage: bash scripts/auto-build-all.sh

set -e
cd "$(dirname "$0")/.."

# Run all key build management tasks in sequence
echo "[web-ui] Linting..."
pnpm lint

echo "[web-ui] Building production bundle..."
pnpm build

echo "[web-ui] Starting production server (background)..."
pnpm start &
START_PID=$!

# Wait a few seconds to ensure server starts
sleep 5

echo "[web-ui] Running in production mode. To stop: kill $START_PID"
echo "[web-ui] All automated build steps complete."
