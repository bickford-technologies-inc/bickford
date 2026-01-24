---
applyTo: "packages/**/*.{ts,tsx}"
---

# Package Development Instructions

## Package Structure

Each package in `packages/` follows a consistent structure:
```
packages/<package-name>/
├── src/           # Source TypeScript files
├── dist/          # Compiled output (if built)
├── tests/         # Package-specific tests
└── package.json   # Package manifest
```

## Package-Specific Guidelines

### @bickford/types
- **Purpose**: Shared TypeScript type definitions
- **Key types**: `Decision`, `Intent`, `ExecutionContext`, `ChatItem`
- **Rules**:
  - All types must be exported from `src/index.ts`
  - Use explicit exports (no `export *` unless necessary)
  - Types should be minimal and focused
  - Avoid coupling to implementation details

### @bickford/ledger
- **Purpose**: Append-only decision ledger with Postgres persistence
- **Key exports**: Ledger operations, proof generation, hash chain logic
- **Rules**:
  - All ledger operations must be immutable (append-only)
  - Hash chain integrity is critical - test thoroughly
  - No direct Prisma client usage outside designated files
  - All mutations must generate proofs

### @bickford/execution-convergence
- **Purpose**: OPTR engine - optimizes execution paths to minimize time-to-value
- **Key exports**: Path scoring, constraint application, convergence logic
- **Rules**:
  - Scoring must be deterministic
  - Denial reasons must be stable (don't change error messages arbitrarily)
  - Non-interference invariant must be enforced
  - All constraints must be validated before execution

### @bickford/web-ui
- **Purpose**: Next.js UI components and pages
- **Rules**:
  - Follow Next.js best practices
  - UI changes must maintain hash consistency with ledger
  - Prefer server components over client components when possible
  - All API calls should use defined endpoints

## Cross-Package Dependencies

### Import Rules
- Use package aliases: `import { Decision } from "@bickford/types"`
- Never import across package boundaries except through published exports
- Declare all dependencies explicitly in each package's `package.json`

### Workspace Dependencies
```json
{
  "dependencies": {
    "@bickford/types": "workspace:*",
    "@bickford/ledger": "workspace:*"
  }
}
```

## Building Packages

### Source-First Approach
Most packages are consumed as TypeScript source, not compiled:
- TypeScript files are imported directly
- No build step required for development
- `dist/` directories may not exist for all packages

### Built Packages
Some packages require compilation:
```bash
pnpm run build:types   # Build @bickford/types
pnpm run build:ledger  # Build @bickford/ledger
```

## Package Development Workflow

1. **Make changes** in `packages/<name>/src/`
2. **Update exports** in `src/index.ts` if adding new public APIs
3. **Add tests** in `tests/` directory
4. **Run package tests**: `pnpm --filter <package-name> test`
5. **Update types** in `@bickford/types` if adding new shared types

## Common Patterns

### Exporting Functions
```typescript
// src/feature.ts
export function processIntent(intent: string): Decision {
  // implementation
}

// src/index.ts
export { processIntent } from "./feature.js";
```

### Type-Only Exports
```typescript
export type { Decision, Intent } from "./types.js";
```

### Conditional Logic (Avoid in Exports)
```typescript
// ❌ WRONG - conditional exports are forbidden
if (condition) {
  export const feature = implementation;
}

// ✅ CORRECT - guards inside exported function
export const feature = (input: Input) => {
  if (!condition) {
    throw new Error("Precondition failed");
  }
  return implementation(input);
};
```

## Validation
- Run `pnpm run preflight` to check:
  - All dependencies are properly declared
  - OPTR exports are present
  - No phantom workspace dependencies
  - No SDK domain import violations
