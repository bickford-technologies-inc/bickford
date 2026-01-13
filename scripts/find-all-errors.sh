#!/bin/sh
set -e

echo "🔍 TypeScript (all workspaces)"
npm --workspaces run typecheck || true

echo ""
echo "🔍 Lint (all workspaces)"
npm --workspaces run lint || true

echo ""
echo "🔍 Build (turbo)"
npm run build || true
