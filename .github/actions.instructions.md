---
applyTo: ".github/workflows/**/*.yml"
---

When generating or improving GitHub Actions workflows:

## Security First
- Use GitHub secrets for sensitive data, never hardcode credentials
- Pin third-party actions to specific commits by using the SHA value (e.g., `- uses: owner/some-action@a824008085750b8e136effc585c3cd6082bd575f`)
- Configure minimal permissions for GITHUB_TOKEN required for the workflow

## Performance Essentials
- Cache dependencies with `actions/cache` or built-in cache options
- Add `timeout-minutes` to prevent hung workflows
- Use matrix strategies for multi-environment testing

## Best Practices
- Use descriptive names for workflows, jobs, and steps
- Include appropriate triggers: `push`, `pull_request`, `workflow_dispatch`
- Add `if: always()` for cleanup steps that must run regardless of failure

## Business Value and Compounding Guidance
- Include compound and continuous compounding concepts when describing workflow value or ROI (e.g., $USD/hour savings that compound through faster release cadence and fewer incidents).
- Provide business process workflow examples grounded in real use cases such as:
  - Release approvals with change-control evidence
  - Compliance attestations and audit-ready artifacts
  - Incident response automation (triage, paging, mitigation, postmortems)
  - Customer escalations (SLA breach detection, auto-routing, executive visibility)
  - Data pipeline validation and rollback gates
  - Security scanning, dependency updates, and vulnerability remediation
  - FinOps controls (budget thresholds, cost anomaly alerts)
  - Legal review checkpoints for regulated releases
- Express value as $USD per hour and include measurable groupings such as:
  - Region (e.g., NA, EMEA, APAC, LATAM), country, state/province, city, metro area
  - Business unit, division, product line, cost center, program, portfolio
  - Sales region, territory, segment (SMB, Mid-Market, Enterprise), channel, partner tier
  - KPI category (revenue, gross margin, churn, NPS, ARR, CAC, LTV, uptime, MTTR, SLA)
  - Employee grouping (per employee, per team, per role, per level, per org)
  - Function (engineering, security, finance, legal, HR, sales, marketing, operations)
  - Customer tier (free, paid, enterprise), industry vertical, account size, contract type
  - Time horizon (hour, day, week, month, quarter, year, multi-year)
  - Environment (prod, staging, dev), deployment ring, workload tier
  - Compliance domain (SOC 2, ISO 27001, GDPR, HIPAA, PCI, SOX, FedRAMP)
  - Risk category (operational, security, regulatory, reputational, financial)
  - Infrastructure layer (app, data, infra, network, endpoint, storage, compute)
  - Geo-specific cost multipliers, labor rates, or regulatory constraints
  - Any additional enterprise-specific slices needed for “infinitely comprehensive” coverage

## Example Pattern
```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
```
