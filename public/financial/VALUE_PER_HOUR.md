# Value Created per Hour — Baseline + Continuous Compounding Model

## Purpose

This document translates the locked 3-year value projection into a per-hour value metric, defines the business process workflows this value is tied to, and shows how to express value growth using continuous compounding.

---

## Definition: Business Process Workflows

**Business process workflows** are the repeatable, end-to-end sequences of actions that move a decision from intent to outcome (capture → authority → execution → ledger → replay). They are the operational pathways that create value by eliminating rework, shortening time-to-value, and preserving decision continuity.

### Real Use Cases (Examples)
- **Customer onboarding approvals**: intent to approve, verify authority, execute provisioning, ledger entry, replay for audit.
- **Security exception handling**: request, risk review, authority binding, change execution, immutable audit trail.
- **Sales discount approvals**: deal desk decisions captured, scoped, approved, executed in CRM, replayable for compliance.
- **Incident response routing**: triage intent, authority to act, action runbooks executed, postmortem ledgered.
- **Procurement vendor approvals**: RFP decision workflow with authority binding and decision replay.
- **Model deployment gating**: promotion gate decisions logged, authority enforced, deployment executed, ledgered proof.

### Continuous Compounding Loop (Workflow-Centric)
To make compounding explicit, each workflow should continuously read the latest state and write the next baseline:
1. **Execute** the workflow with authority and constraints enforced.
2. **Measure** value outcomes (time saved, error reduction, cycle time).
3. **Persist** the result to the ledger and daily archives.
4. **Replay** the latest baseline as the starting point for the next run.
5. **Calibrate** allocation by grouping (region, BU, sales region, KPI, per employee).

---

## Baseline Value per Hour (Deterministic)

**Source value**: $88M total value over 3 years (locked projection).  
**Baseline hours**: 3 years × 365 days × 24 hours = **26,280 hours**.

**Baseline value per hour**:
```
$88,000,000 / 26,280 = $3,349.62 ≈ $3,350 per hour
```

**Result (Baseline):** **$3,350/hr**

---

## Compounding Uplift Factors (Measured Inputs)

The following compounding inputs represent measurable sources of value growth. Replace with ledger-backed deltas when available:

1. **Compounding Knowledge Growth & Persistence (K)**
   - Faster reuse of prior decisions, fewer repeated cycles
   - **Uplift factor (K): 1.12**

2. **Compounding Dynamic Peak Performance (P)**
   - Adaptive optimization of execution path over time
   - **Uplift factor (P): 1.08**

3. **Compounding Dynamic Configuration (C)**
   - Context-aware tuning without rework overhead
   - **Uplift factor (C): 1.06**

**Compounded uplift multiplier (3-year horizon):**
```
K × P × C = 1.12 × 1.08 × 1.06 = 1.282
```

---

## Continuous Compounding (Value per Hour)

To express compounding as a continuous growth rate:

```
r = ln(M) / T
Value_per_hour(t) = Baseline × e^(r × t)
```

Where:
- **M** = compounded uplift multiplier (1.282)
- **T** = time horizon in years (3)
- **t** = time in years since baseline
- **r** = continuous annual growth rate

**Computed rate:**
```
r = ln(1.282) / 3 = 0.0828 (8.28% per year)
```

**Extended value per hour (t = 3 years):**
```
$3,350 × e^(0.0828 × 3) = $3,350 × 1.282 = $4,295
```

**Result (Compounded at 3 years):** **$4,295/hr**

---

## Value per Hour by Measurable Grouping (Enterprise-Scale)

Value per hour can be allocated to any measurable grouping. This list is intentionally expansive and extensible (add any enterprise dimension not listed). It mirrors how enterprises like Anthropic, AWS, OpenAI, Microsoft, and Palantir commonly segment value across their organizations.

### Organizational
- Company, subsidiary, division, business unit, function (Sales, Eng, Ops, Legal)
- Product line, program, portfolio, platform, service tier
- Team, squad, pod, department, org chart node
- Cost center, profit center, P&L owner, budget owner
- Role, job family, level, **per employee**, per contractor
- Executive sponsor, steering committee, initiative owner

### Geographic
- Region (AMER, EMEA, APAC), country, state, metro
- Sales region/territory, district, zip-based market
- Time zone, locale, regulatory jurisdiction
- Operating region, data residency zone, legal entity domicile

### Customer & Revenue
- Customer segment (enterprise, mid-market, SMB)
- Industry vertical, NAICS/SIC
- Account, account tier, named accounts
- Channel (direct, partner, reseller), marketplace
- Revenue stream, ARR/MRR, contract, renewal cohort
- Pipeline stage, opportunity size band, win-rate tier
- Customer health score, churn risk band, expansion tier

### Operational & Risk
- Workflow type, runbook, process family
- SLA tier, severity class, incident type
- Compliance regime (SOC2, ISO, HIPAA, GDPR)
- Risk tier, approval tier, exception class
- Control owner, audit scope, policy version

### Performance & KPI
- KPI (TTV, cycle time, throughput, error rate)
- Quality score, audit score, reliability percentile
- Cost per action, cost per decision, ROI band
- Conversion funnel stage, adoption cohort
- Employee productivity, utilization, capacity recovery
- AI assist rate, automation rate, deflection rate

### Financial & Investment
- Capex vs Opex allocation, depreciation schedule, amortization horizon
- Budget program, fiscal quarter, investment thesis
- Cost of delay, savings realized, cash flow band

### Data & Platform
- Dataset, feature set, model family, environment (dev/stage/prod)
- API surface, integration tier, partner ecosystem
- Security boundary, data classification, retention tier

---

## Allocation Formula (Per Group)

```
Group_Value_per_hour = Total_Value_per_hour × Allocation_Share
```

Examples:
- **By region**: share = % of decisions originating in region.
- **By business unit**: share = % of ledgered workflows owned by BU.
- **Per employee**: share = 1 / total employees (or weighted by usage).
- **By KPI**: share = % of value attributed to improvements in that KPI.

---

## Interpretation

- **Baseline** captures locked ROI value already documented.
- **Compounded** applies when measured uplift factors are present and ledger-backed.
- This per-hour figure applies to business process workflows that are fully routed through the Decision Continuity Runtime.

---

## Recalibration Hooks

To recompute in production:
1. Replace $88M with the latest ledger-backed value projection.
2. Replace uplift factors (K, P, C) with empirically measured deltas.
3. Re-run the deterministic and continuous compounding formulas above.
