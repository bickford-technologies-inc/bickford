#!/usr/bin/env bash
set -euo pipefail

echo "🔒 LOCKFILE INVARIANT — frozen install must succeed"

pnpm install --frozen-lockfile --ignore-scripts

echo "✅ Lockfile invariant satisfied"
