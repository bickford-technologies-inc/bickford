# Manual Railway Setup Guide

Use this guide if automated setup fails.

## Prerequisites

- Railway account: https://railway.app/login
- GitHub repository access

## Steps

### 1. Create Project

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select `bickfordd-bit/bickford`
4. Choose branch: `main`

### 2. Add PostgreSQL

1. Click "New" in project dashboard
2. Select "Database" → "Add PostgreSQL"
3. Railway auto-configures `DATABASE_URL`

### 3. Generate Domain

1. Click on web service (not database)
2. Go to "Settings" → "Networking"
3. Click "Generate Domain"
4. Copy the URL

### 4. Verify Deployment

Wait for build to complete, then test:

```bash
# Replace with your Railway URL
RAILWAY_URL="your-railway-url-here"

# Health check
curl $RAILWAY_URL/api/health

# Should return: {"status":"healthy","database":"connected",...}
```

### 5. Add GitHub Secrets (for CI/CD)

1. Go to: https://github.com/bickfordd-bit/bickford/settings/secrets/actions
2. Add two secrets:
   - `RAILWAY_TOKEN`: From Railway Dashboard → Project Settings → Tokens
   - `RAILWAY_URL`: Your generated domain from step 3

## Troubleshooting

### Build Fails

Check Railway logs for errors:
1. Click on deployment
2. View "Build Logs" tab
3. Common issues:
   - Missing dependencies: `npm install` in root
   - TypeScript errors: Ensure PR #4 is merged
   - Prisma errors: Check `DATABASE_URL` is set

### Database Connection Fails

1. Verify PostgreSQL service is running
2. Check `DATABASE_URL` in service variables
3. Ensure format: `postgresql://user:pass@host:port/db`

### Domain Not Generated

1. Go to service Settings
2. Networking section
3. If "Generate Domain" is disabled, restart service
4. Try again after service is healthy

## Next Steps

Once deployed:
- Test all endpoints: `/api/health`, `/api/metrics`, `/api/execute`, `/api/ledger`
- Enable CI/CD by adding GitHub secrets
- Monitor via Railway dashboard

---

For automated setup, use: `./scripts/setup-railway.sh`
