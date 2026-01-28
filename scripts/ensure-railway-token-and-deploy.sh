#!/bin/bash
# Usage: ./scripts/ensure-railway-token-and-deploy.sh [railway_token]
# Ensures RAILWAY_TOKEN is set, loads it from .env or Railway CLI config if needed,
# validates token type, and deploys to Railway.

set -e

TOKEN="${1:-}"

is_github_token() {
  case "$1" in
    ghp_*|github_pat_*|gho_*|ghs_*|ghu_*)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

load_token_from_env_file() {
  if [ -f .env ]; then
    awk -F= '/^RAILWAY_TOKEN=/ {print $2; exit}' .env
  fi
}

load_token_from_railway_cli() {
  local config_paths=(
    "${XDG_CONFIG_HOME:-$HOME/.config}/railway/config.json"
    "$HOME/.railway/config.json"
  )
  local path
  for path in "${config_paths[@]}"; do
    if [ -f "$path" ] && command -v node >/dev/null 2>&1; then
      local token
      token="$(RAILWAY_CONFIG_PATH="$path" node -e \
        "const fs=require('fs');const p=process.env.RAILWAY_CONFIG_PATH;const data=JSON.parse(fs.readFileSync(p,'utf8'));console.log((data?.user?.token)||(data?.token)||'');" \
        2>/dev/null | head -n 1)"
      if [ -n "$token" ]; then
        echo "$token"
        return 0
      fi
    fi
  done
  return 1
}

resolve_token() {
  if [ -n "$TOKEN" ]; then
    echo "$TOKEN"
    return 0
  fi

  local env_token
  env_token="$(load_token_from_env_file)"
  if [ -n "$env_token" ]; then
    echo "$env_token"
    return 0
  fi

  local cli_token
  if cli_token="$(load_token_from_railway_cli)"; then
    echo "$cli_token"
    return 0
  fi

  return 1
}

TOKEN="$(resolve_token)"


if [ -z "$TOKEN" ]; then
  echo "RAILWAY_TOKEN not set."
  echo "Generate a Railway token at: https://railway.app/account/tokens"
  echo "Then re-run: $0 <your_railway_token>"
  exit 1
fi

if is_github_token "$TOKEN"; then
  echo "Invalid token detected: looks like a GitHub token."
  echo "Railway CLI requires a Railway API token."
  echo "Generate one at: https://railway.app/account/tokens"
  exit 1
fi

# 1. Write .env if not present or update token
if [ ! -f .env ]; then
  echo "RAILWAY_TOKEN=$TOKEN" > .env
else
  grep -q '^RAILWAY_TOKEN=' .env && \
    sed -i "s/^RAILWAY_TOKEN=.*/RAILWAY_TOKEN=$TOKEN/" .env || \
    echo "RAILWAY_TOKEN=$TOKEN" >> .env
fi

# 2. Add .env to .gitignore if not already present
if ! grep -q '^.env$' .gitignore 2>/dev/null; then
  echo ".env" >> .gitignore
fi

# 3. Export token for this session
export $(grep -v '^#' .env | xargs)

# 4. Confirm token is set
if [ -z "$RAILWAY_TOKEN" ]; then
  echo "RAILWAY_TOKEN not set. Aborting."
  exit 1
fi

echo "RAILWAY_TOKEN is set. Deploying to Railway..."

# 5. Run deployment
bun run scripts/deploy-to-railway.ts
