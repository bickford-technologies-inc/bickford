# Deployment

## Railway Deployment (Production)

**Zero-touch deployment pipeline** for the Bickford API and web application.

### Setup Instructions

1. **Create Railway Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Initialize project
   railway init
   
   # Link repository
   railway link
   ```

2. **Add Database**
   ```bash
   # Add PostgreSQL database
   railway add --database postgres
   
   # This automatically sets DATABASE_URL environment variable
   ```

3. **Add GitHub Secret**
   - Go to GitHub repository → Settings → Secrets → Actions
   - Click "New repository secret"
   - Name: `RAILWAY_TOKEN`
   - Value: Get from https://railway.app/account/tokens
   - Click "Create token" and paste the token

4. **Deploy**
   ```bash
   # Push to main branch triggers automatic deployment
   git push origin main
   
   # Or trigger manually via GitHub Actions UI
   ```

### Automatic Workflow

- **PR Validation** (`.github/workflows/pr-check.yml`):
  - Build all packages
  - TypeScript type checking
  - Prisma schema validation
  - Smoke tests (demo:a, demo:c)

- **Railway Deployment** (`.github/workflows/deploy.yml`):
  - Triggered on push to `main` or manual dispatch
  - Deploys to Railway using `railway up --detach`
  - Runs database migrations: `railway run npx prisma migrate deploy`
  - Health check: `curl -f <deployment-url>/api/ledger`
  - Posts deployment URL to commit

### Configuration

- **`railway.json`**: Defines build and deployment commands
  - Build: `npm install && npx prisma generate && npm run build`
  - Start: `npm run start` (runs `packages/web-ui` on Railway's PORT)
  - Restart policy: On failure, max 3 retries

### Manual Commands

```bash
# Deploy manually using Railway CLI
railway up

# Run migrations
railway run npx prisma migrate deploy

# Check deployment status
railway status

# View logs
railway logs

# Open deployment URL
railway domain
```

---

## Automated CI/CD Pipeline

This repository includes automated deployment pipelines via GitHub Actions.

### Deployment Workflow

**Automatic Deployments:**
- Push to `develop` → Auto-deploys to **staging** (after tests pass)
- Push to `main` → Auto-deploys to **production** (after tests pass)
- Pull requests → Run tests and build only (no deployment)

**Manual Deployments:**
```bash
npm run deploy              # Deploy to staging
npm run deploy:staging      # Deploy to staging explicitly
npm run deploy:production   # Deploy to production explicitly
```

### GitHub Actions Workflows

The CI/CD pipeline (`.github/workflows/ci.yml`) includes:

1. **Test & Lint** - Validates code quality
   - Linting
   - Type checking
   - Unit tests

2. **Build** - Creates production artifacts
   - Builds all packages
   - Uploads build artifacts

3. **Deploy to Staging** - Deploys to staging environment
   - Triggered on push to `develop` branch
   - Downloads build artifacts
   - Runs deployment script

4. **Deploy to Production** - Deploys to production environment
   - Triggered on push to `main` branch
   - Downloads build artifacts
   - Runs deployment script

### Auto-merge for Copilot PRs

The auto-merge workflow (`.github/workflows/auto-merge.yml`):
- Automatically merges PRs created by `copilot-swe-agent[bot]`
- Waits for all CI checks to pass
- Uses squash merge strategy
- Adds confirmation comment

### Health Checks

Before and after deployment, run health checks:
```bash
npm run check
```

This validates:
- Environment configuration
- Dependencies installed
- Services responding (if running)

---

## Vercel Deploy (Mobile UI PWA)

1. Push changes to `main` (or a branch you’ve connected in Vercel):
   ```bash
   git push origin main
   ```

2. Vercel builds and deploys from `packages/bickford-mobile-ui`.

3. Open the deployed URL from Vercel.

## Apple/iOS Install (Add to Home Screen)

- Open the Vercel URL in Safari on iPhone/iPad
- Tap Share → "Add to Home Screen"
- The app installs as a native-like PWA

---

## iOS App Store Deployment (Native Mobile)

The repository includes automated iOS app deployment to Apple Store Connect using Expo Application Services (EAS).

**📖 Complete setup guide**: [`APPLE_STORE_AUTOMATION.md`](./APPLE_STORE_AUTOMATION.md)

### Quick Overview

**Prerequisites**:
- Apple Developer Account ($99/year)
- Expo account (free tier available)
- App created in App Store Connect

**Required GitHub Secrets**:
- `EXPO_TOKEN`: Expo access token
- `EXPO_APPLE_APP_SPECIFIC_PASSWORD`: App-specific password from Apple

**Automatic Workflow**:
- Push to `main` with mobile changes → Automatic iOS build & submit to App Store Connect
- Or manually trigger via GitHub Actions UI

**Manual Commands**:
```bash
# Build iOS app locally
cd packages/bickford-mobile-expo
npm run eas:build:ios

# Submit to App Store
npm run eas:submit:ios
```

**📖 For detailed setup instructions, see**: [`APPLE_STORE_AUTOMATION.md`](./APPLE_STORE_AUTOMATION.md)
