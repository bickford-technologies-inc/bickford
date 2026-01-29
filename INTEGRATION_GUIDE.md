# Integration Guide: Bickford Next.js App

## Overview

This guide explains how to deploy and integrate the Bickford platform as a single, production-ready Next.js application. The architecture is intentionally consolidated for maximum acquisition velocity and minimal integration risk.

---

## 1. Deployment Targets

- **Vercel** (recommended, zero-config)
- **AWS (Amplify, ECS, EC2)**
- **Google Cloud (App Engine, Cloud Run)**
- **Azure (App Service, Static Web Apps)**

---

## 2. Quick Start (Vercel)

1. **Clone the repo:**
   ```bash
   git clone https://github.com/bickfordd-bit/bickford.git
   cd bickford
   ```
2. **Install dependencies:**
   ```bash
   pnpm install
   # or npm install
   ```
3. **Run locally:**
   ```bash
   pnpm run dev
   # or npm run dev
   ```
4. **Deploy to Vercel:**
   - Push to GitHub
   - Import repo in Vercel dashboard
   - Set build command: `pnpm run build` (or `npm run build`)
   - Set output directory: `.next`
   - Click deploy

---

## 3. Cloud Provider Deployment

- **AWS Amplify:**
  - Connect repo, set build command/output as above
- **Google Cloud Run/App Engine:**
  - Use Dockerfile or `gcloud app deploy`
- **Azure App Service:**
  - Use Azure portal, set up Node.js app, deploy from GitHub

---

## 4. Integration Timeline

| Phase              | Duration   | Milestone                |
| ------------------ | ---------- | ------------------------ |
| Initial Setup      | 1-2 days   | Repo cloned, app runs    |
| Cloud Deployment   | 2-5 days   | Live on cloud provider   |
| Custom Integration | 2-4 weeks  | API keys, branding, etc. |
| Production Rollout | 1-3 months | Full integration         |

**Total: 1-3 months (typical)**

---

## 5. Zero Technical Debt

- No legacy code or monorepo complexity
- Standard Next.js, React, TypeScript
- No custom build tooling
- Clean, minimal dependencies

---

## 6. Handoff Process

- All code and documentation provided
- Support for initial deployment (optional)
- Clean codebase, easy to onboard new engineers

---

## Questions?

Contact the Bickford team for support or integration assistance.
