# Business process workflows

## Definition

Business process workflows are repeatable, ordered sequences of work that turn an input (request, signal, or event) into a consistent output (decision, artifact, or action) by following defined steps, roles, and rules. They are the operational backbone that makes intent execution auditable, automatable, and resilient over time.

## Real use cases

- **Customer onboarding**: Intake → verification → risk scoring → account provisioning → customer success handoff.
- **Sales deal desk**: Qualification → pricing approval → legal review → contract execution → billing setup.
- **Incident response**: Detection → triage → mitigation → post-incident review → preventative action tracking.
- **Policy change management**: Draft → review → approval → rollout → audit evidence capture.
- **Hiring pipeline**: Sourcing → screening → interviews → offer → onboarding.
- **Procurement**: Request → vendor evaluation → compliance checks → approval → purchase order issuance.
- **Finance close**: Source data → reconciliation → close checklist → executive reporting → audit packet.
- **Product launch**: Requirements → design review → security/privacy review → release → post-launch analysis.
- **Customer support escalation**: Intake → categorization → escalation → resolution → root-cause tracking.
- **Security access review**: Scope → attestations → remediation → evidence capture → compliance sign-off.
- **Model evaluation**: Dataset curation → benchmark run → risk review → deployment approval → monitoring.

## Automated change management for real-time release (intent-to-value)

Design a workflow that treats every change as an executable intent, enforces guardrails, and releases continuously without batching. The objective is real-time delivery while preserving auditability, policy compliance, and non-interference.

### Objectives

- **Real-time release**: every approved change flows to production automatically.
- **Instant intent-to-value**: minimize time from intent declaration to measurable impact.
- **Auditable execution**: every decision and action is recorded with evidence.
- **Non-interference**: changes cannot increase time-to-value for other agents or systems.

### Actors

- **Requester**: submits intent and context.
- **Policy engine**: enforces constraints and validates admissibility.
- **Automation orchestrator**: executes and sequences actions.
- **Reviewer of record**: optional, only for risk tiers that require human approval.
- **Release steward**: owns rollback, incident response, and change ledger integrity.

### Inputs

- **Intent**: target outcome, constraints, authority, timestamp.
- **Structural knowledge**: schemas, invariants, service contracts.
- **Policy set**: compliance, security, and operational constraints.
- **Service topology**: ownership, dependencies, blast radius.
- **Telemetry baselines**: SLOs, risk thresholds, and release health metrics.

### Output

- **Decision ledger entry** with a signed decision, executable actions, and evidence.
- **Production release** with observability trace.
- **Post-release observations** added to retained knowledge.

### Workflow stages (real-time)

1. **Intent declaration**
   - Requester submits intent (`G, Θ, A, τ`) with affected services and expected value.
   - Automation validates completeness (required fields, scopes, owners).
2. **Structural validation**
   - Confirm the change maps to existing schemas/contracts; reject or route to schema update if not.
   - Enforce structural dominance: behavior changes must be encoded in structure first.
3. **Policy admissibility**
   - Evaluate constraints (security, compliance, legal, operational).
   - Compute non-interference impact; reject if the change increases TTV for other agents.
4. **Decision formation**
   - Generate decision package (`I, R, E, σ`) with executable actions and rationale.
   - Sign the decision and append to the immutable ledger.
5. **Automated build + verification**
   - Run automated checks (unit/integration, policy tests, contract validation).
   - Use progressive policy gates: fail-fast for high-risk violations, auto-continue for low-risk.
6. **Real-time release**
   - Release immediately via progressive delivery (canary/feature flag).
   - Enforce automatic rollback on SLO regression or policy breach.
7. **Observe + learn**
   - Capture telemetry, user impact, and ledger evidence.
   - Update retained knowledge and structural encodings.
8. **Compounding automation**
   - Feed results into routing: higher-confidence changes auto-release faster.
   - Increase decision continuity rate by reusing validated decisions.

### Real-time control loop

```
Intent → Structural validation → Policy admissibility → Decision ledger
      → Automated tests → Progressive delivery → Telemetry
      → Learn/update structure → Faster next decision
```

### Release guarantees

- **No silent change**: every action is tied to a signed decision record.
- **Always-on compliance**: evidence is produced as a by-product of execution.
- **Instant value**: changes release as soon as they satisfy constraints and tests.
- **Reversibility**: automatic rollback on SLO degradation or policy violation.

### Evidence artifacts (required)

- Intent record and authority set.
- Decision signature and rationale.
- Test results and policy evaluation logs.
- Release trace (deployment ID, time, target).
- Observability snapshot (SLOs, error budgets, performance deltas).

## Real use cases with $/hour value framing

Use the same pattern across functions: assign a total value (cost avoided, revenue gained, risk reduced) and normalize to $/hour for comparison.

- **Enterprise onboarding**: reduce manual provisioning time by 2,000 hours/year.
  - `value_per_hour = total_labor_cost_avoided_usd / (years * 365 * 24)`
- **Deal desk acceleration**: shorten time-to-contract by 10 days and improve close rate.
  - `value_per_hour = incremental_gross_margin_usd / (years * 365 * 24)`
- **Incident response**: reduce mean time to mitigation (MTTM) by 30%.
  - `value_per_hour = outage_cost_avoided_usd / (years * 365 * 24)`
- **Policy change management**: avoid compliance penalties.
  - `value_per_hour = expected_penalty_avoided_usd / (years * 365 * 24)`
- **Procurement**: consolidate vendors, lower unit cost.
  - `value_per_hour = annual_savings_usd / (years * 365 * 24)`
- **Hiring pipeline**: cut time-to-fill by 20%.
  - `value_per_hour = productivity_gain_usd / (years * 365 * 24)`

