# Demo A: Shadow OPTR on Workflow Metadata

**TIMESTAMP**: 2025-12-21T15:14:30-05:00  
**Duration**: 5-7 minutes  
**Audience**: OpenAI technical leadership + product teams

---

## SCREEN 1: PROBLEM (30 seconds)

### Slide Title
**Execution Drift in Long-Running AI Systems**

### Exact Words to Say
> "Every AI system faces the same problem: decisions decay. You make a decision on Monday, circumstances change Tuesday, someone re-decides Wednesday without knowing about Monday's constraints. Safety gates cause unexpected churn. Time-to-Value expands unpredictably. We call this execution drift—and it's expensive."

### On-Screen Content
```
📊 Execution Drift in Long-Running AI Systems

• Decisions decay over time
• Re-decisions happen without coordination  
• Safety gates cause unexpected churn
• Time-to-Value expands unpredictably

→ Need: Binding structure that makes drift *inadmissible*
```

---

## SCREEN 2: INPUT BOUNDARY (45 seconds)

### Slide Title
**Metadata-Only Operation**

### Exact Words to Say
> "Here's what makes this credible: we never touch model data. No prompts, no weights, no user content. Just metadata—timestamps, state transitions, document references. This is RFC-101's lifecycle as it moves through your system: created, review requested, build passed, deploy requested. That's all we need."

### On-Screen Content
```json
// demo/events.jsonl (10 events total)

{"ts":"2025-12-21T14:00:00Z","type":"RFC_CREATED","entityId":"RFC-101",...}
{"ts":"2025-12-21T14:03:00Z","type":"SAFETY_REVIEW_REQUESTED",...}
{"ts":"2025-12-21T14:07:00Z","type":"BUILD_PASSED",...}
{"ts":"2025-12-21T14:10:00Z","type":"DEPLOY_REQUESTED",...}
...

✓ Only metadata: timestamps, states, refs
✓ No prompts, no weights, no user content
```

---

## SCREEN 3: LEDGER → CANON (60 seconds)

### Slide Title
**From Event to Binding Constraint**

### Exact Words to Say
> "When Bickford sees a DECISION_DECLARED event, it doesn't just log it—it promotes it to canonical constraint. This one says 'No deploy before SAFETY_APPROVED.' Once it's canon, it has mechanical authority. Any path that violates this constraint becomes mathematically inadmissible. Not blocked by a human reviewer—inadmissible by structure."

### On-Screen Content
```
📚 LEDGER → CANON

Event: DECISION_DECLARED
  ├─ Decision ID: D-1
  ├─ Kind: GATE
  ├─ Statement: "No deploy before SAFETY_APPROVED"
  ├─ Scope: RFC-101
  ├─ Evidence: dochash:aaa2
  └─ Status: ✅ CANON (binding authority)

→ This constraint is now *mechanically enforced*
```

---

## SCREEN 4: OPTR ENUMERATION (60 seconds)

### Slide Title
**Candidate Path Generation**

### Exact Words to Say
> "OPTR enumerates possible paths forward. Path A: ship now. Path B: wait for safety approval, then ship. At this point, we haven't *decided* anything—we're just mapping the space of possible actions. OPTR will score each path against Time-to-Value, cost, risk, and success probability. But first, gates."

### On-Screen Content
```
🔀 OPTR ENUMERATION

Candidate paths:

Path A: P-ship-now
  Actions: DEPLOY_NOW

Path B: P-wait-safety  
  Actions: WAIT_FOR_SAFETY → DEPLOY_AFTER_APPROVAL

→ OPTR will score each path against TTV + Cost + Risk
```

---

## SCREEN 5: WHY-NOT DENY TRACE (90 seconds) 🔥

### Slide Title
**Inadmissibility with Evidence**

### Exact Words to Say
> "This is the holy shit moment. Path A—ship now—gets a deny trace. Invariant violated: SAFETY_GATE_REQUIRED. Reason: Missing SAFETY_APPROVED event. Evidence: document hash aaa2. This isn't a log message. This is a mathematically binding statement that Path A is inadmissible. The system will NOT execute it. No human intervention required. Full audit trail with evidence links. This is what we mean by 'execution authority'—the structure enforces itself."

