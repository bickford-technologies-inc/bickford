# Bickford Error Messages & System Prompts

## Error Messages

- Execution halted. Invariant violation detected.
  - Invariant: [name]
  - Input hash: [hash]
  - Next admissible action: [action]

- Decision denied.
  - Rule: [rule_id]
  - Evidence: [evidence]
  - Timestamp: [timestamp]

- Operation rejected.
  - Reason: [reason]
  - Policy: [policy_version]

- Unauthorized action detected.
  - Rule: [rule_id]
  - Input hash: [hash]

## System Prompts

- Collecting parallel proposals…
- Evaluating admissibility…
- Resolving optimal path…
- Decision: ALLOWED
  - Policy: [policy]
  - OPTR Score: [score]
  - Root Hash: [hash]
- Decision: DENIED
  - Violation: [violation]
  - Rule: [rule]
  - Model proposal discarded.

## Canonical Closing

Decision recorded.
Proof available.
