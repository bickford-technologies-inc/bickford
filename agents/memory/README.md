# Memory Agent

## Responsibility

- Capture ephemeral observations from any agent
- Promote memory only when invariant-safe
- Provide deterministic recall for other agents

## Rules

- Append-only
- No mutation
- Promotion requires invariants
- Canon memory is immutable

## Consumers

- Planner agent
- Execution agent
- CI / Preflight agent
