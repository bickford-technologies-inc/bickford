# CI/CD Automation Setup

This document describes the complete CI/CD automation system for the session-completion-runtime repository.

## Overview

The repository now includes a complete automated workflow from code changes → testing → deployment with zero manual intervention required.

## Features

### ✅ Automated Testing

- Linting on every push and PR
- Type checking on every push and PR
- Unit tests on every push and PR

### ✅ Automated Building

- Builds all packages automatically
- Uploads build artifacts
- Caches dependencies for faster builds

### ✅ Automated Deployment

- Push to `develop` → auto-deploy to staging
- Push to `main` → auto-deploy to production
- Staged deployment with health checks

### ✅ Automated PR Management

- Auto-merge Copilot bot PRs when checks pass
- Wait for all CI checks before merging
- Automatic comments and status updates

### ✅ Quality Enforcement via GitHub Actions

- All quality checks run in GitHub Actions CI
- PRs cannot merge until checks pass
- No local git hooks needed (works better with CI/Vercel)

## Quick Start

### One-Command Startup

```bash
npm start
```

This automatically:

1. Creates `.env` if missing
2. Installs dependencies if needed
3. Starts all services (API + Web)

### Development Workflow

```bash
npm run dev              # Start all services
npm run dev:api         # Start API only
npm run dev:web         # Start Web only
npm run dev:mobile      # Start Mobile only
```

### Testing & Validation

```bash
npm run check           # Run health checks
npm run lint            # Lint all workspaces
npm run test            # Test all workspaces
npm run typecheck       # Type check all workspaces
npm run smoke           # Fast smoke test
```

### Deployment

```bash
npm run deploy                  # Deploy to staging
npm run deploy:staging          # Deploy to staging
npm run deploy:production       # Deploy to production
```

## Files Created

### GitHub Actions Workflows

#### `.github/workflows/ci.yml`

Complete CI/CD pipeline with 4 jobs:

1. **Test & Lint** - Validates code quality
2. **Build** - Creates production artifacts
3. **Deploy Staging** - Auto-deploys to staging on `develop` branch
4. **Deploy Production** - Auto-deploys to production on `main` branch

#### `.github/workflows/auto-merge.yml`

Auto-merge workflow for Copilot PRs:

- Detects PRs from `copilot-swe-agent[bot]`
- Waits for all CI checks to pass
- Enables auto-merge with squash strategy
- Adds confirmation comment

### Shell Scripts

#### `scripts/start.sh`

One-command startup script:

- Auto-creates `.env` from template if missing
- Auto-detects `OPENAI_API_KEY` from environment
- Installs dependencies if needed
- Starts API + Web concurrently using `concurrently`
- Cross-platform sed compatibility (macOS/Linux)
- Comprehensive error handling

#### `scripts/setup-env.sh`

Environment setup script (enhanced):

- Cross-platform sed function using perl/macOS sed/GNU sed
- Auto-creates `.env.example` if missing
- Auto-configures from environment variables
- Interactive prompts only in non-CI environments
- API key validation
- Improved error handling with trap

#### `scripts/deploy.sh`

Deployment script:

- Environment-based deployment (staging/production)
- Builds all packages before deployment
- Runs health checks before deployment
- Placeholder for deployment commands (Vercel, etc.)

#### `scripts/health-check.sh`

Health validation script:

- Checks environment file exists
- Validates API key configuration
- Checks dependencies are installed
- Tests if services are responding (API + Web)

### Package.json Updates

New scripts added:

```json
{
  "start": "bash scripts/start.sh",
  "typecheck": "npm --workspaces --if-present run typecheck",
  "check": "bash scripts/health-check.sh",
  "deploy": "bash scripts/deploy.sh",
  "deploy:staging": "bash scripts/deploy.sh staging",
  "deploy:production": "bash scripts/deploy.sh production"
}
```

## Workflow Diagrams

### Development Workflow

```
Developer makes changes
         ↓
Git hooks run (pre-commit: lint + typecheck)
         ↓
Push to branch
         ↓
GitHub Actions: Test & Lint
         ↓
GitHub Actions: Build
         ↓
Create PR (manual or Copilot)
         ↓
Auto-merge enabled (if Copilot bot)
         ↓
PR merged when checks pass
```

### Deployment Workflow

```
Merge to develop branch
         ↓
GitHub Actions: Test & Lint
         ↓
GitHub Actions: Build
         ↓
GitHub Actions: Deploy to Staging
         ↓

Merge to main branch
         ↓
GitHub Actions: Test & Lint
         ↓
GitHub Actions: Build
         ↓
GitHub Actions: Deploy to Production
```

## Benefits

### Zero Manual Intervention

- No manual PR reviews for Copilot PRs
- No manual deployment commands
- No manual health checks
- No manual environment setup

### Safety & Quality

- All changes tested before merge
- Staged deployments (staging → production)
- Health checks after deployment
- Rollback capability via git revert
- Pre-commit hooks prevent bad commits

### Speed & Efficiency

- One-command startup: `npm start`
- Automatic dependency installation
- Parallel service startup
- Cached builds in CI
- Fast smoke tests

