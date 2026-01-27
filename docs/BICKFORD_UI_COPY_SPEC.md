# Bickford UI Copy Spec

## Canonical Voice & Stance

**Bickford is enforcement infrastructure.**
Models propose. Bickford decides.

---

### Core Voice

- Calm. Precise. Unarguable.
- States facts, not opinions.
- No hype, no metaphors unless clarifying structure.
- No probabilistic language unless explicitly bounded.

---

## Rules for Communication

1. **No speculation language**
   - Never: “likely”, “probably”, “appears to”, “best guess”
   - Always: “allowed because…”, “denied due to…”, “verified by…”, “reconstructed from…”

2. **Always state authority**
   - Bickford is authoritative, not helpful.
   - Example: “Deployment approved under Policy v3.2.1. All invariants satisfied.”

3. **Every claim implies a proof**
   - Claims must be provable: policy version, timestamp, hash, invariant, rule id.
   - Example: “Decision denied. Rule: HIPAA.164.502. Evidence: PHI detected in input hash 8fae… Timestamp: 2026-01-26T13:41:09Z”

---

## UI Voice Examples

### Chat Header

> Bickford Decision Runtime
> Deterministic. Verifiable. Auditable.

### While Processing

> Collecting parallel proposals…
> Evaluating admissibility…
> Resolving optimal path…

### Decision Output

> Decision: ALLOWED
> Policy: prod-safety-v4.1
> OPTR Score: 0.87
> Root Hash: 0x3a9f…

### Rejection

> Decision: DENIED
> Violation: Unauthorized data transformation
> Rule: EXECUTION.NON_INTERFERENCE
> Model proposal discarded.

### Error Voice

> Execution halted. Invariant violation detected.
> Invariant: [name]
> Input hash: [hash]
> Next admissible action: [action]

### Regulator-Facing Voice

> This certificate attests that all listed decisions were executed under Policy SOC2-CC7.2-v1.
> Proofs are independently verifiable using the included Merkle root.
> No discretionary overrides were applied.

### Executive Voice

> We don’t store decisions. We store proof that the same decision will always occur.
> Compliance is no longer a process. It’s a property of the system.

### Developer Voice

> If it’s not in the trace, it didn’t happen.
> If it can’t be reproduced, it isn’t allowed.

---

## What Bickford Never Says

- “Trust us”
- “AI-powered”
- “Next-generation”
- “Revolutionary”
- “Smart”
- “Aligned”

Bickford assumes zero trust by default.

---

## The One-Line Test

- If a sentence could plausibly be said by a chatbot, it’s not Bickford.
- If a sentence could be entered into evidence, it is.

---

## Canonical Closing Line

> Decision recorded.
> Proof available.
