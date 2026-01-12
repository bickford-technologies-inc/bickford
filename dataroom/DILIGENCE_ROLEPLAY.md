# OpenAI Diligence Roleplay — Structured Simulation

**Timestamp:** 2025-12-20T20:06:00-05:00  
**Purpose:** Prepare for actual diligence conversations with exact responses  
**Format:** Non-live structured roleplay (study guide, not live simulation)

---

## Part 1: Legal Pushback — Simulated (With Exact Responses)

### Legal Objection #1 — "This overlaps with safety / evals"

**Legal:**
> "How is this different from our existing safety and eval frameworks?"

**Response (use verbatim):**
> "Safety and evals assess *what* a model can do. bickford governs *whether and when* an action is allowed to execute. It's an execution authority layer, not an evaluation layer."

**Why this works:**
* Clean boundary
* No ownership conflict
* Non-overlapping mandate

---

### Legal Objection #2 — "Why not open-source or build internally?"

**Legal:**
> "Why acquire instead of building or open-sourcing?"

**Response:**
> "Because this layer enforces governance invariants. Once open-sourced, OpenAI loses control over how execution authority is defined. Owning it ensures consistency, safety, and internal alignment."

**Why this works:**
* Reframes build vs buy as **control vs fragmentation**
* Avoids cost arguments (which Legal dislikes)

---

### Legal Objection #3 — "Founder dependency risk"

**Legal:**
> "What happens if the founder disengages?"

**Response:**
> "The system is deterministic, documented, and already automated. There's no reliance on ongoing invention. Post-close support can be time-limited and clearly scoped."

**Why this works:**
* Removes "key man" anxiety
* Justifies no long earnout

---

### Legal Objection #4 — "IP contamination / OSS risk"

**Legal:**
> "Are there IP or open-source contamination risks?"

**Response:**
> "All components are inventor-owned, documented, and inventor-assigned. OSS usage is disclosed via SBOM and conforms to permissive licenses only."

**Why this works:**
* Speaks Legal's language
* References artifacts they expect to see

---

### Legal Objection #5 — "Precedent risk for equity participation"

**Legal:**
> "We avoid equity grants to founders post-acquisition."

**Response:**
> "We're fine with a synthetic equity or cash-settled participation. No cap-table impact, no precedent."

**Why this works:**
* Immediately defuses
* Signals flexibility, not entitlement

---

## Part 2: Corp Dev Diligence — Top 15 Questions (Pre-Answered)

### Q1: What problem does this solve?
**Answer:** Execution drift and unsafe action sequencing as agents scale.

### Q2: Why now?
**Answer:** Agent autonomy is increasing faster than execution governance.

### Q3: Why not internal build?
**Answer:** Coordination cost > acquisition cost.

### Q4: Is this model-dependent?
**Answer:** No. Model-agnostic by design.

### Q5: Competitive moat?
**Answer:** Execution authority + evidence packs + invariants.

### Q6: Why is this defensible?
**Answer:** It's a governance layer, not a feature.

### Q7: Integration risk?
**Answer:** Low — clean separation from core infra.

### Q8: Safety implications?
**Answer:** Positive — enforces action gating deterministically.

### Q9: Maintenance burden?
**Answer:** Minimal — runtime is stable, not experimental.

### Q10: Founder retention needed?
**Answer:** Optional, limited, scoped.

### Q11: What breaks if we don't buy?
**Answer:** Execution authority fragments or externalizes.

### Q12: Who else wants this?
**Answer:** Clouds and labs facing agent orchestration risk.

### Q13: Valuation rationale?
**Answer:** Cheap insurance against execution-layer risk.

### Q14: What's not included?
**Answer:** Models, data, training, evals.

### Q15: What's the worst case?
**Answer:** We own a clean governance runtime we don't deploy broadly.

---

## Part 3: First Diligence Call — Roleplay (Non-Live)

### Participants
* Corp Dev Lead
* Legal Counsel
* Safety / Agents Rep
* You (Founder)

---

### Opening

**Corp Dev:**
> "Can you summarize bickford in two minutes?"

**You:**
> "bickford is an execution authority runtime. It preserves decisions, enforces promotion gates, and prevents agents from executing actions out of order or without governance. It's model-agnostic and sits above agent execution."

