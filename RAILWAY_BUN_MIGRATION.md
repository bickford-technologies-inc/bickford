# Railway Bun Migration Guide

## Overview
This guide walks you through migrating your Bickford app to Railway with a full Bun runtime, eliminating Node.js dependencies for optimal performance and cost.

## Steps

1. **Copy migration files** (Dockerfile, railway.json, workflow, script, README)
2. **Run the migration script:**
   ```bash
   bash migrate-to-railway-bun.sh
   ```
3. **Update `next.config.js`**
   ```js
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'standalone',
     // ... rest of your config
   }
   module.exports = nextConfig
   ```
4. **Set up Railway project:**
   - Install Railway CLI: `npm install -g @railway/cli`
   - `railway login`
   - `railway init`
   - `railway link`
5. **Add GitHub secrets:**
   - `RAILWAY_TOKEN` and `RAILWAY_PROJECT_ID`
6. **Deploy:**
   - Push to main (triggers GitHub Actions)
   - Or run `railway up`

## Verification
- Build logs show Bun
- `/chat` and `/api/health` work
- Cold start ~500ms, memory ~256MB

## Troubleshooting
- See logs in Railway dashboard
- Ensure secrets are set
- Check Dockerfile and workflow for typos

## Performance
| Metric      | Before (Node) | After (Bun) |
|-------------|---------------|-------------|
| Build time  | 2-3 min       | 45-90 sec   |
| Cold start  | 1-2 sec       | ~500ms      |
| Memory      | ~512MB        | ~256MB      |

## Support
- Ask in #support or open an issue
