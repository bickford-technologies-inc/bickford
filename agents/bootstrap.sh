#!/usr/bin/env bash
set -e

echo "🔒 Agent bootstrap starting"

node scripts/enforce-pnpm.mjs
node scripts/require-tsc.mjs
pnpm install
pnpm preflight

echo "✅ Agent ready"