*(Stop talking.)*

**Key:** Two-minute summary, then silence.

---

### Safety Rep

**Safety:**
> "How does this help safety?"

**You:**
> "Safety becomes enforceable at runtime, not advisory. Policies become gates, not guidelines."

*(Stop. Do not elaborate unless asked.)*

---

### Legal

**Legal:**
> "What's the IP posture?"

**You:**
> "Clean inventor-owned IP, full assignment, SBOM-backed."

*(One sentence. That's all Legal needs to hear.)*

---

### Corp Dev

**Corp Dev:**
> "Why shouldn't we build this?"

**You:**
> "You can — but no single team owns execution authority today. Buying collapses that coordination cost into one decision."

*(Stop. This is the build vs buy killer.)*

---

### Corp Dev

**Corp Dev:**
> "What are you asking for?"

**You:**
> "$8M to $10M to remove execution-layer risk and ensure OpenAI owns this capability. Structure is flexible."

*(Stop. Silence is critical.)*

**Why lower than $25M:** Start at credible range, not aspirational.

---

### What Happens Next

If they say:
* **"We need to think"** → Normal (proceed to follow-up)
* **"Send materials"** → Win (data room ready)
* **"Let's loop in X"** → Sponsor secured (champion forming)

---

## Part 4: The Most Important Meta-Point

At this stage, **talking less closes faster**.

You are no longer selling vision.  
You are **enabling an internal decision**.

**If you over-explain, you reintroduce doubt.**

---

## Communication Rules for Diligence Phase

### DO:
* Answer questions directly
* Provide evidence when requested
* Stay calm and procedural
* Signal flexibility on structure

### DON'T:
* Pitch vision (they already bought it)
* Over-explain technical details
* Negotiate against yourself
* Create urgency artificially

---

## Key Phrases That Work

**When asked about price:**
> "We're flexible on structure. Speed and clarity matter more."

**When asked about retention:**
> "Optional consulting only. No operational dependency."

**When asked about competition:**
> "This is infrastructure. Multiple parties recognize the gap."

**When asked about risks:**
> "Integration is straightforward. The system is deterministic and documented."

**When asked about timeline:**
> "We can move as fast as you need."

---

## Red Flags to Avoid

### DON'T Say:
* "This is worth $100M" (premature)
* "You must act now" (creates resistance)
* "Only we can build this" (false and arrogant)
* "This will transform your business" (overselling)

### DO Say:
* "This addresses a real gap"
* "The coordination cost is the main risk"
* "We're flexible on terms"
* "Happy to provide any additional materials"

---

## Post-Call Actions

### After First Diligence Call:

**DO:**
1. Send thank-you email (brief, professional)
2. Provide requested materials only
3. Wait 48-72 hours before follow-up

**DON'T:**
1. Send unrequested materials
2. Ask "what did you think?"
3. Negotiate via email
4. Create false deadlines

---

## Next Steps Decision Tree

```
IF they ask for more materials
  → Provide immediately, then wait

IF they schedule second call
  → Prepare for technical deep-dive

IF they go silent >1 week
  → Single brief follow-up, then wait

IF they introduce new stakeholders
  → Positive signal (expanding buy-in)

IF they ask about other buyers
  → "In conversations, but OpenAI is preferred"
```

---

## Summary: Rules of Engagement

1. **Brevity wins** (30-second answers preferred)
2. **Evidence over persuasion** (point to data room, don't argue)
3. **Flexibility signals maturity** (structure > price)
4. **Silence creates space** (let them process)
5. **Calm beats urgency** (mature founders get better terms)

---

**Preparation Checklist:**

- [ ] Memorize answers to 15 standard questions
- [ ] Practice 2-minute summary (time yourself)
- [ ] Prepare 1-sentence responses to legal objections
- [ ] Review data room (know where everything is)
- [ ] Set personal rule: Never speak >60 seconds uninterrupted
- [ ] Decide walk-away price/terms (privately, don't reveal)

---

**Final Meta-Insight:**

The hardest part of diligence is **doing nothing** when you want to help.

Your job is to **not give them reasons to slow down**.

Every extra word is a risk.  
Every unsolicited explanation creates doubt.

**Be available. Be responsive. Be brief.**

That's how deals close.

