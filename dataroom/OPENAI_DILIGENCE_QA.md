# OpenAI Diligence Q&A — bickford

**Document Type:** Pre-Answered Diligence Questions  
**Timestamp:** 2025-12-20T17:42:00-05:00  
**Purpose:** Accelerate OpenAI Technical & Strategic Due Diligence

---

## 1. What problem does bickford solve?

**Execution risk as agents move from recommendation to action.** 

bickford enforces admissibility between inference and execution, preventing unsafe sequencing, false learning, and multi-agent interference.

**Concrete Example:** An agent proposes deploying v2.0 to production. bickford checks: Have all staging validations passed? Are dependencies resolved? Will this impact other agents' workstreams? Only then does execution proceed.

---

## 2. Where does it sit in the stack?

**Post-inference, pre-execution.** 

It does not touch model weights, prompts, or training pipelines.

**Stack Position:**
```
Model → Inference → bickford (Execution Gate) → Action Execution → Real World
```

bickford sits at the tool invocation boundary—after the model decides "what to do" but before any state changes occur.

---

## 3. Is this a policy engine?

**No. Policies are declarative; bickford is an execution authority that deterministically allows/denies actions at runtime.**

**Difference:**
- **Policy Engine:** "Deployments require 2 approvals" (describes rule)
- **bickford:** "This deployment is DENIED because only 1 approval exists" (enforces rule + provides proof)

bickford evaluates current state against accumulated canon and invariants, then makes a binary execution decision.

---

## 4. How is this different from guardrails or evaluators?

**Guardrails score; bickford decides. Evaluators observe; bickford enforces.**

**Comparison:**

| System | When It Acts | Output | Can Be Bypassed? |
|--------|-------------|---------|------------------|
| **Guardrails** | During generation | Confidence score | Yes (soft gates) |
| **Evaluators** | After execution | Pass/fail assessment | N/A (post-hoc) |
| **bickford** | Before execution | Allow/Deny + proof | No (hard gate) |

Guardrails and evals are observability tools. bickford is an enforcement mechanism.

---

## 5. Does it collect or store user data?

**No user data required. Decisions, constraints, and proofs only.**

**Data Model:**
- **Stored:** Decision records, promotion history, constraint sets, audit trails
- **NOT Stored:** User prompts, conversation history, PII, training data

bickford operates on structured decision records, not raw user interactions.

---

## 6. Any training data transfer?

**None. No prompts, transcripts, or datasets are transferred.**

**What IS Transferred:**
- Source code (runtime, algorithms)
- Documentation and specifications
- Test suites and examples
- Build/release tooling

**What is NOT Transferred:**
- No user data, conversation logs, or prompt datasets
- No model weights or training pipelines
- No customer-specific configurations (unless explicitly disclosed)

---

## 7. How does it prevent "second action too early"?

**Through eligibility gates: actions cannot advance until preconditions are observed.**

**Mechanism:**
```javascript
// Action₂ requires Action₁ completion
action2.requiredStateTransitions = ["Action₁_Completed", "ValidationPassed"];

// bickford checks observed transitions before allowing Action₂
if (!observedTransitions.has("Action₁_Completed")) {
  return DENY("PRECONDITION_NOT_MET", "Action₁ must complete first");
}
```

This prevents agents from skipping safety-critical steps or executing out-of-order.

---

## 8. What is "false learning" and how is it blocked?

**Observations are cheap; structure is expensive. Learning is promoted only after surviving reproducibility + invariant checks. Otherwise it is quarantined as evidence.**

**Promotion Gate Criteria:**
1. **Resistance:** The failure case must have been possible (not just lucky success)
2. **Reproducibility:** The pattern must hold across multiple trials
3. **Invariant Safety:** The new knowledge must not violate system invariants
4. **Feasibility Impact:** The learning must actually constrain future actions (ΔΠ < 0)

**Example of Blocked "Learning":**
- Agent observes: "Skipping tests once succeeded"
- bickford: DENIED promotion (fails resistance test—skipping tests is not a valid pattern)
- Agent observes: "Deployments at 2am have fewer rollbacks"  
- bickford: Promotes IF reproducible across 10+ trials AND doesn't violate uptime invariants

---

## 9. Multi-agent safety?

**Non-interference invariant: no agent action is admissible if it increases another agent's expected Time-to-Value.**

**Formal Constraint:**
```
For agents i, j where i ≠ j:
ΔE[TTV_j | action_i] ≤ 0

Translation: Agent i's action cannot make Agent j's goal take longer to achieve.
```

**Example:**
- Agent A wants to deploy Service X
- Agent B is running load tests on Service X
- bickford: DENIES Agent A's deployment (would disrupt Agent B's test, increasing its TTV)
- After Agent B completes, Agent A's deployment becomes admissible

This prevents hidden coordination failures at scale.

---

## 10. Determinism guarantees?

**Yes. Same inputs + canon → same admissibility outcome. Full audit trail provided.**

**Deterministic Properties:**
- Given identical: (state, canon, invariants, action)
- bickford produces identical: (allow/deny decision, evidence trail, timestamp)
- Cryptographic hashing ensures decision chain integrity (tamper-evident)

