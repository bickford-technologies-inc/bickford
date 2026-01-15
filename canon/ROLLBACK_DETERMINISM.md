# Rollback Determinism

All state-changing actions declare deterministic rollback paths.

Properties:

- artifact lineage preserved
- rollback decisions audited
- no code execution during rollback
- schema restored via forward migrations

Result:
The system can always return to a known-good state with proof.
