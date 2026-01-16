#!/usr/bin/env bash
set -euo pipefail

echo "🔒 BICKFORD ENVIRONMENT PRECONDITION — START"

if [[ -z "${VERCEL_PROJECT_DIR:-}" ]]; then
  echo "❌ VERCEL_PROJECT_DIR is not set"
  echo "Execution root must be explicit. Refusing to continue."
  exit 1
fi

if [[ ! -d "$VERCEL_PROJECT_DIR" ]]; then
  echo "❌ Declared VERCEL_PROJECT_DIR does not exist: $VERCEL_PROJECT_DIR"
  exit 1
fi

if [[ ! -f "$VERCEL_PROJECT_DIR/pnpm-lock.yaml" ]]; then
  echo "❌ pnpm-lock.yaml missing at workspace root"
  exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node version: $NODE_VERSION"

echo "✅ Workspace root resolved: $VERCEL_PROJECT_DIR"
echo "🔒 ENVIRONMENT PRECONDITION — PASS"