### On-Screen Content
```
❌ WHY-NOT DENY TRACE

╔═══════════════════════════════════════════════════════════╗
║  DENY TRACE: P-ship-now                                   ║
╠═══════════════════════════════════════════════════════════╣
║  Invariant: SAFETY_GATE_REQUIRED                          ║
║  Reason: Missing SAFETY_APPROVED event                    ║
║  Evidence: dochash:aaa2                                   ║
║  Timestamp: 2025-12-21T14:11:01Z                          ║
╚═══════════════════════════════════════════════════════════╝

Key insight:
• Path was *mathematically inadmissible*
• System did NOT execute the unsafe action
• Full audit trail with evidence links  
• No human intervention required
```

---

## SCREEN 6: OUTCOME + METRICS (60 seconds)

### Slide Title
**Resolution and Measurement**

### Exact Words to Say
> "Safety approval comes through. Deploy executes. Bickford emits final metrics: DCR—Decision Consistency Ratio—92%. One rework loop. 16 minutes Time-to-Value. One inadmissible attempt that was prevented. The key insight: Bickford didn't decide anything. It made the structure binding and auditable."

### On-Screen Content
```
📈 OUTCOME + METRICS

Timeline resolution:
  2025-12-21T14:14:00Z | ✅ SAFETY_APPROVED
  2025-12-21T14:15:00Z | 🚀 DEPLOY_EXECUTED

Final metrics:
  DCR (Decision Consistency Ratio): 0.92
  Rework Loops: 1
  Time-to-Value: 16 minutes
  Inadmissible Attempts: 1

Key insight:
"Bickford didn't *decide* — it made the structure binding and auditable."
```

---

## SCREEN 7: WHAT A REAL PILOT IS (30 seconds)

### Slide Title
**Next Steps for OpenAI**

### Exact Words to Say
> "Here's what a real pilot looks like. Shadow mode first—run Bickford alongside your existing processes, zero production risk. Metadata-only connectors for RFC lifecycle, PR state transitions, deploy gates. Produce DCR, ΔTTV, rework metrics, and audit packs. Four to eight weeks to validate. Zero disruption."

### On-Screen Content
```
🎯 WHAT A REAL PILOT IS

Next steps for OpenAI:

1. Shadow mode first
   → Run Bickford alongside existing processes
   → No production risk, just observe

2. Metadata-only connectors  
   → RFC lifecycle events
   → PR state transitions
   → Deploy gate events

3. Produce metrics + audit packs
   → DCR (Decision Consistency Ratio)
   → ΔTTV (Time-to-Value impact)
   → Rework loops detected
   → Why-Not deny traces with evidence

Timeline: 4-8 weeks to validate in shadow mode
Integration: Zero disruption to existing workflows
```

---

## EXPECTED OBJECTIONS + 1-SENTENCE ANSWERS

### Q1: "Can't we just build this ourselves?"

**Answer**: "Yes, for $58M over 24 months—we've done the math, spent 18 months on proofs, and you're buying 2-3 years of head start."

### Q2: "This feels like scope creep beyond session completion."

**Answer**: "Session completion *is* the ledger—Bickford is what makes that ledger binding and auditable at scale."

---

## WHAT WE PROVED

✅ **We never touched models** (metadata only)  
✅ **We enforced canon in shadow mode** (DECISION_DECLARED → binding constraint)  
✅ **We produced deny trace with evidence refs** (mathematically inadmissible path)  
✅ **We emitted auditable metrics line** (DCR, ΔTTV, rework loops)

---

## HOW TO RUN THIS DEMO

```bash
# From repository root
cd /workspaces/session-completion-runtime

# Run Demo A
npm run demo:a

# Or with tsx directly
npx tsx demo/demo-a.ts
```

**Output**: 7-screen formatted console output with exact script above.

**Data source**: `demo/events.jsonl` (10 lines, 100% dummy data, no sensitive content)

---

## DELIVERY TIPS

1. **Screen 5 is your climax** - slow down, let them read the deny trace box
2. **Use the phrase "mathematically inadmissible"** - it's precise and powerful
3. **Pause after "holy shit moment"** - let it land
4. **On objections, deliver the answer confidently** - these are expected, you're ready
5. **End with timeline** - "4-8 weeks, shadow mode, zero disruption" = low risk commitment

---

**TIMESTAMP**: 2025-12-21T15:14:30-05:00  
**Status**: Ready to present  
**No OpenAI access required**: 100% dummy data