## Value-per-hour framing

To estimate value created per hour, divide the total value for a known time horizon by the total hours in that horizon:

```
value_per_hour = total_value_usd / (years * 365 * 24)
```

This provides a simple baseline that can be refined later with actual utilization or working-hour assumptions.

### Per-employee $/hour

For per-employee measurement, divide by employee count to compare across teams or organizations:

```
value_per_hour_per_employee = total_value_usd / (years * 365 * 24 * employee_count)
```

This makes it easy to compare outcomes across enterprises (e.g., hyperscalers and AI labs) on a normalized basis.

## Continuous compounding (value growth over time)

## Compounding (value growth over time)

When workflows compound (learning, automation, better routing), value can increase over time.

### Discrete compounding

```
compounded_value = initial_value * (1 + growth_rate) ^ years
compounded_value_per_hour = compounded_value / (years * 365 * 24)
```

### Continuous compounding

```
compounded_value = initial_value * e^(growth_rate * years)
compounded_value_per_hour = compounded_value / (years * 365 * 24)
```

Use the continuous form when value increases because the workflow improves itself (better models, better data, fewer rework loops).

### Compound compounding (reinforcing flywheels)

Some workflows create second-order effects (e.g., better data → better models → higher automation → more data). Model that with layered growth:

```
compound_growth = base_growth_rate + flywheel_growth_rate
compound_compounded_value = initial_value * e^(compound_growth * years)
```

Use this to capture reinforcing compounding loops for long-lived enterprise systems.

## Enterprise grouping taxonomy for $/hour

## Enterprise grouping taxonomy for $/hour (per employee and beyond)

Apply the same $/hour framing across an extensible set of groupings. The list below is intentionally expansive and can be extended indefinitely as new dimensions emerge.

### Organization structure (per employee lens)

- **Company** (global)
- **Subsidiary**
- **Region** (NA, EMEA, APAC, LATAM)
- **Country**
- **State/Province**
- **City/Metro**
- **Business unit**
- **Division**
- **Department**
- **Team**
- **Role family**
- **Individual employee**
- **Cost center**
- **Program**
- **Manager chain**
- **Cost center**
- **Office/site**
- **Labor type** (full-time, contractor, partner)

### Revenue structure

- **Product line**
- **SKU**
- **Tier/plan**
- **Customer segment** (SMB, mid-market, enterprise)
- **Industry**
- **Channel** (direct, partner, marketplace)
- **Sales region** (geo or territory)
- **Account portfolio**
- **Deal size band**
- **Pipeline stage**
- **Revenue stream** (subscription, usage-based, services)
- **Contract duration**
- **ARR band**
- **Contract term**
- **Pricing model** (usage, seat, hybrid)
- **Expansion vs. new logo**

### Operations structure

- **Workflow type**
- **Process stage**
- **Service line**
- **Support tier**
- **Compliance domain** (SOC 2, GDPR, HIPAA)
- **Risk tier**
- **Escalation level**
- **Approval authority band**
- **Automation tier**
- **Exception rate**
- **Backlog age**
- **SOP version**
- **Automation level**
- **Manual touchpoints**

### Time structure

- **Year**
- **Quarter**
- **Month**
- **Week**
- **Day**
- **Hour**
- **Shift**
- **Seasonality band**
- **Time zone**
- **Holiday/peak season**

### Performance/KPI structure

- **Throughput**
- **Cycle time**
- **Cost per transaction**
- **Error rate**
- **Rework rate**
- **Customer satisfaction**
- **Revenue per employee**
- **Gross margin**
- **Net retention**
- **Churn**
- **SLA adherence**
- **NPS**
- **CAC payback**
- **LTV**
- **ARR per employee**
- **Conversion rate**
- **Win rate**
- **Forecast accuracy**
- **Time to resolution**
- **Quality score**
- **Compliance pass rate**

### People & capacity

- **Headcount**
- **FTE**
- **Utilization**
- **Time to proficiency**
- **Training cohort**
- **Tenure band**
- **Attrition band**
- **Manager span of control**
- **Hiring funnel stage**
- **Attrition risk**
- **On-call rotation**

### Platform/infra

- **System**
- **Service**
- **API endpoint**
- **Deployment environment**
- **Model**
- **Model version**
- **Feature flag**
- **Vendor**
- **Cloud region**
- **Runtime**
- **Compute tier**
- **Storage tier**
- **Latency tier**

### Security & governance

- **Data classification**
- **Access tier**
- **Audit scope**
- **Policy set**
- **Regulatory requirement**
- **Third-party risk tier**
- **Threat severity**
- **Control family**
- **Exception type**

### Product & engineering

- **Feature area**
- **Release train**
- **Bug severity**
- **Engineering squad**
- **Service ownership**
- **Architecture domain**
- **Tech stack layer**

### Customer & market

- **Customer tier**
- **Use-case category**
- **Account health band**
- **NPS segment**
- **Support plan**

### Finance & planning

- **Budget vs. actual**
- **CapEx vs. OpEx**
- **Run rate**
- **Cash flow band**
- **Cost of goods**

### Legal & risk

- **Contract type**
- **Clause library**
- **Risk acceptance level**
- **Jurisdiction**
- **Litigation status**

### Knowledge compounding lenses

- **Artifact type** (transcript, decision, summary, evidence)
- **Knowledge graph node type**
- **Recall frequency**
- **Reusability score**
- **Automation coverage**
- **Feedback loop depth**
- **Model drift band**
- **Model retraining trigger**
- **Feedback loop stage**
- **Annotation tier**

Each grouping can be combined (e.g., “EMEA → Enterprise → Product Line A → Sales → Q2 → SLA adherence”) to produce a comparable $/hour value signal.
