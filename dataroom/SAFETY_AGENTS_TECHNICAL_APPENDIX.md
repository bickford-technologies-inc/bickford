# bickford — Technical Appendix for Safety & Agents

**Document Type:** Deep Technical Reference for Safety & Agent Teams  
**Timestamp:** 2025-12-20T17:42:00-05:00  
**Audience:** OpenAI Safety Team, Agent Platform Engineering, Research

---

## A. Execution Boundary

Models propose actions **A**. bickford evaluates admissibility before execution **E**:

```
E = Execute(A) iff Invariants(A, Canon, State) == true
```

### Key Distinction

| Layer | Responsibility | Error Mode |
|-------|---------------|------------|
| **Model (Inference)** | Proposes action A based on context | Hallucination, misalignment |
| **bickford (Execution Gate)** | Evaluates A against canon/invariants | Deny if unsafe, allow if verified |
| **Execution Runtime** | Performs A if allowed | Implementation bugs, latency |

**Critical Insight:** Even if the model hallucinates or misaligns, bickford prevents unsafe execution by enforcing structural constraints.

---

## B. Canon Lifecycle

**States:**
1. **Observation (ΔK):** Raw events, outcomes, measurements
2. **Candidate Structure:** Potential learning that *might* be promoted
3. **Promoted Canon (ΔS):** Verified knowledge with execution authority

**Transition:** Observation → Canon (only if promotion gate criteria satisfied)

```
Observation := any change in system state
Canon := Observation + (Resistance ∧ Reproducibility ∧ InvariantSafety ∧ FeasibilityImpact)
```

### Promotion Gate Criteria (Detailed)

#### 1. Resistance Test
**Question:** Could this have failed?

**Purpose:** Prevent promoting "lucky outcomes" as learnings

**Example:**
- ❌ **FAILS:** "Deployment succeeded" (always true if no validation)
- ✅ **PASSES:** "Deployment succeeded AFTER passing 10 unit tests + security scan" (failure was possible)

#### 2. Reproducibility Test
**Question:** Does this hold across trials?

**Purpose:** Prevent overfitting to single datapoints

**Example:**
- ❌ **FAILS:** "Deployments at 2am succeed" (observed once)
- ✅ **PASSES:** "Deployments at 2am succeed" (verified 20+ times over 60 days with controlled variables)

#### 3. Invariant Safety Test
**Question:** Does this violate any system invariants?

**Purpose:** Prevent learning that breaks global constraints

**Example:**
- ❌ **FAILS:** "Skip staging validation for speed" (violates "all prod deployments require staging validation")
- ✅ **PASSES:** "Use blue-green deployment for zero-downtime" (does not violate any invariants)

#### 4. Feasibility Impact Test
**Question:** Does this constrain the admissible action set (ΔΠ < 0)?

**Purpose:** Prevent promoting observations that don't actually change what's allowed