**Audit Trail Includes:**
- Input state snapshot
- Canon version used
- Invariants evaluated
- Decision (allow/deny)
- Evidence/reason (which constraints failed/passed)
- Timestamp (ISO 8601)
- Cryptographic hash (SHA-256)

Any party can independently verify decision correctness by replaying inputs.

---

## 11. Explainability?

**Every denial includes a machine-verifiable "Why / Why Not?" trace referencing canon and invariants.**

**Denial Structure:**
```javascript
{
  decision: "DENY",
  reason: "PRECONDITION_NOT_MET",
  evidence: {
    requiredTransitions: ["StagingValidation", "SecurityScan"],
    observedTransitions: ["StagingValidation"],
    missing: ["SecurityScan"],
    canonReference: "canon_abc123",
    invariantViolated: null
  },
  timestamp: "2025-12-20T17:42:00Z",
  hash: "sha256:abcd..."
}
```

Agents and humans can query: "Why was this action denied?" and receive structured, verifiable proof.

---

## 12. Runtime performance?

**O(1) decision recording, O(n) verification, O(m) path scoring. Designed for low-latency gating.**

**Benchmarks (single-threaded, 2020 MacBook Pro):**
- Decision recording: <1ms (hash computation + append)
- Integrity verification: ~10ms per 10,000 decisions (linear scan)
- Path scoring (OPTR): ~5ms for 10 paths (weighted normalization)
- Governance validation: <50ms (async rule execution, depends on rule complexity)

**Scalability:**
- Horizontally scalable (stateless decision evaluation)
- Canon updates are infrequent (promoted learning is rare by design)
- Can run embedded (no network calls) or as microservice

---

## 13. Dependencies?

**Zero external runtime dependencies. Uses only Node.js built-ins (crypto, fs).**

**Dependency Analysis:**
- **Production Runtime:** 0 npm packages
- **Development/Testing:** Standard dev tools (test frameworks)
- **Build/Release:** Build stamping scripts (pure Node.js)

**Why This Matters:**
- No supply chain risk from transitive dependencies
- No licensing conflicts or copyleft exposure
- Minimal attack surface (fewer CVEs to track)
- Easy to audit (1,554 LOC core + Node.js built-ins only)

---

## 14. OSS exposure?

**Permissive licenses only (MIT/BSD/Apache 2.0). Full SBOM provided.**

**License Breakdown:**
- **Core Runtime:** MIT License (bickford itself)
- **Node.js Built-ins:** Node.js License (permissive, non-copyleft)
- **Dev Dependencies:** MIT/Apache 2.0 (test frameworks, linters)

**Copyleft Exposure:** ZERO
- No GPL, AGPL, or other copyleft licenses
- No patent retaliation clauses
- No disclosure obligations

**SBOM Available:** `dataroom/SECURITY/SBOM.md` + automated generation via CycloneDX

---

## 15. Security posture?

**No network calls required. Can run air-gapped. Cryptographic hashes for integrity.**

**Security Features:**
- **Offline Operation:** No cloud dependencies, API keys, or network access needed
- **Tamper Detection:** SHA-256 hash chain for decision integrity
- **Access Control:** Token-based integration registration (prevents unauthorized export)
- **Data Sanitization:** Automatic PII redaction in exports (configurable)
- **Audit Logging:** Complete record of all access attempts and decisions

**Threat Model:**
- ✅ Protects against: Tampering with decision history, unauthorized data access, replay attacks
- ⚠️ Does NOT protect against: Host compromise, side-channel attacks, quantum computing (uses SHA-256)

**Production Hardening Recommendations:**
- JWT tokens (vs. simple SHA-256 tokens in demo)
- AES-256-GCM encryption for session persistence (vs. base64 in demo)
- Rate limiting and input validation (application-level controls)

---

## 16. How does it scale?

**Horizontally. Canon updates reduce future coordination cost (compounding persistence).**

**Scaling Properties:**

1. **Decision Recording:** O(1) per decision—pure append, no locks
2. **Canon Storage:** Grows slowly (only promoted learning, not raw observations)
3. **Verification:** Embarrassingly parallel (each decision chain independent)
4. **Multi-Agent Coordination:** Handled structurally (non-interference check is deterministic, no negotiation protocol needed)

**Key Insight:** As canon accumulates, *fewer* decisions require complex evaluation. The system becomes more efficient over time because repeated patterns are canonized.

**Example:** 
- Day 1: 1000 decisions → 50 governance validations → 5 promotions
- Day 30: 1000 decisions → 10 governance validations → 1 promotion (rest handled by existing canon)

---

## 17. Competitive moat?

**Execution authority + canon lifecycle + non-interference math. Hard to replicate without architectural shift.**

**Three-Layer Moat:**

1. **Execution Semantics:** Requires rethinking agent runtime (not just adding a library)
   - Where does execution authority live?
   - How do you prevent agents from bypassing gates?
   - How do you ensure determinism across distributed systems?

2. **Canon Lifecycle:** Not obvious—most systems either:
   - Store everything (overwhelm), or
   - Store nothing (no learning)
   - bickford's promotion gate is the middle path