### Developer Experience

- Clear error messages
- Cross-platform compatibility (macOS/Linux)
- Interactive prompts only when needed
- Comprehensive documentation
- Consistent workflow

## Customization

### Deployment Targets

Edit `scripts/deploy.sh` to add your deployment commands:

```bash
case "$ENVIRONMENT" in
  staging)
    # Add your staging deployment
    vercel deploy --prebuilt
    ;;
  production)
    # Add your production deployment
    vercel deploy --prod --prebuilt
    ;;
esac
```

### CI/CD Pipeline

Edit `.github/workflows/ci.yml` to customize:

- Node.js version
- Test/lint/build commands
- Deployment steps
- Environment URLs

## Troubleshooting

### Script Permissions

If scripts aren't executable:

```bash
chmod +x scripts/*.sh
```

### macOS sed Issues

The scripts use perl for cross-platform compatibility. If perl is not available:

```bash
brew install perl  # macOS
```

### CI Failures

Check the GitHub Actions logs:

1. Go to the "Actions" tab in GitHub
2. Click on the failing workflow
3. Review the logs for each job

### Health Check Fails

Run manually to see detailed output:

```bash
npm run check
```

---

## 🧱 Canonical Environment Precondition (2026)

A layered, authoritative preinstall guard is now required for all CI and Vercel builds. This enforces the canonical invariant:

> **No workspace resolution or build may occur unless the environment and transport layers are verified healthy.**

**Script:** `ci/guards/ENVIRONMENT_PRECONDITION.sh`

**What it does:**

- Fails fast if Node is not v20 (exit code 10)
- Fails fast if registry transport is broken (exit code 20)
- Prints clear pass/fail output
- No workspace or build steps may run unless this passes

**How to use (Vercel/CI install command):**

```bash
bash ci/guards/ENVIRONMENT_PRECONDITION.sh && corepack enable && corepack prepare pnpm@9.15.0 --activate && pnpm install --frozen-lockfile
```

**Exit Codes:**

- `10` — Node version mismatch (runtime drift)
- `20` — Registry transport failure (environment poison)

If the guard fails, do not attempt to run pnpm or build steps. Fix the environment first.

**Heuristics:**

- `ERR_INVALID_THIS` = environment poison, not a workspace error
- Registry fetch failures = transport broken, ignore workspace errors
- Only trust workspace errors if guard passes

See `ci/guards/ENVIRONMENT_PRECONDITION.sh` for implementation details.

## Related Documentation

- `QUICKSTART.md` - Quick start guide
- `WORKFLOWS.md` - Detailed workflow documentation
- `DEPLOYMENT.md` - Deployment procedures
- `README.md` - Main repository README

## Support

For issues or questions:

1. Check the documentation
2. Review GitHub Actions logs
3. Run health checks: `npm run check`
4. Check script syntax: `bash -n scripts/<script>.sh`

---

## iOS App Store Automation

The repository now includes automated iOS app deployment to Apple Store Connect.

**Workflow**: `.github/workflows/ios-deploy.yml`

### What It Does

1. ✅ Builds iOS app with Expo Application Services (EAS)
2. ✅ Submits to App Store Connect automatically
3. ✅ Triggers on push to `main` (when mobile files change)
4. ✅ Can be manually triggered via GitHub Actions UI

### Setup Required

Before this workflow can run, you need to:

1. Configure Apple Developer credentials
2. Set up Expo account and EAS
3. Add GitHub secrets:
   - `EXPO_TOKEN`
   - `EXPO_APPLE_APP_SPECIFIC_PASSWORD`

**📖 Complete setup guide**: See [`APPLE_STORE_AUTOMATION.md`](./APPLE_STORE_AUTOMATION.md) for step-by-step instructions.

### Manual Trigger

To manually build and submit:

1. Go to GitHub Actions tab
2. Select "iOS Build & Submit to App Store"
3. Click "Run workflow"
4. Choose environment (production/staging)
5. Click "Run workflow"

### Local Commands

```bash
cd packages/bickford-mobile-expo

# Build iOS app
npm run eas:build:ios

# Submit to App Store
npm run eas:submit:ios
```

---

## 🩺 Auto-Classification of Build Logs (2026)

All CI and Vercel builds now produce a deterministic, machine-readable diagnosis artifact on failure.

**Classifier script:** `ci/diagnostics/classify-build-log.js`

- Emits `build-diagnosis.json` with root-cause and action
- Prints diagnosis to console

**Vercel build wrapper:** `ci/vercel/build-with-diagnostics.sh`

- Runs the full build, logs output
- On failure, runs the classifier and prints diagnosis

**How to use in Vercel:**

In `vercel.json`:

```json
{
  "buildCommand": "bash ci/vercel/build-with-diagnostics.sh"
}
```

**How to use in CI:**

- Capture build logs
- On failure, run:
  ```bash
  node ci/diagnostics/classify-build-log.js build.log
  ```
- Upload or inspect `build-diagnosis.json`

**Result:**

- Every failed build produces a root-cause diagnosis and prescribed action
- No need to read raw logs to know what broke
