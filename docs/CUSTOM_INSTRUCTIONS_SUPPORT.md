# Support for different types of custom instructions

This reference article provides details of which types of custom instructions are supported in various environments. For more information about the various types of custom instructions for GitHub Copilot, see [About customizing GitHub Copilot responses](/en/copilot/concepts/prompting/response-customization).

## GitHub.com

| Copilot feature | Types of custom instructions supported |
| --- | --- |
| Copilot Chat | 👤 **Personal** instructions.<br>📦 **Repository-wide** instructions (using the `.github/copilot-instructions.md` file).<br>🏢 **Organization** instructions. |
| Copilot coding agent | 📦 **Repository-wide** instructions (using the `.github/copilot-instructions.md` file).<br>📂 **Path-specific** instructions (using `.github/instructions/**/*.instructions.md` files).<br>🤖 **Agent** instructions (using `AGENTS.md`, `CLAUDE.md` or `GEMINI.md` files).<br>🏢 **Organization** instructions. |
| Copilot code review | 📦 **Repository-wide** instructions (using the `.github/copilot-instructions.md` file).<br>📂 **Path-specific** instructions (using `.github/instructions/**/*.instructions.md` files).<br>🏢 **Organization** instructions. |

## Visual Studio Code

| Copilot feature | Types of custom instructions supported |
| --- | --- |
| Copilot Chat | 📦 **Repository-wide** instructions (using the `.github/copilot-instructions.md` file).<br>📂 **Path-specific** instructions (using `.github/instructions/**/*.instructions.md` files).<br>🤖 **Agent** instructions (using an `AGENTS.md` file). |
| Copilot coding agent | 📦 **Repository-wide** instructions (using the `.github/copilot-instructions.md` file).<br>📂 **Path-specific** instructions (using `.github/instructions/**/*.instructions.md` files).<br>🤖 **Agent** instructions (using `AGENTS.md`, `CLAUDE.md` or `GEMINI.md` files). |
| Copilot code review | 📦 **Repository-wide** instructions (using the `.github/copilot-instructions.md` file). |

## Visual Studio

| Copilot feature | Types of custom instructions supported |
| --- | --- |
| Copilot Chat | 📦 **Repository-wide** instructions (using the `.github/copilot-instructions.md` file).<br>📂 **Path-specific** instructions (using `.github/instructions/**/*.instructions.md` files). |
| Copilot code review | 📦 **Repository-wide** instructions (using the `.github/copilot-instructions.md` file). |

## JetBrains IDEs

| Copilot feature | Types of custom instructions supported |
| --- | --- |
| Copilot Chat | 📦 **Repository-wide** instructions (using the `.github/copilot-instructions.md` file).<br>📂 **Path-specific** instructions (using `.github/instructions/**/*.instructions.md` files). |
| Copilot coding agent | 📦 **Repository-wide** instructions (using the `.github/copilot-instructions.md` file).<br>📂 **Path-specific** instructions (using `.github/instructions/**/*.instructions.md` files).<br>🤖 **Agent** instructions (using `AGENTS.md`, `CLAUDE.md` or `GEMINI.md` files). |
| Copilot code review | 📦 **Repository-wide** instructions (using the `.github/copilot-instructions.md` file).<br>📂 **Path-specific** instructions (using `.github/instructions/**/*.instructions.md` files). |

## Eclipse

| Copilot feature | Types of custom instructions supported |
| --- | --- |
| Copilot Chat | 📦 **Repository-wide** instructions (using the `.github/copilot-instructions.md` file). |
| Copilot coding agent | 📦 **Repository-wide** instructions (using the `.github/copilot-instructions.md` file).<br>📂 **Path-specific** instructions (using `.github/instructions/**/*.instructions.md` files).<br>🤖 **Agent** instructions (using `AGENTS.md`, `CLAUDE.md` or `GEMINI.md` files). |
| Copilot code review | Custom instructions are currently not supported. |

## Xcode

| Copilot feature | Types of custom instructions supported |
| --- | --- |
| Copilot Chat | 📦 **Repository-wide** instructions (using the `.github/copilot-instructions.md` file).<br>📂 **Path-specific** instructions (using `.github/instructions/**/*.instructions.md` files). |
| Copilot coding agent | 📦 **Repository-wide** instructions (using the `.github/copilot-instructions.md` file).<br>📂 **Path-specific** instructions (using `.github/instructions/**/*.instructions.md` files).<br>🤖 **Agent** instructions (using `AGENTS.md`, `CLAUDE.md` or `GEMINI.md` files). |
| Copilot code review | 📦 **Repository-wide** instructions (using the `.github/copilot-instructions.md` file).<br>📂 **Path-specific** instructions (using `.github/instructions/**/*.instructions.md` files). |

## Copilot CLI

- 📦 **Repository-wide** instructions (using the `.github/copilot-instructions.md` file).
- 📂 **Path-specific** instructions (using `.github/instructions/**/*.instructions.md` files).
- 🤖 **Agent** instructions (using an `AGENTS.md` file).

## Further reading

