# Build vs Buy Assessment — Execution Authority / Decision Continuity Runtime

**Author:** [Internal Sponsor Name]  
**Audience:** Platform, Agents, Safety, Corp Dev  
**Decision Horizon:** Q1–Q2 2025  
**Timestamp:** 2025-12-20T19:44:00-05:00

---

## Summary

We evaluated whether OpenAI should **build internally** or **acquire** an execution-authority runtime ("bickford") that governs decision continuity, promotion gates, and multi-agent non-interference above model execution.

**Recommendation:** **Buy.**  
This is not a feature decision; it is a **control primitive** decision. Execution authority must be deterministic, centrally owned, and enforced at runtime. Internal build introduces coordination delay and fragmentation risk precisely at the layer that converts intent into action.

---

## Problem

As agent autonomy increases, OpenAI requires a **single, canonical execution authority** that decides *what is allowed to happen*, *when*, and *under which proofs*. Today, these decisions are distributed across policy, tooling, and process—adequate for advisory systems, insufficient for autonomous execution.

This is not a model problem. It is an **execution control** problem.

---

## Build Option (Internal)

### What "Build" Actually Means

* Cross-org coordination across Agents, Safety, Infra, and Product
* New runtime standards (promotion gates, invariants, evidence)
* Long-tail governance edge cases
* Tooling that must be correct *before* scale

### Risks

* **Fragmentation Risk:** Multiple teams independently define "allowed execution," creating inconsistent authority
* **Delay Risk:** Authority emerges late, after behaviors are deployed
* **Control Risk:** Enforcement becomes retroactive rather than preventive
* **Opportunity cost:** Senior engineers diverted from core agent capabilities

### Expected Outcome

* Partial solution emerges
* Governance gaps remain
* Execution drift becomes policy debt

### Cost Estimate

* **Engineering:** 3–4 senior engineers × 12–18 months = $1.5M–$2.5M direct labor
* **Coordination overhead:** 6+ months of cross-org alignment = $500K–$1M
* **Failure cost:** 1–2 production incidents during learning = $5M–$15M
* **Opportunity cost:** Delayed agent autonomy = $10M–$50M NPV

**Total:** $17M–$68.5M (expected value including risk)

---

## Buy Option (Acquisition)

### What "Buy" Delivers

* **Immediate Authority:** Deterministic gates before execution
* **Ownership of Reality Layer:** OpenAI defines the rules of action, not just reasoning
* **Compounding Value:** Authority scales with agent autonomy without re-architecture
* **Proven architecture:** Canon lifecycle, OPTR, promotion gates operational
* **Safety-first design:** Auditability and non-interference built-in
* **Model-agnostic:** No coupling to specific inference stack
* **Zero dependencies:** No supply chain risk

### Integration Path

* **Week 1–2:** Architecture review + safety sign-off
* **Week 3–4:** Integration into agent toolchain boundary
* **Week 5–8:** Pilot with 2–3 internal agent workflows
* **Week 9–12:** Production rollout

### Cost Estimate

* **Acquisition:** $8M–$10M total consideration
* **Integration:** 2–3 engineers × 3 months = $200K–$300K
* **Risk:** Minimal (system is operational, auditable, deterministic)

**Total:** $8.2M–$10.3M

---

## Decision Matrix

| Criterion | Build | Buy | Winner |
|-----------|-------|-----|--------|
| Time to production | 12–18 months | 3 months | Buy |
| Risk of failure | High (novel coordination) | Low (proven system) | Buy |
| Engineering cost | $17M–$68.5M (expected) | $8.2M–$10.3M | Buy |
| Strategic control | Full | Full (asset purchase) | Tie |
| Technical debt | Unknown | Minimal (zero deps) | Buy |
| Safety confidence | Low initially | High (audit trail) | Buy |

---

## Key Insights

1. **This is not a core competency gap.** We can build execution authority. But it requires cross-org consensus that does not exist today.

2. **The problem is coordination, not capability.** No team owns "execution semantics" end-to-end. Building requires creating that ownership first.

3. **Acquisition removes coordination friction.** An external asset forces alignment around a concrete system rather than abstract requirements.

4. **Risk asymmetry favors buying.** Build risk is tail-heavy (incidents, delays). Buy risk is capped (integration complexity only).

---

## Counter-Arguments Addressed

### "We could build this in 6 months"

Possibly true for a proof-of-concept. Not true for production-grade:
* Canon promotion logic with edge cases
* Multi-agent non-interference math
* Audit trail cryptography
* Session persistence with recovery
* Evidence pack generation

More importantly: **coordination takes longer than code.**

### "This creates dependency on external code"

False. Asset purchase transfers full ownership. We control roadmap, security, and integration.

### "The price is too high for unproven technology"

The system is operational with evidence packs. Diligence can verify correctness. Risk is integration complexity, not technical feasibility.

### "We should wait until we need it"

Execution authority is path-dependent. Retrofitting is 5–10× more expensive than building on correct foundations. Waiting creates technical debt.

---

## Recommendation

**Acquire bickford.**

This acquisition establishes **who decides what can happen**.  
That decision should be owned, centralized, and enforced—now, not after scale.

**Rationale:**
1. This is a **control primitive** decision, not a feature decision
2. $8M–$10M significantly below build cost ($17M–$68.5M expected value)
3. 3-month integration vs 12–18 month build
4. Removes cross-org coordination blocker at the layer that converts intent to action
5. Proven system with audit trail and evidence packs

**Next Steps:**
1. Authorize Corp Dev to proceed with diligence
2. Assign technical owner from Agents/Platform
3. Schedule Safety team architecture review
4. Define integration milestones and success criteria

---

## Appendix: Alternative Scenarios

### If We Don't Act

* **Amazon (AWS) acquires:** Bedrock agents get execution authority as platform feature. OpenAI agents become guests. Strategic disadvantage.
* **Internal fragmentation:** Each agent team builds partial solutions. No coherent execution semantics. Incident risk increases.
* **Regulatory requirement:** If auditors/regulators mandate execution authority, retroactive compliance is expensive and disruptive.

### If We Build

* **Best case:** 12 months, $2M direct cost, no incidents. Still higher than acquisition.
* **Expected case:** 18 months, $5M+ with coordination overhead, 1–2 minor incidents.
* **Worst case:** Failed first attempt, 24+ months, major incident requiring public response.

---

**Decision Owner:** [Exec Sponsor Name]  
**Deadline:** [Date - typically 2 weeks from memo circulation]

