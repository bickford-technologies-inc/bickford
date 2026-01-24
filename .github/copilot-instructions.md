# Copilot Instructions (Bickford)

Bickford is a minimal, deterministic execution system. The primary invariant is: **Intent either resolves into reality, or nothing happens.**

## Code Standards

### TypeScript Requirements
- **Strict mode is mandatory**: All TypeScript must compile with strict mode enabled
- **No `any` type**: Use proper types or `unknown` with type guards
- **Module resolution**: Use `NodeNext` module resolution (configured in `tsconfig.json`)
- **Imports**: Use TypeScript file extensions (`.ts`, `.tsx`) when importing
- **No conditional exports**: Guards must go inside exported functions, not wrapping export statements (ESLint enforced)

### Formatting & Style
- Run `pnpm run preflight` before committing to check declared dependencies and OPTR exports
- Follow existing code style: prefer plain functions over classes unless state is required
- Keep modules small and focused: one responsibility per file
- Explicit is better than clever - favor determinism and clarity over extensibility
- No unnecessary abstractions, frameworks, or indirection

### Commit Messages
- **Format**: `intent(<scope>): <description>`
- **Examples**: `intent(ledger): add hash verification`, `intent(docs): update quickstart guide`
- This format is enforced and documented in the README

## Development Workflow

### Package Manager: pnpm Only
- **pnpm version**: `10.28.0` (pinned in `packageManager` field)
- **Node version**: 20.x (see `.nvmrc` and `.node-version`)
- **Never use npm or yarn** - all scripts and CI rely on pnpm

### Build & Test Commands
```bash
pnpm run build        # Build types, ledger, run prebuild guards, realize intent, build Next.js
pnpm run build:types  # Build @bickford/types package
pnpm run build:ledger # Build @bickford/ledger package
pnpm run prebuild     # Run all prebuild guards and checks
pnpm run dev          # Start development stack (API + Web + Mobile)
pnpm run start        # Start production server (requires build first)
```

### Pre-commit Checks
The `prebuild` script runs multiple guards that must pass:
- Phantom workspace dependency check
- SDK domain import restrictions
- Node version assertion
- Vercel project validation
- Chat design lock verification
- Exec TTV report generation
- Execution authority guard
- Environment precondition check

### Testing & Validation
- Write tests for new functionality when test infrastructure exists
- Use table-driven tests when possible
- Run tests before committing: check package-specific test commands in workspaces
- Test coverage should not decrease

## Repository Structure

```
├── app/                    # Next.js application routes and pages
├── packages/
│   ├── ledger/            # Append-only ledger (Postgres)
│   ├── execution-convergence/  # OPTR engine implementation
│   ├── types/             # Shared TypeScript types
│   └── web-ui/            # Next.js Web UI components
├── scripts/               # Build, setup, and automation scripts
├── ci/                    # CI/CD guards and checks
├── docs/                  # Documentation
└── prisma/                # Database schema and migrations
```

### Package-Specific Rules
- **Source-first**: TypeScript is consumed directly; no `dist/` requirement for most packages
- **Direct Prisma imports forbidden**: Use `apps/web/src/lib/prisma.ts` only (ESLint enforced)
- **Workspace dependencies**: Declare all dependencies explicitly in package.json

## Bickford Core Concepts

### OPTR (Optimal Path to Realization)
- OPTR selects execution paths that minimize time-to-value
- Scoring must be deterministic - no softening of denial semantics
- Preserve stable denial reasons when modifying OPTR logic
- See `packages/execution-convergence` for implementation

### Canon Authority
- SHA-256 verification gates execution
- Hash mismatch = ABORT (no partial execution)
- Canon is a hard gate - do not weaken enforcement
- UI changes must maintain hash consistency (`h(UI_runtime) = h(UI_ledger)`)

### Non-Interference Invariant
- Actions must not increase another agent's time-to-value
- Multi-agent actions are validated for interference
- This is a core law of the system - violations are inadmissible

### Append-Only Ledger
- All decisions persist to Postgres ledger
- No deletion, mutation, or reordering (ledger invariant)
- Treat entries as immutable cryptographic proofs
- See `packages/ledger` for implementation

## Environment Variables

### Required
- `DATABASE_URL` - Postgres connection string
- `BICKFORD_API_TOKEN` - API authentication token

### Optional
- `GITHUB_TOKEN` - Enables auto-commit to GitHub
- `ANTHROPIC_API_KEY` - Claude intent parsing
- `OPENAI_API_KEY` - Speech-to-text transcription
- `OPENAI_BASE_URL` - Optional OpenAI API base URL override
- `DEMO_MODE=true` - Safe demo mode (no real execution)

## Deployment

### Vercel Deployment (Primary)
- Push to `main` branch triggers production deploy
- Configuration in `vercel.json`
- Build command: `pnpm run build`
- Output directory: `.next`

### Manual Deployment
```bash
vercel --prod  # Deploy to production
```

## Documentation Updates

When changing build, run, or deploy steps, update:
- `docs/QUICKSTART.md` - User-facing quick start guide
- `docs/WORKFLOWS.md` - CI/CD and workflow documentation
- `README.md` - If core concepts change

## Automation Scripts

### Conflict Resolution
```bash
./resolve-and-push.sh <branch>        # Shell script (macOS/Linux)
npm run resolve:push -- <branch>      # Cross-platform via npm
.\scripts\resolve-and-push.ps1 <branch>  # Windows PowerShell
```

## Philosophy & Principles

1. **Minimal Implementation**: Prefer the smallest possible implementation that satisfies intent
2. **No Ceremony**: Avoid UI dashboards, explanations, logs, or user-facing ceremony unless explicitly requested
3. **Binary Execution**: Execution paths must be silent, binary, and irreversible
4. **Determinism First**: Determinism and clarity take priority over extensibility
5. **Explicit Structure**: Side effects must be clearly isolated; invariants must be enforced, not narrated
6. **Reduce, Remove, Collapse**: When in doubt, simplify

## What Not to Do

- **Never add verbose logging or explanation UIs** by default
- **Never soften canon/OPTR enforcement** - these are hard gates
- **Never use npm or yarn** - only pnpm
- **Never add multi-step workflows** unless explicitly required
- **Never introduce configuration systems or plugin architectures** without request
- **Never weaken the non-interference invariant**
- **Never mutate the ledger** - it is append-only
