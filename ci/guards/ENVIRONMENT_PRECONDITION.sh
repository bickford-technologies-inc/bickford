#!/usr/bin/env bash
set -euo pipefail

echo "🔒 ENVIRONMENT PRECONDITION CHECK"

REQUIRED_NODE_MAJOR=20
NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)

if [ "$NODE_MAJOR" -lt "$REQUIRED_NODE_MAJOR" ]; then
  echo "❌ Node.js >= $REQUIRED_NODE_MAJOR required. Found $(node -v)"
  exit 1
fi

if ! command -v corepack >/dev/null 2>&1; then
  echo "❌ corepack not available"
  exit 1
fi

echo "✅ Environment preconditions satisfied"
