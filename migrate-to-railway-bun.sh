#!/bin/bash
set -e

echo "[1/5] Copying migration files..."
cp -v Dockerfile railway.json .github/workflows/railway-bun-deploy.yml docs/RAILWAY_BUN_MIGRATION.md RAILWAY_DEPLOYMENT_README.md . 2>/dev/null || true
chmod +x migrate-to-railway-bun.sh

echo "[2/5] Validating configuration..."
if ! grep -q 'output:.*standalone' next.config.js 2>/dev/null; then
  echo "WARNING: Please add output: 'standalone' to your next.config.js!"
fi

echo "[3/5] Staging files..."
git add Dockerfile railway.json .github/workflows/railway-bun-deploy.yml docs/RAILWAY_BUN_MIGRATION.md migrate-to-railway-bun.sh RAILWAY_DEPLOYMENT_README.md || true

echo "[4/5] Committing..."
git commit -m "feat: migrate to Railway with full Bun runtime" || true

echo "[5/5] Pushing to main..."
git push origin main || true

echo "\nMigration complete!\n"
echo "Next steps:"
echo "- Update next.config.js with output: 'standalone' if not already set."
echo "- Set up Railway project and GitHub secrets as per docs/RAILWAY_BUN_MIGRATION.md."
echo "- Deploy via GitHub Actions or 'railway up'."
