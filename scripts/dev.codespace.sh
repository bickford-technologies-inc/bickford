#!/usr/bin/env bash
set -e

echo "[Bickford] Codespace dev mode"

# Skip docker-compose
echo "[Bickford] Skipping docker-compose (not available)"

# Skip prisma if no schema
if [ -f prisma/schema.prisma ]; then
  npx prisma generate
else
  echo "[Bickford] No prisma schema — skipping generate"
fi

# Start the app directly
pnpm run dev:app || pnpm run start:app || pnpm run dev:web || pnpm run dev || true