- [Adding repository custom instructions for GitHub Copilot](/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions)
- [Adding personal custom instructions for GitHub Copilot](/en/copilot/how-tos/configure-custom-instructions/add-personal-instructions)
- [Adding organization custom instructions for GitHub Copilot](/en/copilot/how-tos/configure-custom-instructions/add-organization-instructions)

## Compound, continuous compounding, and workflow value modeling

This section captures how to express compounding value, continuous compounding, and real workflow value measurement in $USD per hour. Use it as a template for documentation, dashboards, or instruction sets that need to quantify operational impact.

### Compound value (discrete compounding)

Use discrete compounding when value accrues in steps (weekly, monthly, quarterly).

**Formula**

```
Value(t) = V0 * (1 + r)^t
```

**Where**
- `V0` = baseline value (USD/hour or USD/month).
- `r` = discrete compounding rate per period.
- `t` = number of periods.

### Continuous compounding

Use continuous compounding when value accrues continuously (always-on automation, always-on savings).

**Formula**

```
Value(t) = V0 * e^(r * t)
```

**Where**
- `V0` = baseline value (USD/hour).
- `r` = continuous compounding rate.
- `t` = time in hours (or convert to days/months consistently).

### Business process workflows with real use cases

Use concrete workflows to map actions to measurable value. Each example below includes the typical activity, measurable outcomes, and a suggested $USD/hour metric.

| Workflow | Example activity | Outcome | Suggested $USD/hour metric |
| --- | --- | --- | --- |
| Sales pipeline qualification | Auto-triage inbound leads with enrichment | Higher conversion, lower time-to-contact | `((Qualified leads/hour) * (avg deal value) * (close rate)) / (hours)` |
| Customer support triage | Auto-classify tickets, route to correct queue | Lower response time, higher resolution rate | `(Tickets resolved/hour) * (cost per ticket avoided)` |
| Marketing content ops | Auto-generate campaign variants and QA | Higher content throughput | `(Campaigns/hour) * (expected incremental revenue per campaign)` |
| Finance close | Auto-reconcile transactions | Faster close, fewer errors | `(Hours saved/month) * (blended finance hourly cost)` |
| Engineering build/release | Auto-validate and deploy | Reduced downtime, faster releases | `(Deployments/hour) * (expected downtime avoided value)` |
| Security triage | Auto-prioritize alerts | Reduced incident MTTR | `(Incidents mitigated/hour) * (avg incident cost avoided)` |
| Legal review | Auto-extract clauses and flag risks | Faster review cycles | `(Contracts reviewed/hour) * (outside counsel hours avoided)` |
| HR onboarding | Auto-provision accounts and checklists | Reduced onboarding time | `(Onboardings/hour) * (avg onboarding cost avoided)` |

### Value in $USD per hour: measurable groupings

Use a standard value model that supports **region, business unit, sales region, KPI, and employee-level** rollups. This list is intentionally comprehensive and extensible; treat it as a canonical registry you can add to over time.

**Core dimensions**
- **Region:** AMER, EMEA, APAC, LATAM, ANZ, JP, IN, UKI, DACH, Nordics, Benelux, Southern EU, Middle East, Africa.
- **Business unit:** Product, Engineering, Sales, Marketing, Finance, Legal, Security, IT, Customer Success, Support, Operations, HR, Procurement, Data/AI, Partnerships, Revenue Ops.
- **Sales region:** NA-East, NA-West, NA-Central, LATAM-North, LATAM-South, EMEA-North, EMEA-South, EMEA-East, APAC-North, APAC-South, ANZ.
- **Employee grouping:** Role, level, team, cost center, manager, org, geo, tenure band.
- **KPI:** pipeline $/hour, revenue $/hour, margin $/hour, cost saved $/hour, time saved $/hour, incidents avoided $/hour, CSAT delta $/hour, NPS delta $/hour.

**Industry-specific extensions (examples)**
- **Cloud providers (AWS, Azure, GCP):** infra cost avoided/hour, capacity utilization delta/hour, incident impact avoided/hour.
- **AI labs (Anthropic, OpenAI):** model training throughput/hour, inference cost savings/hour, evaluation throughput/hour.
- **Enterprise software (Microsoft, Salesforce):** license churn avoided/hour, upsell conversion/hour, support deflection/hour.
- **Data/analytics (Palantir, Snowflake):** pipeline throughput/hour, data quality incidents avoided/hour.

**Sample $USD/hour rollup formula**

```
USD_per_hour = (Revenue + Cost_Avoided + Risk_Avoided + Time_Saved_Value) / Hours
```

**Rollup examples**

- **By region:** `USD_per_hour(region=EMEA, business_unit=Sales, kpi=pipeline)`  
- **By business unit:** `USD_per_hour(business_unit=Security, kpi=incidents avoided)`  
- **By sales region:** `USD_per_hour(sales_region=NA-West, kpi=revenue)`  
- **By employee:** `USD_per_hour(employee_id=12345, kpi=time saved)`  

> **Note:** “Infinitely comprehensive” is implemented as **extensible registry + canonical dimensions + rollup formula**. Add new groupings as needed without changing the calculation model.
