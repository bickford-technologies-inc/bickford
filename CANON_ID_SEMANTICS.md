# ID Semantics & Identity Law (Bickford Canon v1.1)

## Canonical Law (Authoritative Wording)

> **ID Semantics & Identity Law**
>
> Generated IDs (`generateId`, `createIdGenerator`) identify _ephemeral UI and runtime events only_.
>
> Cryptographic hashes identify _decisions, executions, and audit artifacts_.
>
> Execution authority MUST bind exclusively to hash identities.
>
> No randomly generated identifier may participate in execution, approval, or audit linkage.

---

## Enforcement Examples

### ✅ Allowed

- `UIMessage.id` generated with `generateId` or `createIdGenerator` (for rendering/streaming only)
- `toolCallId`, `stepId` generated for ephemeral runtime use
- `DecisionTrace.hash` computed as SHA-256 of canonical JSON (for all authority, audit, and execution linkage)

### ❌ Forbidden

- Using `generateId` or `createIdGenerator` for any DecisionTrace, execution, or audit artifact identity
- Linking execution, approval, or audit to a random/generator-based ID
- Using UI or runtime IDs as proof of authority

---

## Explicit Non-Compliance Cases

- Any code that uses a random/generator-based ID for a DecisionTrace, execution, or audit artifact is non-compliant and must be rejected at review.
- Any schema that allows a non-hash ID to be used for authority is non-compliant.
- Any approval or execution logic that binds to a non-hash ID is non-compliant.

---

## Machine-Checkable Invariant

- All authority, execution, and audit linkage must be by hash (SHA-256 of canonical JSON or equivalent deterministic serialization).
- All ephemeral UI/runtime events may use generated IDs, but these must never be used for authority.

---

## Promotion-Ready (Canon v1.1)

This law is:

- Deterministic
- Enforceable
- Machine-checkable
- Regulator-legible

**Execution binds only to hashes.**
