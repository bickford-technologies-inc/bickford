# Benchmarking Best-in-Class Capability and Performance

Bickford benchmarks against best-in-class capability and performance targets, then **compounds** the gap analysis into deterministic remediation work. This document defines the benchmark inputs, the gap report output, and the remediation loop that keeps OPTR Time-to-Value at peak performance.

## Why this exists

- **Benchmark best in class** capability and performance.
- **Identify gaps** against Bickford’s current state.
- **Fix gaps** by assigning owners, targets, and deterministic remediation steps.
- **Compound continuously** by re-running after each remediation.

## Inputs

Benchmark inputs live in `benchmarks/`:

- `benchmarks/best-in-class.json` — best-in-class targets by capability.
- `benchmarks/bickford-capabilities.json` — current Bickford snapshot.

Each capability is defined by:

- `id`: stable identifier (used for diffing).
- `metric`: human-readable name.
- `target`: best-in-class target value.
- `unit`: unit for the target.
- `evidence`: evidence expected to prove attainment.

## Output

Run the benchmark gap detector:

```bash
node scripts/benchmark-gaps.mjs
```

This generates:

- `artifacts/benchmark-gaps.json`
- `artifacts/benchmark-gaps.md`

These artifacts are append-only reports to guide remediation work and measure compounding improvements over time.

## Gap Remediation Loop

1. **Benchmark** best-in-class targets.
2. **Identify gaps** via the generated report.
3. **Assign owners** in `benchmarks/bickford-capabilities.json`.
4. **Execute deterministic fixes** for each gap.
5. **Re-run** the benchmark to confirm closure.

## Continuous Compounding

Every remediation cycle updates the baseline and shrinks the gap surface area. This keeps execution aligned with OPTR Time-to-Value and prevents regression or drift.

## Updating the Baseline

When new best-in-class targets are available, update `benchmarks/best-in-class.json` and re-run the benchmark report to refresh the gap surface.
