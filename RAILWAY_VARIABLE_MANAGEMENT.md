# Railway Variable Management

This workflow automates secure, compliant, and repeatable environment variable management for all Bickford Railway deployments.

## Components

- **env.manifest.json**: Single source of truth for all variables (shared, service, sealed, environment).
- **scripts/sync-railway-vars.ts**: Syncs manifest to Railway using CLI/API. Handles sharing and scoping. ⚠️ Sealed variables must be set/sealed manually in the Railway UI (not supported by CLI).
- **scripts/generate-env.ts**: Generates .env and .env.example for local development.
- **.github/workflows/railway-vars.yml**: CI workflow to enforce manifest sync on every push.

## Usage

1. **Edit `env.manifest.json`** to add/update/remove variables.
2. **Run `bun scripts/sync-railway-vars.ts`** to sync with Railway (or let CI do it on push).
   - ⚠️ For any variable marked as `sealed: true`, you must set and seal it manually in the Railway UI. The script will print a warning and skip these.
3. **Run `bun scripts/generate-env.ts`** to generate local .env files for development.
4. **All changes are tracked in git and Railway staged changes.**

## Security & Compliance

- All production secrets must be sealed (set/sealed manually in UI).
- Never commit secrets to git.
- Manifest and scripts are auditable for SOC-2/ISO compliance.

## Onboarding

- New team members: run `bun scripts/generate-env.ts` and use `.env.example` as a template.
- For production, only sealed variables are used and never exposed locally.

---

For more, see Railway docs and Bickford compliance artifacts.
