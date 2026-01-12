# Railway CI/CD Setup Guide

## Overview

This repository includes **zero-touch deployment** to Railway with automatic:
- ✅ PR validation (build, typecheck, lint)
- ✅ Deployment on merge to `main`
- ✅ Database migrations
- ✅ Health checks
- ✅ Dependency updates via Dependabot

---

## Quick Start

### 1. Setup Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link this repository
railway link

# Add PostgreSQL database
railway add --database postgres
```

### 2. Configure GitHub Secret

1. Get Railway token: https://railway.app/account/tokens
2. Click "Create Token"
3. Copy the token
4. Go to GitHub: Settings → Secrets → Actions
5. Add secret: `RAILWAY_TOKEN` = (paste token)

### 3. Deploy

```bash
# Push to main branch
git push origin main

# Deployment happens automatically!
# - Builds all packages
# - Runs migrations
# - Health check
# - Posts deployment URL
```

---

## Workflows

### PR Validation (`.github/workflows/pr-check.yml`)

Runs on every pull request to `main`:

```yaml
✓ npm ci                    # Install dependencies
✓ prisma generate           # Generate Prisma client
✓ npm run build             # Build all packages
✓ npm run typecheck         # TypeScript validation
✓ prisma validate           # Schema validation
✓ npm run smoke             # Run smoke tests
```

**Required to merge:** All checks must pass.

### Railway Deployment (`.github/workflows/deploy.yml`)

Runs on push to `main` or manual trigger:

```yaml
✓ railway up --detach                    # Deploy to Railway
✓ railway run npx prisma migrate deploy  # Run migrations
✓ Get deployment URL                     # Extract URL
✓ Health check: /api/ledger              # Verify deployment
```

**Result:** Deployment URL posted to commit.

### Dependabot (`.github/dependabot.yml`)

Weekly automatic dependency updates:
- Checks for updates to all npm packages
- Groups `@bickford/*` and `@prisma/*` packages
- Creates PRs for updates
- Max 10 PRs at once

---

## Configuration Files

### `railway.json`

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### Root `package.json` Scripts

```json
{
  "start": "npm -w packages/web-ui run start",
  "build": "npm run build:types && prisma generate && npm run build:api && npm run build:web && npm run build:mobile",
  "build:types": "npm -w packages/types run build",
  "typecheck": "npm --workspaces --if-present run typecheck"
}
```

### Web UI `package.json`

```json
{
  "start": "node scripts/start.mjs",
  "typecheck": "tsc --noEmit"
}
```

**Note:** The start script uses a Node.js wrapper (`scripts/start.mjs`) that properly handles Railway's `PORT` environment variable by resolving the full vite binary path and spawning it with the correct port.

---

## Environment Variables

### Required in Railway

- `DATABASE_URL` - Automatically set by Railway when you add PostgreSQL
- `PORT` - Automatically set by Railway

### Optional in Railway

Add these in Railway dashboard → Variables:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
AUTH_MODE=jwt
JWT_SECRET=your-secret-key
REDIS_URL=redis://...
```

---

## Manual Railway Commands

```bash
# Deploy manually
railway up

# Run migrations
railway run npx prisma migrate deploy

# Check deployment status
railway status

# View logs
railway logs

# Get deployment URL
railway domain

# Open in browser
railway open

# Run command in Railway environment
railway run <command>
```

---

## Troubleshooting

### Build Fails

1. Check GitHub Actions logs
2. Verify all packages build locally:
   ```bash
   npm ci
   DATABASE_URL="postgresql://user:pass@localhost:5432/db" npm run build
   ```

### Migrations Fail

1. Check Railway logs: `railway logs`
2. Run migrations manually:
   ```bash
   railway run npx prisma migrate deploy
   ```

### Health Check Fails

1. Check deployment URL: `railway domain`
2. Verify service is running: `railway logs`
3. Test endpoint manually: `curl https://your-app.railway.app/api/ledger`

### Deployment Timeout

1. Increase Railway plan (free tier has limits)
2. Check build logs for slow steps
3. Consider pre-building node_modules

---

## What This Unlocks

**Developer Experience:**
- Push code → automatic validation
- Merge PR → automatic deployment
- Zero manual Railway commands
- Instant feedback on PRs

**Operational:**
- No forgotten migrations
- Consistent builds
- Deployment rollback via git revert
- Audit trail in GitHub Actions

**Bickford-Aligned:**
- Intent: "Deploy my code"
- Canon: "Code must build and validate"
- Enforcement: GitHub Actions blocks bad PRs
- Ledger: Every deployment logged in Railway + GitHub

**This is intent → execution, automated.**

---

## Cost Estimate

**Railway:**
- Free tier: $0 (500 hours, 512MB RAM, 1GB disk)
- Hobby: $5/month (500 hours execution, unlimited projects)
- Pro: $20/month + usage (priority support, more resources)

**GitHub Actions:**
- Public repos: Free unlimited
- Private repos: 2,000 minutes/month free

**Recommendation:** Start with Railway Hobby ($5/month) + GitHub free tier.

---

## Security Notes

1. **Never commit secrets** - Use GitHub Secrets and Railway Variables
2. **RAILWAY_TOKEN** - Keep secure, rotate periodically
3. **DATABASE_URL** - Automatically secured by Railway
4. **Review Dependabot PRs** - Don't auto-merge without review

---

## Next Steps

1. ✅ Setup Railway project
2. ✅ Add `RAILWAY_TOKEN` to GitHub Secrets
3. ✅ Push to `main` branch
4. ✅ Watch GitHub Actions deploy
5. ✅ Visit deployment URL
6. ✅ Add custom domain in Railway (optional)
7. ✅ Configure production environment variables

**Done. Forever automated.**
