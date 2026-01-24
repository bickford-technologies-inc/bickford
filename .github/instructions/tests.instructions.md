---
applyTo: "**/*.{test,spec}.{ts,tsx}"
---

# Test File Instructions

## Testing Framework
- Use Jest for unit tests (configured in `jest.config.js`)
- Follow existing test patterns in the repository
- Tests may use custom assertion helpers or standard Jest matchers

## Test File Naming
- Unit tests: `*.test.ts` or `*.spec.ts`
- Integration tests: `*.spec.ts`
- Place tests in `tests/` directory at package root or repo root

## Test Structure

### Custom Assertion Pattern
Some tests use custom `assert()` functions with pass/fail tracking:
```typescript
let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.log(`  ✗ ${message}`);
    failed++;
  }
}
```

### Jest Pattern
```typescript
describe("Feature name", () => {
  it("should behave as expected", () => {
    expect(result).toBeDefined();
  });
});
```

## Test Requirements

### What to Test
- **Canon contract compliance**: Decisions must match canonical shape
- **Determinism**: Hash outputs must be consistent for same inputs
- **Invariants**: OPTR scoring, non-interference, ledger immutability
- **Execution closures**: Context sealing, token proofs, chat item finalization
- **Type contracts**: Ensure types from `@bickford/types` are properly satisfied

### Test Organization
- Group related tests in `describe()` blocks
- Use descriptive test names that explain the behavior being verified
- Test both success and failure paths
- Verify error messages and denial reasons are stable

### Imports
- Use package aliases: `@bickford/types`, `@bickford/ledger`
- Import from source TypeScript files when testing internal logic
- Follow the same import restrictions as production code (no direct Prisma imports)

## Coverage Requirements
- New features should include unit tests
- Test coverage must not decrease
- Focus on testing core invariants and contracts

## Running Tests
```bash
# Run all tests
pnpm test

# Run tests in specific package
pnpm --filter @bickford/ledger test
```

## Bickford-Specific Test Concerns

### Determinism
- All hash computations must be deterministic
- Test that repeated operations produce identical results
- Verify timestamp-dependent logic behaves correctly

### Canon Compliance
- Test that decisions follow canonical structure
- Verify denial reasons are stable and match defined codes
- Ensure OPTR scoring is consistent

### Ledger Invariants
- Append-only behavior (no mutation or deletion)
- Hash chain integrity
- Proof verification

### Non-Interference
- Multi-agent action validation
- Time-to-value impact calculations
