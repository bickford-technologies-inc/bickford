// packages/credential-authority/README.md

# Credential Authority (MVP)

This package provides a minimal in-memory credential authority for Bickford automation:

- Set, rotate, and fetch credentials by name
- Versioning and history
- Used by sync agent to update .env and propagate changes

## Usage

```ts
import {
  setCredential,
  getCredential,
  rotateCredential,
  getCredentialHistory,
} from "@bickford/credential-authority";

setCredential("ANTHROPIC_API_KEY", "sk-...1");
rotateCredential("ANTHROPIC_API_KEY", "sk-...2");
const current = getCredential("ANTHROPIC_API_KEY");
const history = getCredentialHistory("ANTHROPIC_API_KEY");
```

## Next Steps

- Replace in-memory store with persistent backend (Vault, Doppler, etc.)
- Add API for remote/CI/CD access
- Integrate with OPTR engine for intent tracking
- Extend ledger for credential events
