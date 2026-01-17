#!/usr/bin/env bash
set -euo pipefail

echo "🔒 WORKSPACE_EXEC_001 — enforcing admissible world"

# --- Node engine enforcement ---
REQUIRED=$(node -p "require('./package.json').engines.node")
CURRENT=$(node -v)

if [[ ! "$CURRENT" =~ ${REQUIRED/x/} ]]; then
  echo "❌ Node engine violation"
  echo "   Required: $REQUIRED"
  echo "   Current:  $CURRENT"
  exit 1
fi

# --- Hard cold install ---
export PNPM_STORE_PATH=$(mktemp -d)
export PNPM_DISABLE_SELF_UPDATE_CHECK=1
export CI=1

bash ci/guards/ENVIRONMENT_PRECONDITION.sh && corepack enable && corepack prepare pnpm@9.15.0 --activate && pnpm install --frozen-lockfile --ignore-scripts --prefer-offline=false --strict-peer-dependencies

echo "✅ WORKSPACE_EXEC_001 satisfied — world is admissible"
