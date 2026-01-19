#!/usr/bin/env bash
set -e

echo "🚀 Spawning canonical agent"

node scripts/enforce-pnpm.mjs
node scripts/require-tsc.mjs

pnpm install
pnpm preflight

echo "✅ Agent spawned with canonical guarantees"
