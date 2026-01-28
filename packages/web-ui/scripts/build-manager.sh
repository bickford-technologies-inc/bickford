#!/usr/bin/env bash
# Automated build management for web-ui
# Usage: bash scripts/build-manager.sh [dev|build|start|lint|check]

set -e
cd "$(dirname "$0")/.."

CMD=${1:-build}

case $CMD in
  dev)
    echo "[web-ui] Starting development server..."
    pnpm dev
    ;;
  build)
    echo "[web-ui] Building production bundle..."
    pnpm build
    ;;
  start)
    echo "[web-ui] Starting production server..."
    pnpm start
    ;;
  lint)
    echo "[web-ui] Running linter..."
    pnpm lint
    ;;
  check)
    echo "[web-ui] Running lint and build checks..."
    pnpm lint && pnpm build
    ;;
  *)
    echo "Usage: bash scripts/build-manager.sh [dev|build|start|lint|check]"
    exit 1
    ;;
esac
