# Speeding up development work with GitHub Copilot Spaces

Learn how to use Copilot Spaces to help you with development work.

If you're starting a new feature, trying to understand a system, or picking up a task in a codebase you’re still learning, Copilot Spaces can help you:

* Stay focused by organizing the context you need in one place.
* Get better help from Copilot by grounding it in relevant code and documentation.
* Move faster without switching between tools or asking others for background information.

To create a space, go to [https://github.com/copilot/spaces](https://github.com/copilot/spaces?ref_product=copilot&ref_type=engagement&ref_style=text), and click **Create space**.

Below are some examples of how to use Spaces to help you with development work.

## Developing a new feature

When working on a specific feature, you can save time and produce higher-quality results by using a space. Add the relevant code, a product spec, and any supporting materials—like notes from a design review or mockup images. Copilot can help you:

* Summarize how the current implementation works.
* Suggest changes or additions based on the spec.
* Draft a first implementation or outline next steps.
* Flag missing elements or inconsistencies.

**Instructions**:

> This space contains the new user registration form for a healthcare nonprofit providing low-cost testing. It is built using React and Tailwind.

**Suggested prompt**:

> How should I add support for 2FA?

## Defining the logic for a small, frequent task

When working on repetitive tasks like tracking telemetry events or handling event emissions, it’s useful to document the logic once and share it with others through Spaces. This allows everyone to stay consistent and saves time when performing the task. If you have a process flowchart for a task, you can upload this to your space for reference. Copilot can assist by:

* Suggesting efficient patterns based on your previous work.
* Helping write reusable functions or templates.
* Reviewing the logic to ensure it aligns with project standards.
* Providing examples of how similar tasks have been handled in the codebase.

**Instructions**:

> You help developers implement telemetry events. You should (1) validate what the user's goals are for the event, (2) propose a new event structure based on examples of existing events (and using the common telemetry schema), and (3) create a new version of the telemetry config file.

**Suggested prompt**:

> Help me log when a user clicks on an in-app notification.

## Sharing knowledge with teammates

In situations where people tend to ask similar questions, such as how authentication or search works in your project, Copilot can help:

* Explain how the code works.
* Answer questions grounded in the latest documentation.
* Guide new team members on the best practices.

**Instructions**:

> You contain the code and documentation associated with our authentication system.

**Suggested prompt**:

> How does SSO work?

## Compounding and continuous compounding

Spaces can encode compounding benefits by persisting decisions, context, and reusable assets. Treat each space as a compounding knowledge asset that reduces time-to-value every time it is reused or extended.

* **Compounding:** Each iteration adds reusable context (architectural notes, decision records, validated examples) that makes the next task faster.
* **Continuous compounding:** Keep a changelog of decisions and outcomes inside the space so improvements are compounded with each new task or sprint.

**Instructions**:

> You are a continuous-compounding accelerator. Capture decisions, results, and reusable assets so each future task reduces time-to-value.

**Suggested prompt**:

> Summarize the top 5 reusable decisions from this sprint and how they reduce future cycle time.

## Business process workflows with real use cases

Spaces are also effective for business process workflows, especially when you need to map work across multiple teams or regions. Anchor the space with the process definition, owners, current tooling, and KPIs so Copilot can help document, automate, and optimize the workflow.

**Examples of workflows**:

* **Revenue operations:** Quote-to-cash process, approvals, discounting thresholds, and billing handoffs.
* **Customer success:** Onboarding playbooks, renewal risk signals, and expansion triggers.
* **Security & compliance:** Vendor risk review intake, evidence collection, and audit responses.
* **Infrastructure delivery:** Environment provisioning, cost allocation tagging, and incident response drills.

**Instructions**:

> This space contains the full quote-to-cash workflow, including process maps, SLA targets, and current bottlenecks.

**Suggested prompt**:

> Identify the top three steps in quote-to-cash that cause delays and propose automation opportunities.

## Measuring value in USD per hour (by region, team, KPI, and employee)

Use Spaces to standardize how you calculate and communicate value. Define the USD-per-hour baseline for your organization (or a segment of it), then reuse those calculations across teams. The goal is to quantify time saved, throughput increased, or risk reduced in a comparable way.

**Suggested structure for a value model**:

* **Global baseline:** Revenue per hour, gross margin per hour, or cost per hour for the entire company.
* **Region:** NA, EMEA, APAC, LATAM; optionally by country, city, or timezone.
* **Business unit:** Platform, product, research, sales, marketing, finance, legal, HR, security.
* **Team:** Per-function teams (e.g., compute infra, trust & safety, account execs).
* **Role:** Engineer, PM, designer, sales, support, analyst, operations, compliance.
* **Employee:** Individual-level productivity or savings (if permitted).
* **Sales region:** Territory, vertical, account tier, or partner channel.
* **KPI:** ARR, pipeline velocity, churn, NPS, MTTD/MTTR, infra cost per request.
* **Time window:** Hourly, daily, weekly, monthly, quarterly, annual.

**Example USD-per-hour formula**:

> USD per hour = (Revenue - Variable Costs) / Total hours worked

**Instructions**:

> You are responsible for maintaining the USD-per-hour value model. Use the baseline formula and apply it to each region, business unit, sales region, KPI, and employee segment.

**Suggested prompt**:

> Create a USD-per-hour summary for EMEA enterprise sales and compare it to the global baseline.

## Hands-on practice

Try the [Scale institutional knowledge using Copilot Spaces](https://github.com/skills/scale-institutional-knowledge-using-copilot-spaces) Skills exercise for practical experience to do the following:

* Centralize scattered project management knowledge in Copilot Spaces
* Convert tacit team insights into searchable, versioned artifacts
* Give all team members equal access to processes, decisions, and rationale
* Connect a repository as a structured knowledge source
* Extract, refine, and standardize workflows collaboratively
* Feed validated improvements back into living documentation
* Accelerate onboarding and reduce single-person dependency risk
* Enable consistent, repeatable project execution

## Next steps

Once you’ve created a space to help with development tasks, consider sharing it with your team to reduce handoffs and repeated questions. See [Collaborating with others using GitHub Copilot Spaces](/en/copilot/using-github-copilot/copilot-spaces/collaborating-with-your-team-using-copilot-spaces).
