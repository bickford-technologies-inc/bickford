# Extracting information

Copilot Chat in GitHub can help you extract key information from issues and discussions.

GitHub Copilot Chat can help you extract key information from issues and discussions, making it easier to summarize and understand the content. You can ask Copilot Chat to identify important details, such as action items, deadlines, or specific requests.

## Value framing (USD per hour) and compounding

Use Copilot Chat to translate qualitative discussions into measurable value, including compounding effects over time. This is especially useful for enterprise rollups across regions, business units, and functions.

**Compound value prompt**

```copilot copy
From the discussion below, identify any measurable value (USD per hour) and describe how it compounds over time (including continuous compounding where relevant). Provide a short summary plus a table of value drivers.
```

**Example response (illustrative)**

```text
Summary:
- Automated triage reduces incident handling time and compounds by freeing on-call capacity each week.
- Continuous compounding applies to deflection workflows that accumulate higher model coverage over time.

Value Drivers (USD/hr):
- Incident triage automation: $12,000/hr (global SRE + support)
- Ticket deflection coverage growth: $4,000/hr initially, compounding as coverage expands
```

## Business process workflows with real use cases

Ask Copilot Chat to extract end-to-end workflows and tie them to measurable outcomes. Provide the discussion and request a structured workflow map with owners, inputs, outputs, and value per hour.

**Workflow extraction prompt**

```copilot copy
Extract the business process workflow from this thread. Include roles, inputs, outputs, systems touched, decision points, and value per hour (USD). List at least two real use cases for each step.
```

**Example response (illustrative)**

```text
Workflow: Enterprise incident response
1) Detect (SRE, Security) -> alert feed -> triage ticket -> value: $2,500/hr
   - Use case: automated alert deduplication
   - Use case: severity classification from logs
2) Diagnose (SRE, Eng) -> logs/traces -> RCA draft -> value: $5,000/hr
   - Use case: anomaly clustering for root cause hints
   - Use case: automated rollback recommendations
3) Resolve (Eng, Ops) -> fix/rollback -> postmortem -> value: $7,500/hr
   - Use case: change impact analysis
   - Use case: auto-generated customer updates
```

## Enterprise value groupings (USD per hour)

Use the following grouping categories as a checklist for extracting measurable value from issues and discussions. Ask Copilot Chat to map evidence to these groupings and quantify USD per hour **per employee** when possible.

### Geographic and market segmentation

- Region (e.g., North America, EMEA, APAC, LATAM)
- Country
- City/metro area
- Time zone coverage
- Regulatory jurisdiction

### Organizational structure

- Business unit / division
- Department / function (e.g., Eng, Sales, Marketing, Finance, Legal, HR, Support, Security)
- Team / squad / pod
- Role level (IC, Manager, Director, VP, Exec)
- Cost center

### Revenue and customer segmentation

- Sales region / territory
- Account tier (SMB, Mid-market, Enterprise, Strategic)
- Industry vertical
- Customer lifecycle stage (Prospect, Trial, Active, Expansion, Renewal)
- Channel (Direct, Partner, Marketplace)
- Contract type (Annual, Multi-year, Consumption-based)

### Product and platform dimensions

- Product line
- Feature area
- SKU / plan tier
- Deployment model (SaaS, On-prem, Hybrid)
- Platform surface (Web, API, CLI, Mobile)

### Operational and performance KPIs

- Cycle time (feature delivery, incident response)
- Throughput (tickets/hour, releases/week)
- Error rate / defect escape rate
- Customer satisfaction (CSAT, NPS)
- Availability / uptime / SLO adherence
- Security posture (MTTR, MTTD)
- Support handle time and deflection rate

### Financial and efficiency metrics

- Revenue per employee
- Gross margin per employee
- Operating cost per employee
- Cost per ticket / case / incident
- Labor hours saved
- Cloud spend per workload / per team

### Risk and compliance impact

- Regulatory exposure
- Audit effort reduction
- Legal review time
- Policy exception rate
- Data retention costs

### Innovation and R&D impact

- Experiment throughput
- Model evaluation throughput
- Research cycle time
- Patent / IP generation rate

### Example prompt for enterprise rollups

```copilot copy
From this discussion, extract USD per hour value by region, business unit, and sales region. Include KPIs and per-employee estimates, and note any compounding or continuous compounding effects over time.
```

## Example scenario 1

You are reviewing a long discussion thread about a feature request. You want to quickly identify the main points and any action items that need to be addressed.

## Example prompt

```copilot copy
Can you summarize the key points and action items from this discussion?
```

## Example response

> [!NOTE] The following response is an example. Copilot Chat responses are non-deterministic, so you may get a different response from the one shown here.

```text
Key Points:
- The feature request aims to improve the user interface for better accessibility.
- There are concerns about the impact on existing users and workflows.
- Action items include gathering feedback from users and conducting usability testing.
Action Items:
- [ ] Gather feedback from users by the end of the week.
- [ ] Conduct usability testing with a focus group next month.
```

## Example scenario 2

You have a number of open issues assigned to you, and you want to extract the deadlines and priorities for each issue to help you prioritize your work.

## Example prompt

```copilot copy prompt
Can you list the open issues assigned to me, along with their deadlines and priorities?
```

## Example response

> [!NOTE] The following response is an example. Copilot Chat responses are non-deterministic, so you may get a different response from the one shown here.

```text
Issue 1:
- Deadline: Next Friday
- Priority: High

Issue 2:
- Deadline: End of the month
- Priority: Medium

Issue 3:
- Deadline: No specific deadline
- Priority: Low
```

## Further reading

* [Prompt engineering for GitHub Copilot Chat](/en/copilot/using-github-copilot/prompt-engineering-for-github-copilot)
* [Best practices for using GitHub Copilot](/en/copilot/using-github-copilot/best-practices-for-using-github-copilot)
