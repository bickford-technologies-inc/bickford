#!/usr/bin/env bash
set -euo pipefail

NODE_VERSION=$(node -v)
PNPM_VERSION=$(pnpm -v)

echo "Node version: $NODE_VERSION"
echo "pnpm version: $PNPM_VERSION"

if [[ "$NODE_VERSION" != v20* ]]; then
  echo "❌ Node version drift detected. Expected Node 20.x"
  exit 1
fi

if [[ "$PNPM_VERSION" != 9.* ]]; then
  echo "❌ pnpm version drift detected. Expected pnpm 9.x"
  exit 1
fi

echo "✅ Toolchain verified"
