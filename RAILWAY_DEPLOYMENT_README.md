# Railway Bun Deployment Quick Start

## Prerequisites
- Railway account
- Railway CLI (`npm install -g @railway/cli`)
- GitHub repo linked to Railway
- Bun 1.x compatible code

## Steps
1. Run the migration script:
   ```bash
   bash migrate-to-railway-bun.sh
   ```
2. Update `next.config.js`:
   ```js
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'standalone',
     // ...
   }
   module.exports = nextConfig
   ```
3. Set up Railway project and link GitHub
4. Add secrets: `RAILWAY_TOKEN`, `RAILWAY_PROJECT_ID`
5. Deploy: push to main or run `railway up`

## Expected Results
- Bun runtime in logs
- `/chat` and `/api/health` work
- Fast cold starts, low memory

## Support
- See docs/RAILWAY_BUN_MIGRATION.md
