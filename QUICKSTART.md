# Quickstart (Immediate Use)

If you want to start using this repo right now (no setup rabbit holes), do this:

## 🚀 Quick Start (Zero Configuration)

### One-Command Startup

```bash
npm start
```

This will:

- ✅ Auto-create `.env` from template if missing
- ✅ Auto-detect OPENAI_API_KEY from environment
- ✅ Install dependencies if needed
- ✅ Start API + Web UI concurrently

### Alternative: Step-by-Step

````bash
npm run setup       # Create .env (interactive or auto)
npm install         # Install dependencies
npm run dev         # Start all services (API + Web + Mobile)
That's it! The script will:
- ✅ Auto-create `.env` if missing
- ✅ Auto-detect `OPENAI_API_KEY` from environment
- ✅ Install dependencies if needed
- ✅ Start both backend and frontend services with auto-recovery
- ✅ Monitor health and auto-restart on failures
- ✅ Use colors for easy log tracking

### Self-Healing Features 🔧

The system now includes complete automation to handle issues without manual intervention:

**New Commands:**
```bash
npm run diagnose    # Show system health and identify issues
npm run health      # Quick health check of all services
npm run recover     # Manually trigger auto-recovery
npm run monitor     # Start health monitoring daemon
npm run fix-all     # Fix all auto-fixable issues
npm start:safe      # Start with pre-recovery check
````

**What Gets Automated:**

- ✅ Service crashes → Auto-restarted by health monitor
- ✅ Bad configuration → Auto-corrected by recovery script
- ✅ Missing dependencies → Auto-installed by recovery script
- ✅ Build cache issues → Auto-cleared
- ✅ Syntax errors → Prevented by pre-commit hooks

**Health Monitoring:**

- Continuous monitoring every 30 seconds
- Automatic service restart on failures
- Detailed diagnostics and logging
- Auto-recovery from common issues

### Alternative: Step-by-Step

```bash
npm run setup    # Interactive environment setup
npm install      # Install dependencies
npm run dev      # Start all services with concurrently
```

The setup script will:

- ✅ Create `.env` from template
- ✅ Auto-detect OPENAI_API_KEY from environment
- ✅ Prompt for API key if not found (optional)
- ✅ Configure everything for you

### Manual Setup (if needed)

1. Copy `packages/bickford/.env.example` to `packages/bickford/.env`
2. Add your `OPENAI_API_KEY` (optional - get from https://platform.openai.com/api-keys)
3. Run `npm install && npm run dev`

---

## Traditional Setup (Detailed)

1. Install deps (monorepo):

   ```bash
   npm run install:all
   ```

   Notes:

   - Dependency versions are pinned by `package-lock.json`.
   - For CI/reproducible installs, prefer: `npm run install:ci`.

2. Run the proof demos + typecheck (fast, deterministic):

   ```bash
   npm run quickstart
   ```

   This runs `demo:a` + `demo:c` after workspace lint/typecheck.

3. If you want the live UI locally:

   ```bash
   npm run dev:web
   ```

   Web (default): http://localhost:5173

   Change the port if needed:

   - `npm run dev:web -- --port 5180`

   In Codespaces:

   - Make sure `npm run dev:web` is running (it must be listening on port 5173).
   - In the **Ports** tab, forward port `5173` (set visibility to **Public** if needed).
   - Open the forwarded `https://<codespace>-5173.app.github.dev/` URL.
   - Optional: print the expected URL via `npm run codespaces:url:web`.

---

# Unified Dev Automation

Deployment notes live in DEPLOYMENT.md.

If you want continuous auto `git pull/commit/push`, see WORKFLOWS.md.

## Run API, Web, and Mobile Together

**Recommended: One Command**

```bash
npm start
```

This automatically installs dependencies, sets up environment, and starts both API and Web services.

## One-Command Onboarding

1. Install all dependencies and build everything:

   ```bash
   npm run install:all
   # (postinstall automatically builds all packages)
   ```

2. Start all dev servers (API, web, mobile):
   ```bash
   npm run dev
   ```
   - API: http://localhost:3000
   - Web: http://localhost:5173
   - Mobile: http://localhost:5174 (PWA)

## Mobile UI Environment

