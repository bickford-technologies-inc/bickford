#!/bin/bash
# Complete Automated Railway Deployment with Config-as-Code
set -e

PROJECT_ROOT="/workspaces/bickford"
SERVICE_NAME="@bickford/web-app"

cd "$PROJECT_ROOT"

# Step 1: Setup Railway Config
if [ ! -f "railway.toml" ]; then
  echo "[build]" > railway.toml
  echo "builder = \"nixpacks\"" >> railway.toml
  echo "buildCommand = \"pnpm install && pnpm build\"" >> railway.toml
  echo "" >> railway.toml
  echo "[deploy]" >> railway.toml
  echo "startCommand = \"pnpm start\"" >> railway.toml
  echo "healthcheckPath = \"/\"" >> railway.toml
  echo "healthcheckTimeout = 100" >> railway.toml
  echo "restartPolicyType = \"always\"" >> railway.toml
  echo "✓ Created railway.toml"
else
  echo "✓ Railway config already exists"
fi

# Step 2: Unset RAILWAY_TOKEN to use CLI session
echo "Unsetting RAILWAY_TOKEN to use CLI session..."
unset RAILWAY_TOKEN

# Step 3: Security updates
if pnpm audit --production 2>&1 | grep -q "vulnerabilities"; then
  echo "Security vulnerabilities detected, updating..."
  pnpm update next@latest --filter web-app
  pnpm update --filter web-app
fi

# Step 4: Commit config and security updates
git add railway.toml pnpm-lock.yaml package.json apps/web/package.json 2>/dev/null || true
if ! git diff --cached --quiet; then
  git commit -m "Add Railway config-as-code and security updates"
  git push origin main
fi

# Step 5: Link and deploy to Railway
npx @railway/cli link 2>/dev/null || echo "Project already linked"
npx @railway/cli up --service "$SERVICE_NAME"
