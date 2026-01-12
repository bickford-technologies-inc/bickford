# Quickstart (Immediate Use)

If you want to start using this repo right now (no setup rabbit holes), do this:

## 🚀 Quick Start (Automated)

### One-Command Setup
```bash
npm run setup
npm install
npm run dev:api &
npm run dev:web
```

The setup script will:
- ✅ Create `.env` from template
- ✅ Auto-detect OPENAI_API_KEY from environment
- ✅ Prompt for API key if not found (optional)
- ✅ Configure everything for you

### Manual Setup (if needed)
1. Copy `packages/bickford/.env.example` to `packages/bickford/.env`
2. Add your `OPENAI_API_KEY` (optional - get from https://platform.openai.com/api-keys)
3. Run `npm install && npm run dev:api && npm run dev:web`

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
   - UI:  http://localhost:5173

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

## Customization
- You can deploy the API/UI anywhere and set the API URL in the UI config.
- The extension iframe src can be changed to your deployed UI.

## Support
- All endpoints are documented in the API package.
- For advanced integration, see the README and code comments.
