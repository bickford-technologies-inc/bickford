#!/usr/bin/env bash
set -euo pipefail

LOG_FILE=".vercel-build.log"

{
  echo "=== Vercel Build Start ==="
  bash ci/guards/ENVIRONMENT_PRECONDITION.sh
  corepack enable
  corepack prepare pnpm@9.15.0 --activate
  pnpm install --frozen-lockfile
  pnpm build
} 2>&1 | tee "$LOG_FILE"

STATUS=${PIPESTATUS[0]}

if [ "$STATUS" -ne 0 ]; then
  echo "❌ Build failed. Classifying…"
  node ci/diagnostics/classify-build-log.js "$LOG_FILE"
  cat build-diagnosis.json
  exit "$STATUS"
fi