Set environment variables in `packages/bickford-mobile-ui/.env`:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_TENANT_ID=t_local
```

Reference in code via `process.env.EXPO_PUBLIC_API_URL`.

---

# --- Mobile UI (PWA) ---

## Run Mobile UI (PWA)

1. Install dependencies:
   ```bash
   make mobile-ui-install
   ```
2. Start dev server:

   ```bash
   make mobile-ui-dev
   ```

   - Open http://localhost:5173 on your mobile device or emulator.
   - App is installable as a PWA ("Add to Home Screen").

3. Build for production:
   ```bash
   make mobile-ui-build
   make mobile-ui-preview
   ```

---

# Bickford UI Quickstart

## How to run everything (API + UI + extension)

1. **Clone and configure:**

   - Copy `.env.example` to `.env` in `packages/bickford/` and set secrets.
   - (Optional) Set API URL in `packages/demo-dashboard/.env`.

2. **One-click launch:**

   - Run: `docker-compose up --build`
   - This starts Postgres, Redis, Bickford API, and the demo dashboard UI.
   - API: http://localhost:3000
   - UI: http://localhost:5173

3. **Mint a JWT for login:**

   - Run: `node packages/bickford/scripts/mint-token.js`
   - Copy the token for UI/API use.

4. **Use the UI:**

   - Open http://localhost:5173
   - Paste your JWT and API URL (http://localhost:3000)
   - Use all Bickford features: decide, promote, non-interference, audit, verify, notarize.

5. **Inject Bickford into ChatGPT:**
   - Load `packages/bickford/extension/` as an unpacked extension in Chrome.
   - Click the Bickford icon, then "Open in ChatGPT".
   - The Bickford UI will appear as a panel in ChatGPT.

## Configure chat (optional)

The demo web UI uses the Bickford API endpoint `POST /api/filing/chat`.

To enable LLM-backed classification, create:

- `packages/bickford/.env` (see `packages/bickford/.env.example`)

Minimum variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Then restart the API (`npm run dev:api`) and refresh the web UI.

You can confirm status at:

- `GET /api/health` → `llm.configured`

## Customization

- You can deploy the API/UI anywhere and set the API URL in the UI config.
- The extension iframe src can be changed to your deployed UI.

## Support

- All endpoints are documented in the API package.
- For advanced integration, see the README and code comments.

---

## 🔧 Troubleshooting & Auto-Recovery

### If Something Goes Wrong

**First, try automatic diagnosis:**

```bash
npm run diagnose
```

This will check:

- Node.js version
- Dependencies installation
- Environment configuration
- Service health status
- Recent errors in logs

**Common Issues & Solutions:**

1. **Services won't start:**

   ```bash
   npm run recover
   ```

   This will automatically:

   - Stash local changes (if needed)
   - Reinstall dependencies
   - Clear build caches
   - Fix configuration issues
   - Restart services

2. **Services keep crashing:**

   ```bash
   npm run monitor
   ```

   Starts a health monitor that checks every 30 seconds and auto-restarts failed services.

3. **Check service health:**

   ```bash
   npm run health
   ```

   Quick status check of backend and frontend.

4. **Fix everything automatically:**
   ```bash
   npm run fix-all
   ```
   Runs linting fixes and auto-recovery.

### Logs

All logs are saved in the `logs/` directory:

- `logs/backend.log` - Backend service logs
- `logs/frontend.log` - Frontend service logs
- `logs/health-monitor.log` - Health monitor logs

View logs:

```bash
tail -f logs/backend.log
tail -f logs/frontend.log
```

### Pre-commit Validation

The system includes automatic pre-commit hooks that:

- Check TypeScript syntax
- Auto-fix common linting issues
- Prevent committing broken code

If pre-commit fails, it will attempt to auto-fix. If that fails, you'll need to resolve manually.

### GitHub Actions Auto-Recovery

Deployments automatically trigger health checks:

- Waits 10 seconds for services to stabilize
- Checks backend health endpoint
- Auto-triggers rollback if unhealthy
- Creates GitHub issues for failed deployments

### Manual Override

If auto-recovery doesn't work:

```bash
# Kill all services
pkill -f "npm run dev"

# Clean everything
rm -rf node_modules packages/*/node_modules
npm install

# Start fresh
npm start
```

---

## Source-First Mode (Launch Default)

All internal `@bickford/*` packages are consumed as source by the web app. Next.js transpiles all workspace dependencies via `transpilePackages` in `apps/web/next.config.mjs`.

- No `dist/` output is required for web builds.
- No package is required to emit `dist/index.js` for the web app.
- This is the canonical invariant for launch velocity and reproducibility.

---

## 🚦 Canonical Invariants & Enforcement (Web Layer)

- Forbidden tokens: `canon`, `optr`, `ledger`, `authority`, `@bickford/*` must never appear in `apps/web/src`.
- All builds (local, CI, Vercel) are gated by `pnpm run preflight`.
- Violations are blocked with actionable output.
- See [`docs/INVARIANTS.md`](docs/INVARIANTS.md) for rules, examples, and remediation.

---
