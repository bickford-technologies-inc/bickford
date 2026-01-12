# Unified Build & Deploy Automation for Bickford Authority Runtime

This Makefile and documentation automate end-to-end build and deployment for all user-facing surfaces (API, Web, Mobile UI) with a single command. It ensures that "deploy" means code is live and accessible to end users, with zero manual steps.

## Usage

- **Build everything:**
  ```sh
  make build-all
  ```
- **Deploy everything (API, Web, Mobile):**
  ```sh
  make deploy-all
  ```

## Targets

- `build-all`: Installs dependencies and builds all packages (API, Web, Mobile UI)
- `deploy-api`: Deploys the backend API (Docker Compose, or your cloud target)
- `deploy-web`: Deploys the web dashboard (Vercel CLI, or your cloud target)
- `deploy-mobile`: Deploys the mobile UI (Vercel for PWA, EAS for native)
- `deploy-all`: Runs all deploy targets in sequence

## Requirements
- Docker (for API deploy)
- Vercel CLI (for web/mobile PWA deploy)
- Expo/EAS CLI (for native mobile deploy)

## Example

```sh
make build-all && make deploy-all
```

---

# To extend: add cloud provider CLI steps or update targets as needed.
