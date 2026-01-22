#!/usr/bin/env bash
set -euo pipefail

echo "🔒 Enforcing toolchain (Node + pnpm)"

corepack enable
corepack prepare pnpm@10.28.0 --activate

echo "Using Node: $(node -v)"
echo "Using pnpm: $(pnpm -v)"

pnpm install --frozen-lockfile
