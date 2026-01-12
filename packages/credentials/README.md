# @bickford/credentials

Canonical authority for credential enumeration, policy, and resolution.

## Structure
- `src/credentialTypes.ts`: Credential type definitions and enums
- `src/credentialRegistry.ts`: Canonical registry of credentials
- `src/credentialPolicy.ts`: Policy logic for credentials
- `src/credentialResolution.ts`: Credential resolution logic
- `src/index.ts`: Entry point

## Initial Registered Credential
- **ID:** VERCEL_TOKEN
- **Boundary:** vercel.deploy
- **Owner:** vercel
- **Tier:** 3
- **Automation:** false
- **Lifecycle:** BOOTSTRAP_REQUIRED
- **Environments:** production
