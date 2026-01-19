#!/usr/bin/env bash
set -e

echo "🔒 Agent bootstrap starting"

node scripts/enforce-pnpm.mjs
node scripts/require-tsc.mjs
pnpm install
pnpm preflight
node scripts/auto-repair.mjs
node scripts/build-pruned.mjs
node agents/run.mjs

echo "✅ Agent ready"
