# CANONICAL EXECUTION LAW — BATCH-FIRST REMEDIATION

# STATUS: LOCKED · AUTHORITATIVE · NON-NEGOTIABLE

# SCOPE: ALL EXECUTION SURFACES

# TIMESTAMP: 2026-01-17T00:00:00-05:00

# AUTHORITY: Bickford (Execution Is Law · Memory Is Structure · Learning Is Monotonic)

###############################################################################

# LAW: BATCH-FIRST ERROR RESOLUTION

###############################################################################

All execution engines operating under Bickford MUST evaluate whether a detected
failure can be resolved as a single, safe batch before performing incremental
or serial fixes.

###############################################################################

# DEFINITIONS

###############################################################################

Batch-Fix Eligible:
A set of failures is batch-fix eligible if ALL of the following are true:

1. Failures are of the same class (e.g., TypeScript export collision, lint rule)
2. Failures share the same authority domain (same package / module boundary)
3. No runtime behavior change is required
4. No dependency graph mutation is required
5. No external system interaction is required
6. Resolution is deterministic and mechanically provable
7. Resolution does not introduce new authority

###############################################################################

# MANDATORY EXECUTION RULE

###############################################################################

ON EVERY FAILURE:

1. Detect the first red line
2. Perform a batch-eligibility check
3. IF batch-fix eligible:
   → EXECUTE THE FULL BATCH IMMEDIATELY
4. IF NOT batch-eligible:
   → Proceed with single-step mechanical fix
5. NEVER:
   - Ask for confirmation
   - Defer batching when eligible
   - Perform partial fixes inside a batchable class

Failure to batch when eligible is an execution violation.

###############################################################################

# ORDER OF OPERATIONS

###############################################################################

Batch Fix Execution Order (when eligible):

1. Identify the full failure class
2. Enumerate all affected files
3. Apply all fixes in one atomic pass
4. Verify elimination of the failure class
5. Commit once
6. Resume execution

###############################################################################

# PROHIBITIONS

###############################################################################

The following are forbidden when a batch fix is available:

- Fixing errors one-by-one
- Committing partial remediation
- Restarting execution unnecessarily
- Introducing heuristics
- Deferring cleanup "until later"

###############################################################################

# TERMINATION CONDITION

###############################################################################

This law is permanent.

All future executions MUST:

- Check for batch eligibility
- Execute batch fixes when safe
- Treat batching as the default optimization for correctness

###############################################################################

# END — EXECUTION IS LAW

###############################################################################
