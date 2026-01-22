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

## Value-per-hour framing

To estimate value created per hour, divide the total value for a known time horizon by the total hours in that horizon:

```
value_per_hour = total_value_usd / (years * 365 * 24)
```

This provides a simple baseline that can be refined later with actual utilization or working-hour assumptions.

## Continuous compounding (value growth over time)

When workflows feed compounding knowledge, automation, and tuning, their value can grow over time. A simple continuous compounding model:

```
compounded_value = initial_value * e^(growth_rate * years)
compounded_value_per_hour = compounded_value / (years * 365 * 24)
```

Use this when value increases because the workflow improves itself (better models, better data, fewer rework loops).

## Enterprise grouping taxonomy for $/hour

Use the same value-per-hour framing across a rich, extensible set of groupings. This list is intentionally broad so it can be expanded without limit as new dimensions emerge.

### Organization structure

- **Company** (global)
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

### Revenue structure

- **Product line**
- **SKU**
- **Tier/plan**
- **Customer segment** (SMB, mid-market, enterprise)
- **Industry**
- **Channel** (direct, partner, marketplace)
- **Sales region**
- **Account portfolio**
- **Deal size band**
- **Pipeline stage**

### Operations structure

- **Workflow type**
- **Process stage**
- **Service line**
- **Support tier**
- **Compliance domain** (SOC 2, GDPR, HIPAA)
- **Risk tier**
- **Escalation level**
- **Approval authority band**

### Time structure

- **Year**
- **Quarter**
- **Month**
- **Week**
- **Day**
- **Hour**
- **Shift**

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

### People & capacity

- **Headcount**
- **FTE**
- **Utilization**
- **Time to proficiency**
- **Training cohort**
- **Tenure band**

### Platform/infra

- **System**
- **Service**
- **API endpoint**
- **Deployment environment**
- **Model**
- **Model version**
- **Feature flag**
- **Vendor**

### Security & governance

- **Data classification**
- **Access tier**
- **Audit scope**
- **Policy set**
- **Regulatory requirement**

### Knowledge compounding lenses

- **Artifact type** (transcript, decision, summary, evidence)
- **Knowledge graph node type**
- **Recall frequency**
- **Reusability score**
- **Automation coverage**

Each grouping can be combined (e.g., “EMEA → Enterprise → Product Line A → Sales → Q2 → SLA adherence”) to produce a comparable $/hour value signal.