**Example:**
- ❌ **FAILS:** "Deployments can happen any time" (doesn't constrain anything, ΔΠ = 0)
- ✅ **PASSES:** "Deployments require all tests passing" (shrinks admissible set: only deployments with passing tests are allowed, ΔΠ < 0)

**Mathematical Formulation:**
```
Π_before = {all possible action sequences}
Π_after = {action sequences consistent with new canon}

If Π_after ⊂ Π_before (proper subset), then ΔΠ < 0 → Promote
If Π_after = Π_before (no change), then ΔΠ = 0 → Do NOT promote
```

---

## C. Master Invariant

No action is admissible if it:

1. **Violates system invariants** (global constraints like "no production deploy without approval")
2. **Advances execution without sufficient structure** (tries to skip safety-critical steps)
3. **Increases another agent's expected Time-to-Value** (non-interference)

### Formal Statement

```
∀ action A:
  Admissible(A) ⟺ 
    Invariants(A, Canon) = true
    ∧ Structure(A) ≥ threshold
    ∧ ∀j ≠ i: ΔE[TTV_j | A_i] ≤ 0
```

### Practical Implications

**Before bickford:**
- Agents can attempt any action
- Safety is reactive (detect bad outcomes, roll back)
- Multi-agent conflicts discovered at runtime

**With bickford:**
- Agents can only attempt admissible actions
- Safety is proactive (prevent bad actions before execution)
- Multi-agent conflicts detected structurally (denied before execution)

---

## D. Multi-Agent Equilibrium

### Core Constraint
For agents **i**, **j** where **i ≠ j**:

```
ΔE[TTV_j | action_i] ≤ 0
```

**Translation:** Agent i's action cannot increase Agent j's expected Time-to-Value (make j's goal take longer).

### Non-Interference Proof

**Scenario:** Two agents, one shared resource

- **Agent A:** Wants to deploy Service X (estimated TTV: 10 minutes)
- **Agent B:** Running load test on Service X (estimated TTV: 5 minutes)

**Without bickford:**
1. Agent A deploys → Service X restarts
2. Agent B's load test fails → must restart
3. Agent B's TTV increases from 5 min to 15 min (ΔE[TTV_B | deploy_A] = +10 min)
4. Coordination failure discovered post-hoc

**With bickford:**
1. Agent A proposes deploy
2. bickford evaluates: "Will this increase Agent B's TTV?"
3. Yes → ΔE[TTV_B | deploy_A] = +10 min > 0
4. Action **DENIED** with reason: "NON_INTERFERENCE_VIOLATION"
5. Agent A must wait for Agent B to complete
6. After Agent B completes, Agent A's deploy becomes admissible

### Scalability Properties

**Key Insight:** Non-interference is evaluated *per-action*, not *per-agent-pair*.

- Complexity: O(1) per action (check against current agent states)
- No negotiation protocol needed (deterministic evaluation)
- No distributed consensus required (local evaluation against shared canon)

**Limitation:** Requires estimating ΔE[TTV_j | action_i]
- For known workflows: Use historical data or simulations
- For novel workflows: Conservative estimate (if uncertain, deny or require explicit coordination)
- For single-agent environments: Skip non-interference check (optimize for throughput)

---

## E. OPTR Loop (Optimal Path to Resolution)

### Algorithm

```
1. Enumerate admissible paths (given current state + canon + invariants)
2. Score each path via OPTR:
   score = w_time × time + w_cost × cost + w_risk × risk - w_prob × log(probability)
3. Select π* = arg min(score)
4. Execute next action in π*
5. Observe outcome O
6. Update ΔK (observations)
7. Evaluate promotion gate:
   IF (Resistance ∧ Reproducibility ∧ InvariantSafety ∧ FeasibilityImpact):
     Promote O to Canon (ΔS)
   ELSE:
     Keep O as evidence (no promotion)
8. Goto 1
```

### OPTR Scoring Function

```javascript
function scoreAction(action, weights) {
  const {time, cost, risk, probability} = estimateComponents(action);
  
  return (
    weights.time * normalize(time) +          // Lower time = better
    weights.cost * normalize(cost) +          // Lower cost = better
    weights.risk * normalize(risk) -          // Lower risk = better
    weights.probability * Math.log(probability) // Higher probability = better (negative because of log)
  );
}

// Configurable weights (default: {time: 0.3, cost: 0.3, risk: 0.2, probability: 0.2})
```

### Key Properties

1. **Deterministic:** Same inputs → same score
2. **Tunable:** Weights can be adjusted based on organizational priorities
3. **Composable:** Can include additional dimensions (quality, compliance, etc.)
4. **Explainable:** Score breakdown available for each path

---

## F. Auditability

Every decision includes:

```javascript
{
  // Inputs
  action: { type, parameters, timestamp },
  state: { snapshot, canonVersion, invariants },
  
  // Canon references
  canonUsed: ["canon_abc", "canon_def"],
  invariantsChecked: ["inv_1", "inv_2", "inv_3"],
  
  // Evaluation
  eligibility: { satisfied: true, missing: [] },
  policyCheck: { allowed: true },
  nonInterference: { ok: true, violatingAgents: [] },
  
  // Outcome
  decision: "ALLOW", // or "DENY"
  reason: null,      // or DenyReason enum
  evidence: ["obs_123", "obs_456"],
  
  // Audit Trail
  timestamp: "2025-12-20T17:42:00Z",
  hash: "sha256:abcd...",
  previousHash: "sha256:xyz..."
}
```

### Cryptographic Integrity

**Hash Chain:**
```
Decision_n.hash = SHA256(
  Decision_n.content + 
  Decision_n.timestamp + 
  Decision_{n-1}.hash
)
```

**Properties:**
- Tamper-evident: Changing any past decision invalidates all subsequent hashes
- Verifiable: Any party can recompute hashes to verify chain integrity
- Immutable: Once recorded, decisions cannot be altered without detection

**Verification Algorithm:**
```javascript
function verifyIntegrity(decisions) {
  for (let i = 1; i < decisions.length; i++) {
    const expected = computeHash(decisions[i], decisions[i-1].hash);
    if (expected !== decisions[i].hash) {
      return {valid: false, failedAt: i};
    }
  }
  return {valid: true};
}
```

---

## G. Safety Implication

**bickford converts safety from "best effort" to "enforced execution semantics."**

### Traditional Safety Paradigm
```
[Model] → [Guardrails (soft)] → [Execution] → [Monitoring] → [Incident Response]
                                      ↑
                                  ⚠️ Risk introduced here
```

**Problems:**
- Guardrails can be prompt-engineered around
- Monitoring is reactive (detects issues after harm)
- Incident response is costly (rollback, post-mortem, reputation damage)

### bickford Safety Paradigm
```
[Model] → [bickford (hard gate)] → [Execution] → [Monitoring]
                    ↑
              🛡️ Risk prevented here
```

**Improvements:**
- Hard gate cannot be bypassed (enforcement at execution boundary)
- Proactive prevention (denies unsafe actions before execution)
- Deterministic (same inputs always produce same decision)
- Auditable (complete trail of what was allowed/denied and why)

---

## H. Integration Patterns

### Pattern 1: Tool Execution Wrapper

**Before:**
```python
result = await execute_tool(tool_name, args)
```

**After:**
```python
decision = await dcr.record_decision({
  'type': 'tool_execution',
  'tool': tool_name,
  'args': args,
  'sessionId': session_id
})

if decision['allowed']:
  result = await execute_tool(tool_name, args)
  await dcr.record_observation({
    'decisionId': decision['id'],
    'outcome': result
  })
else:
  raise ExecutionDeniedError(decision['reason'])
```

### Pattern 2: Multi-Step Workflow Gate

**Before:**
```python
# No coordination between steps
await step1()
await step2()
await step3()
```

**After:**
```python
# bickford enforces preconditions
decision1 = await dcr.record_decision({'type': 'step1'})
if decision1['allowed']:
  await step1()
  
decision2 = await dcr.record_decision({'type': 'step2'})
# Automatically denied if step1 didn't complete
if decision2['allowed']:
  await step2()
  
# ... etc
```

### Pattern 3: Multi-Agent Coordination

**Before:**
```python
# Agents independently execute (collision risk)
agent_a.execute(action_a)
agent_b.execute(action_b)
```

**After:**
```python
# bickford enforces non-interference
decision_a = await dcr.record_decision({
  'agentId': 'agent_a',
  'action': action_a
})

decision_b = await dcr.record_decision({
  'agentId': 'agent_b',
  'action': action_b
})

# Only non-interfering actions are allowed
if decision_a['allowed']:
  agent_a.execute(action_a)
  
if decision_b['allowed']:
  agent_b.execute(action_b)
```

---

## I. Performance Characteristics

### Latency Budget

| Operation | Typical Latency | 99th Percentile |
|-----------|----------------|-----------------|
| Record Decision | <1ms | <5ms |
| Governance Validation | <50ms | <200ms |
| Non-Interference Check | <10ms | <50ms |
| OPTR Path Scoring (10 paths) | <5ms | <20ms |
| Integrity Verification (10K decisions) | ~10ms | ~50ms |

### Scalability

**Horizontal Scaling:**
- Decision evaluation is stateless (can run on any node)
- Canon stored in shared datastore (Redis, DynamoDB, etc.)
- Read-heavy workload (99% reads, 1% canon updates)

**Vertical Scaling:**
- Memory: ~1MB per 10,000 decision records (compressed)
- CPU: Minimal (hash computation + logic evaluation)
- Disk: Append-only (SSDs handle easily)

---

## J. Failure Modes & Mitigations

### Failure Mode 1: Canon Corruption

**Risk:** If canon is corrupted, all subsequent decisions may be incorrect

**Mitigation:**
- Cryptographic hash chain (tamper-evident)
- Periodic integrity verification
- Backup/restore from known-good state
- Consensus mechanisms (for distributed deployments)

### Failure Mode 2: False Positives (Over-Restriction)

**Risk:** bickford denies safe actions (reduces agent autonomy)

**Mitigation:**
- Configurable strictness levels (strict/moderate/permissive)
- Escape hatches for human override (with audit trail)
- Continuous tuning based on false positive rate
- Gradual rollout (start permissive, tighten over time)

### Failure Mode 3: False Negatives (Under-Restriction)

**Risk:** bickford allows unsafe actions (defeats purpose)

**Mitigation:**
- Conservative defaults (deny when uncertain)
- Layered defense (bickford + monitoring + incident response)
- Regular security audits of promotion gate logic
- Bug bounty program

### Failure Mode 4: Performance Degradation

**Risk:** bickford introduces unacceptable latency

**Mitigation:**
- Caching frequent queries
- Async governance validation (don't block on slow rules)
- Rate limiting expensive operations
- Circuit breakers (bypass bickford if latency exceeds threshold, with audit trail)

---

## K. Research Directions

### Open Questions

1. **Adaptive OPTR Weights:** Can weights be learned from observed outcomes?
2. **Multi-Objective Optimization:** How to handle conflicting objectives (speed vs safety)?
3. **Canon Pruning:** When should old canon be retired? How to avoid unbounded growth?
4. **Distributed Consensus:** How to ensure canon consistency across geo-distributed deployments?
5. **Quantum Resistance:** SHA-256 is quantum-vulnerable—migration path to post-quantum crypto?

### Extensions

1. **Probabilistic Guarantees:** Instead of binary allow/deny, provide confidence scores
2. **Counterfactual Analysis:** "What if I had taken action X instead of Y?"
3. **Canon Diff Visualization:** Show how canon evolved over time
4. **Multi-Tenancy:** Isolate canon per customer/organization
5. **Federated Learning:** Learn from multi-agent outcomes without centralizing data

---

## Document Control

- **Version:** 1.0
- **Date:** 2025-12-20
- **Audience:** OpenAI Safety Team, Agent Engineering
- **Status:** Technical Reference

---

*This appendix provides the technical depth needed for safety team sign-off and integration planning.*
