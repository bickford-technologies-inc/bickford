#!/bin/bash
# Usage: ./scripts/ensure-railway-token-and-deploy.sh <your_railway_token>
# Ensures RAILWAY_TOKEN is set, loads it from .env if needed, and deploys to Railway

set -e

TOKEN="$1"

if [ -z "$TOKEN" ]; then
  echo "Usage: $0 <your_railway_token>"
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
