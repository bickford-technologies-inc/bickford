# Agent Operating Rules — Bickford

AGENTS MUST:

- Detect recurring failures
- Propose new invariants
- NEVER submit repeated local patches

WHEN A FIX APPEARS TWICE:

- STOP
- ESCALATE TO CANON
- PROPOSE INVARIANT

VALID OUTPUTS:

- Invariant proposal
- Enforcement script
- Auto-repair logic

INVALID OUTPUTS:

- One-off patches
- Silent workarounds
- Local-only fixes

TYPE DRIFT RULE:
If a build fails due to missing exported symbols:

- DO NOT recreate types
- DO NOT shim
- DO NOT patch locally

REQUIRED:

- Identify canonical authority
- Align consumer to canon
- Propose invariant if pattern repeats
