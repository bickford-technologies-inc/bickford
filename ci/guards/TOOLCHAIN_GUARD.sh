#!/usr/bin/env bash
set -euo pipefail

NODE_VERSION=$(node -v)
PNPM_VERSION=$(pnpm -v)

echo "Node version: $NODE_VERSION"
echo "pnpm version: $PNPM_VERSION"

#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Verifying Bickford toolchain authority"

NODE_VERSION=$(node -v)
echo "Node: $NODE_VERSION"

if [[ "$NODE_VERSION" != v20* ]]; then
  echo "❌ Node version drift detected (expected 20.x)"
  exit 1
fi

if command -v pnpm >/dev/null 2>&1; then
  PNPM_VERSION=$(pnpm -v)
  echo "pnpm: $PNPM_VERSION"

  if [[ "$PNPM_VERSION" != 9.* ]]; then
    echo "⚠️ pnpm version drift (expected 9.x)"
  fi
else
  echo "ℹ️ pnpm not present (acceptable during Vercel install phase)"
fi

echo "✅ Toolchain verified"

if [[ "$PNPM_VERSION" != 9.* ]]; then
  echo "❌ pnpm version drift detected. Expected pnpm 9.x"
  exit 1
fi

echo "✅ Toolchain verified"