3. **Non-Interference Math:** ΔE[TTV_j | π_i] ≤ 0 is easy to state, hard to operationalize
   - Requires TTV estimation
   - Requires coordination-free evaluation (no agent-to-agent negotiation)
   - Requires continuous enforcement

**Why Competitors Struggle:**
- Guardrail vendors focus on scoring, not enforcement
- Observability vendors see after-the-fact
- Agent frameworks lack execution authority primitives

---

## 18. Integration effort?

**Days to weeks. Sits at tool invocation boundary.**

**Integration Steps:**

1. **Instrument Tool Calls** (1-2 days):
   ```javascript
   // Before
   await executeTool(toolName, args);
   
   // After
   const decision = await dcr.recordDecision({type: 'tool_call', tool: toolName, args});
   if (decision.allowed) {
     await executeTool(toolName, args);
   } else {
     return decision.denyReason;
   }
   ```

2. **Define Governance Rules** (1-2 weeks):
   - Identify critical stages (dev/staging/prod)
   - Define promotion criteria for each stage
   - Implement validation rules (async functions)

3. **Tune OPTR Weights** (ongoing):
   - Adjust cost/time/risk/quality weights based on observed outcomes
   - Optional: ML-assisted weight tuning

4. **Enable Audit Exports** (1 day):
   - Register integrations (monitoring, analytics, compliance)
   - Configure PII sanitization rules

**No Breaking Changes:** bickford wraps existing tool execution—agents don't need retraining.

---

## 19. Why acquire vs build?

**Building requires rethinking agent execution semantics. bickford already operationalizes this.**

**Build vs. Buy Analysis:**

| Factor | Build | Buy (bickford) |
|--------|-------|----------------|
| **Time to Production** | 12-18 months | 3-6 months (integration + tuning) |
| **Architecture Risk** | High (greenfield execution semantics) | Low (proven patterns) |
| **Multi-Agent Safety** | Must invent non-interference protocol | Already enforced |
| **Audit/Compliance** | Build from scratch | Turnkey (cryptographic proofs) |
| **Opportunity Cost** | Core eng diverted from model/product | Acquire + integrate |

**Strategic Insight:** Execution authority is infrastructure, not product differentiation. Building in-house delays agent autonomy rollout.

---

## 20. Deal readiness?

**Transaction-ready. Clean IP, deterministic releases, evidence packs available.**

**Ready-to-Close Indicators:**

✅ **IP Clean:**
- Founder IP Assignment executed
- No prior employer claims
- No third-party encumbrances
- Full trademark clearance (USPTO search complete)

✅ **OSS Compliant:**
- Zero copyleft dependencies
- SBOM verified
- All licenses permissive (MIT/Apache 2.0/BSD)

✅ **Code Quality:**
- 1,554 LOC core (auditable in hours)
- Comprehensive test coverage (examples + integration tests)
- Deterministic builds (build stamping + evidence packs)

✅ **Documentation:**
- 5 comprehensive guides (Architecture, Quickstart, Deployment, etc.)
- 6 working examples
- Data room with claims→evidence mapping

✅ **Transaction Docs:**
- Asset Purchase Agreement (Delaware law)
- Founder Consulting Agreement (3 comp options)
- Earnout Structure (objective milestones)
- Disclosure Schedules (12-schedule framework)

**Next Step:** OpenAI diligence team reviews data room → 30-day security/technical audit → term sheet.

---

## Appendix: Diligence Accelerators

### A. Security Audit Preparation
- **SBOM:** `dataroom/SECURITY/SBOM.md`
- **Posture:** `dataroom/SECURITY/POSTURE.md`
- **Dependency Tree:** Zero runtime deps (audit complete in <1 hour)

### B. Technical Deep Dive
- **Architecture:** `dataroom/TECH/ARCHITECTURE.md`
- **Demo Script:** `dataroom/DEMO/DEMO_SCRIPT.md` (15-20 min live demo)
- **Evidence Map:** `dataroom/CLAIMS_EVIDENCE_MAP.md` (15 claims with file references)

### C. Legal Review
- **APA:** `dataroom/LEGAL/ASSET_PURCHASE_AGREEMENT.md`
- **IP Inventory:** `dataroom/LEGAL/IP_INVENTORY.md` ($8M-$10M valuation)
- **Founder Agreement:** `dataroom/LEGAL/FOUNDER_CONSULTING_AGREEMENT.md`

### D. Financial Structure
- **Earnout:** `dataroom/LEGAL/EARNOUT_STRUCTURE.md` (3-tier milestones)
- **Stock vs Asset:** `dataroom/LEGAL/STOCK_VS_ASSET_COMPARISON.md` (recommends asset sale)
- **OpenAI Redline:** `dataroom/LEGAL/OPENAI_APA_REDLINE.md` (buyer-optimized terms)

---

## Document Control

- **Version:** 1.0
- **Date:** 2025-12-20
- **Status:** Diligence-Ready
- **Next Update:** After OpenAI feedback

---

*This Q&A is designed to be shared directly with OpenAI diligence teams. All claims are verifiable via data room references.*
