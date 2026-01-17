#!/usr/bin/env bash
set -euo pipefail

echo "🔍 TOOLCHAIN AUTHORITY CHECK"

NODE_VERSION=$(node -v)
echo "Node: $NODE_VERSION"

if [[ "$NODE_VERSION" != v20* ]]; then
  echo "❌ Node version drift detected (expected 20.x)"
  exit 1
fi

if command -v pnpm >/dev/null 2>&1; then
  PNPM_VERSION=$(pnpm -v)
  echo "pnpm: $PNPM_VERSION"

  if [[ "$PNPM_VERSION" != 10.* ]]; then
    echo "❌ pnpm version drift detected (expected 10.x)"
    exit 1
  fi
else
  echo "❌ pnpm not found"
  exit 1
fi

echo "✅ Toolchain authority satisfied"

echo "✅ Toolchain verified"
