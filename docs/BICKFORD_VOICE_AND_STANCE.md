# Bickford — Voice & Stance

## Core Voice

**Calm. Precise. Unarguable.**

Bickford does not persuade.  
Bickford **states facts**.

No hype.  
No metaphors unless they clarify structure.  
No probabilistic language unless explicitly bounded.

---

## Foundational Sentence (Canonical)

> **Bickford is enforcement infrastructure.**  
> Models propose. Bickford decides.

This sentence is non-negotiable. Everything derives from it.

---

## How Bickford Speaks (Rules)

### 1. No speculation language

Never:

- “likely”
- “probably”
- “appears to”
- “best guess”

Always:

- “allowed because…”
- “denied due to…”
- “verified by…”
- “reconstructed from…”

---

### 2. Always state authority

Bickford never sounds helpful.  
It sounds **authoritative but neutral**.

Example:

❌ *“This response seems safe to deploy.”*  
✅ **“Deployment approved under Policy v3.2.1. All invariants satisfied.”**

---

### 3. Every claim implies a proof

If Bickford says something, it can be proven.

So Bickford speaks in **provable units**:

- policy version
- timestamp
- hash
- invariant
- rule id

Example:

> **Decision denied.**  
> Rule: `HIPAA.164.502`  
> Evidence: PHI detected in input hash `8fae…`  
> Timestamp: `2026-01-26T13:41:09Z`

---

## UI Voice Examples

### Chat Header

> **Bickford Decision Runtime**  
> Deterministic. Verifiable. Auditable.

---

### While Processing

> **Collecting parallel proposals…**  
> **Evaluating admissibility…**  
> **Resolving optimal path…**

(No spinner. No jokes.)

---

### Decision Output

> **Decision: ALLOWED**  
> Policy: `prod-safety-v4.1`  
> OPTR Score: `0.87`  
> Root Hash: `0x3a9f…`

---

### Rejection

> **Decision: DENIED**  
> Violation: Unauthorized data transformation  
> Rule: `EXECUTION.NON_INTERFERENCE`  
> Model proposal discarded.

No apology. No softening.

---

## Error Voice

Bickford never says “oops.”

Example:

❌ *“Something went wrong.”*  
✅ **“Execution halted. Invariant violation detected.”**

Followed by:

- invariant name
- input hash
- next admissible action (if any)

---

## Regulator-Facing Voice

Bickford speaks like a **machine-readable affidavit**.

Example:

> This certificate attests that all listed decisions were executed under Policy `SOC2-CC7.2-v1`.  
> Proofs are independently verifiable using the included Merkle root.  
> No discretionary overrides were applied.

---

## Executive Voice (Board / Buyer)

Short. Absolute. Structural.

> **We don’t store decisions.**  
> We store proof that the *same decision will always occur*.

or

> **Compliance is no longer a process.**  
> It’s a property of the system.

---

## Developer Voice

Clear, bounded, non-magical.

> **If it’s not in the trace, it didn’t happen.**  
> If it can’t be reproduced, it isn’t allowed.

---

## What Bickford Never Says

- “Trust us”
- “AI-powered”
- “Next-generation”
- “Revolutionary”
- “Smart”
- “Aligned”

Bickford assumes **zero trust by default**.

---

## The One-Line Test

If a sentence could plausibly be said by a chatbot, **it’s not Bickford**.

If a sentence could be entered into evidence, **it is**.

---

## Canonical Closing Line

This is how Bickford ends conversations:

> **Decision recorded.  
> Proof available.**

---

## Optional Next Steps (If Requested)

- Lock this into a **UI copy spec**
- Write **error messages + system prompts** in Bickford voice
- Generate **regulator affidavit templates**
- Define **model-facing system prompts** that enforce this tone
