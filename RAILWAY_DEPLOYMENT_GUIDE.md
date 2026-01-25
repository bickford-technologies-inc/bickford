# Railway Deployment - Complete Automation Guide

## Quick Start: One-Command Deployment

```bash
cd /workspaces/bickford
bash deploy-to-railway-complete.sh
```

## Test Your Live Deployment

```bash
bash test-railway-deployment.sh
```

## Config Files Provided

### TOML (Recommended)

Place `railway.toml` at your project root:

```toml
[build]
builder = "nixpacks"
buildCommand = "pnpm install && pnpm build"

[deploy]
startCommand = "pnpm start"
healthcheckPath = "/"
healthcheckTimeout = 100
restartPolicyType = "always"
```

### JSON (IDE Autocomplete)

Place `railway.json` at your project root:

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "always"
  }
}
```

## Manual Deployment Steps

1. Add config file
2. Fix security issues
3. Commit changes
4. Deploy
5. Test

## Common Issues & Fixes

- Invalid RAILWAY_TOKEN: unset and use CLI session
- Security vulnerabilities: update Next.js and dependencies
- Service not found: link to correct service
- Build failed: check logs, scripts, env vars

## Future Deployments

- Use GitHub integration for auto-deploys
- Or: `npx @railway/cli up --service @bickford/web-app`
- Or: push a dummy change to trigger redeploy

## Health Checks & Monitoring

- View logs: `railway logs --service @bickford/web-app --tail`
- Check status: `railway status --service @bickford/web-app`
- Restart: `railway restart --service @bickford/web-app`
- Open dashboard: `railway open --service @bickford/web-app`

## Success Indicators

- Deployment succeeds
- Health check passes (200 OK)
- Logs show startup
- Domain responds (200)

## Get Help

- Railway docs: https://docs.railway.app
- View logs: `railway logs --service @bickford/web-app`
- Dashboard: https://railway.app
- Railway support: https://help.railway.app
