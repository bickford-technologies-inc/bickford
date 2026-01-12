# --- Mobile UI Full Automation ---

## Vercel (Web/PWA)
- Every push to main/mobile-ui auto-builds and deploys to Vercel
- Access at https://bickford-mobile-ui.vercel.app

## Expo/EAS (Native: iOS/Android)
- Build Android/iOS apps with one command:
   ```bash
   npm run eas:build:android
   npm run eas:build:ios
   ```
- Submit to app stores with one command:
   ```bash
   npm run eas:submit:android
   npm run eas:submit:ios
   ```

## CI/CD (Optional)
- Add GitHub Actions to automate EAS build/submit on every push
- Approvals for app store submission can be manual or automated

## Maintenance
- All build/deploy steps are automated
- Your involvement is only needed for exceptions or approvals

---
# --- Automated Vercel Deploy (Mobile UI) ---

## Deploy Mobile UI (PWA) to Vercel

1. Push changes to main or mobile-ui branch:
   ```bash
   git push origin main
   # or
   git push origin mobile-ui
   ```
2. Vercel auto-builds and deploys from packages/bickford-mobile-ui
3. Access your mobile UI instantly at the Vercel URL (e.g. https://bickford-mobile-ui.vercel.app)

## Apple/iOS Install (Add to Home Screen)

- Open the Vercel URL in Safari on iPhone/iPad
- Tap the Share icon, then "Add to Home Screen"
- The app installs as a native-like PWA

---
# --- Unified Dev Automation ---

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
   - Mobile: http://localhost:5173 (PWA)

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
