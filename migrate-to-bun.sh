#!/bin/bash
set -e

echo "[BUN MIGRATION] Copying Bun-native workflow..."
mkdir -p .github/workflows
cat > .github/workflows/deploy.yml <<'EOF'
name: Deploy (Bun-native)

on:
  push:
    branches: [main]
  workflow_dispatch:
  schedule:
    - cron: "0 * * * *"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: "latest"
      - name: Validate required secrets
        run: |
          missing=0
          for var in RAILWAY_TOKEN RAILWAY_PROJECT_ID VERCEL_TOKEN VERCEL_PROJECT_ID VERCEL_ORG_ID; do
            if [ -z "${!var}" ]; then
              echo "❌ Missing required secret: $var"
              missing=1
            fi
          done
          if [ $missing -ne 0 ]; then
            echo "❌ One or more required secrets are missing. Please add them in your GitHub repository settings."
            exit 1
          fi
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
          RAILWAY_PROJECT_ID: ${{ secrets.RAILWAY_PROJECT_ID }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      - name: Deploy to Railway
        run: |
          bun install -g @railway/cli
          railway link ${{ secrets.RAILWAY_PROJECT_ID }}
          railway up --detach --service web-ui
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
      - name: Health check Railway
        run: |
          echo "TODO: Implement dynamic health check URL discovery for Railway"
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod --force'
          working-directory: ./
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      - name: Health check Vercel
        run: |
          echo "TODO: Implement dynamic health check URL discovery for Vercel"
      - name: On failure, create GitHub issue with error logs
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `🚨 Automated Deployment Failure: ${{ github.run_id }}`,
              body: `The deployment failed. Please check the logs for details.\n[View run](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }})`
            })
EOF

echo "[BUN MIGRATION] Copying vercel.json..."
cat > vercel.json <<'EOF'
{
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "outputDirectory": ".vercel/output",
  "framework": null
}
EOF

echo "[BUN MIGRATION] Copying migration guide..."
cat > docs/BUN_MIGRATION_GUIDE.md <<'EOF'
# Bun Migration Guide

## 1. GitHub Actions
- Uses oven-sh/setup-bun@v1
- All build/test steps use Bun

## 2. Vercel
- Build Command: `bun run build`
- Install Command: `bun install`
- Remove any Node.js-specific overrides

## 3. Manual Steps
- Update Vercel settings as above
- Remove any Node.js-specific scripts
EOF

echo "[BUN MIGRATION] All files copied."
echo "[BUN MIGRATION] Staging files for commit..."
git add .github/workflows/deploy.yml vercel.json docs/BUN_MIGRATION_GUIDE.md

echo "[BUN MIGRATION] Migration complete. Please commit and push the changes, then update Vercel settings as described."
