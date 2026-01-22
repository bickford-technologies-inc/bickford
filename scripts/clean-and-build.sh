#!/usr/bin/env bash
set -euo pipefail

echo "🧹 Bickford full artifact clean starting..."

# Root-level artifacts
rm -rf \
  dist \
  .next \
  .turbo \
  node_modules/.cache \
  **/*.tsbuildinfo

# Workspace-level artifacts
find . -type d \( \
  -name dist \
  -o -name .next \
  -o -name .turbo \
  -o -name build \
  -o -name out \
  -o -name .expo \
\) -prune -exec rm -rf {} +

# Prisma generated clients (safety)
find . -type d -path "*/node_modules/.prisma" -prune -exec rm -rf {} +

echo "✅ Artifact clean complete"

echo "📦 Reinstalling dependencies (locked)"
bash ci/guards/ENVIRONMENT_PRECONDITION.sh && corepack enable && corepack prepare pnpm@10.28.0 --activate && pnpm install --frozen-lockfile

echo "🔁 Generating Prisma clients (authoritative schema)"
pnpm prisma generate

echo "🏗️ Running full build"
pnpm run build

echo "🎉 Clean build complete"
