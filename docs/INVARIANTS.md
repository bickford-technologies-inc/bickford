# Bickford Canonical Invariants

## Architectural Law: Web Layer Separation

**The web layer must not assert, name, or reference canonical execution domains.**

### Forbidden tokens (must never appear in `apps/web/src`):

- `canon`
- `optr`
- `ledger`
- `authority`
- `@bickford/*`

### What this means:

- No imports, variable names, comments, filenames, or literals containing these tokens.
- The web UI may only render or proxy opaque data.
- All canonical logic, rules, scoring, and authority live outside the UI boundary.

### Allowed patterns:

- Generic terms: `rules`, `history`, `score`, `entry`, `system`, `data`, etc.
- UI-safe placeholders and adapters.
- Opaque forwarding to API routes (never direct coupling).

### Example: Illegal vs. Legal

**❌ Illegal (web knows canon):**

```ts
// apps/web/src/app/page.tsx
import { allCanon } from "@/lib/bickford/canon";
```

**✅ Legal (web is generic):**

```ts
// apps/web/src/app/page.tsx
import { allRules } from "@/lib/bickford/ui-data";
```

### Enforcement

- All builds (local, CI, Vercel) are gated by `pnpm run preflight`.
- Violations are blocked with actionable output.
- See `scripts/enforce-web-boundary.ts` for enforcement logic.

### Why?

- Prevents accidental authority/coupling in UI.
- Guarantees separation of powers.
- Ensures green builds are architecturally correct.

---

**If you see a violation, refactor to use generic terms and UI-safe patterns.**
