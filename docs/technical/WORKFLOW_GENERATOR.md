# Define: workflow generator

A **workflow generator** is a structured capability that turns a declared intent into a concrete, executable workflow specification. It accepts a target outcome, constraints, and authority boundaries, then outputs a repeatable workflow definition that can be executed, audited, and continuously improved.

## Purpose

- Convert intent into a standardized workflow blueprint that can be executed by humans, agents, or systems.
- Ensure every workflow is constraint-aware, authority-bound, and ledger-ready.
- Reduce time-to-value by making workflows explicit, reusable, and testable.

## Inputs

- **Intent**: target outcome, constraints, authority set, and declaration timestamp.
- **Knowledge state**: structural references, schemas, invariants, and prior workflow baselines.
- **Policy bounds**: admissible actions and guardrails derived from constraints.
- **Execution context**: environment, tools, and operational dependencies.

## Outputs

- **Workflow definition**: ordered steps with inputs/outputs, roles, and decision points.
- **Execution contract**: constraints, authority signatures, and admissible actions.
- **Audit artifacts**: ledger hooks, evidence pointers, and replay metadata.
- **Test plan**: validation checks that confirm the workflow fulfills intent and constraints.

## Generator stages

1. **Intent normalization** → parse the declared outcome and constraints.
2. **Constraint binding** → map constraints to enforceable gates and policies.
3. **Structure synthesis** → build the workflow steps, handoffs, and required artifacts.
4. **Execution packaging** → attach authority, evidence, and ledger hooks.
5. **Validation design** → define tests that prove the workflow meets intent.

## Testing expectations

A workflow generator is only complete when its output is tested. At minimum:

- **Contract checks**: verify constraints and authority signatures are enforced.
- **Execution checks**: simulate or run the workflow steps end-to-end.
- **Audit checks**: confirm ledger entries and evidence pointers are recorded.
- **Regression checks**: ensure updated workflows do not break prior guarantees.

## Example (compact)

**Intent**: "Ship a compliance-ready incident response workflow in 48 hours."

**Generated workflow**:

- Intake → classify incident severity → assign authority → execute runbook → collect evidence → ledger entry → postmortem.

**Tests**:

- Verify authority gates before execution.
- Verify evidence bundle exists before closure.
- Verify ledger entry hash matches evidence manifest.
