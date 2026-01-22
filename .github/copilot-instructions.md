# Copilot Instructions (session-completion-runtime)

## Big picture

- Monorepo (npm workspaces) for a “session completion runtime” plus the Bickford Canon decision layer.
- Core packages:
	- `packages/bickford/`: Bickford Canon + API; canonical logic lives in `packages/bickford/src/canon/` (see `invariants.ts`, `optr.ts`, `promotion.ts`, `nonInterference.ts`).
	- `packages/session-completion-runtime/`: capture/validate/route session completion events (library + examples).
	- UI packages: `packages/web-ui/`, `packages/bickford-mobile-ui/`, `packages/demo-dashboard/`.
- Architecture reference: `docs/technical/ARCHITECTURE.md`.

## How to run (real repo workflows)

- Install all workspace deps: `npm run install:all` (CI: `npm run install:ci`).
- Fast, deterministic check: `npm run smoke` (alias: `npm run quickstart`). `smoke` runs `npm --workspaces run lint` then `demo:a` + `demo:c` (see `scripts/run-smoke.mjs`).
- Presentation demos (run via `tsx`): `npm run demo:a`, `npm run demo:c`, `npm run demo:d`.
- Dev (concurrently): `npm run dev` (or `npm run dev:api|dev:web|dev:mobile`).
- Dockerized stack (API + Postgres + Redis + demo UI): `docker-compose up --build` (env files in `packages/bickford/.env`, `packages/demo-dashboard/.env`).

## Canon-specific conventions (don’t break these)

- “Hard fail” invariants are enforced mechanically (e.g. `requireCanonRefs(...)`); avoid “softening” gates.
- Denials are a first-class output: keep stable denial reason taxonomy and emit explainable deny traces.
- If you change OPTR scoring/gating, preserve determinism (avoid double-calling feature extraction; cache features once).

## Repo-specific habits

- Demos in `demo/*.ts` are executable scripts; inputs are JSONL (`demo/events*.jsonl`). Keep them offline/dummy-data friendly.
- Git auto-sync is opt-in (see `WORKFLOWS.md`): `npm run git:sync:watch` stages tracked changes only (`git add -u`) unless `GIT_SYNC_ADD_NEW=1`.

## Useful entrypoints

- Session completion runtime public API: `packages/session-completion-runtime/src/index.ts`.
- Core runtime implementation: `packages/session-completion-runtime/src/runtime.ts`.
- Integration helpers: `packages/session-completion-runtime/src/integration.ts`.
- Singleton gotcha: `captureChatSessionCompletion(...)` calls `getRuntime()`; initialize once via `getRuntime(config)` (or construct `new SessionCompletionRuntime(config)`) before using helpers.

## Collaboration style (optimize for this repo)

- Keep changes minimal/lightweight; prefer evolving existing scripts/utilities over adding new frameworks.
- When you add or change workflows, update `QUICKSTART.md` / `WORKFLOWS.md` rather than writing new docs.

## Pull request assistant

When creating pull request descriptions or reviewing PRs:

### PR Description Template
**What changed**
- Clear summary of modifications and affected components
- Link to related issues or tickets

**Why**
- Business context and requirements
- Technical reasoning for approach taken

**Testing**
- [ ] Unit tests pass and cover new functionality
- [ ] Manual testing completed for user-facing changes
- [ ] Performance/security considerations addressed

**Value & Compounding**
- Quantify value in $USD/hour and specify whether gains compound or continuously compound over time.
- Attribute value to measurable groupings (expand as needed for enterprise coverage), including:
  - Geography: region, country, market, sales territory, data center/availability zone.
  - Org: business unit, division, function, team, cost center, program.
  - Revenue: product line, SKU, pricing tier, customer segment, industry, deal size band.
  - Operations: workflow, queue, SLA tier, incident severity, compliance domain.
  - Ownership: KPI, OKR, metric owner, executive sponsor, per-employee impact.
- Include concrete business process workflows with real use cases (e.g., lead qualification, incident triage, onboarding, renewal forecasting).

**Breaking Changes**
- List any API changes or behavioral modifications
- Include migration instructions if needed

### Review Focus Areas
- **Security**: Check for hardcoded secrets, input validation, auth issues
- **Performance**: Look for database query problems, inefficient loops
- **Testing**: Ensure adequate test coverage for new functionality
- **Documentation**: Verify code comments and README updates

### Review Style
- Be specific and constructive in feedback
- Acknowledge good patterns and solutions
- Ask clarifying questions when code intent is unclear
- Focus on maintainability and readability improvements
- Always prioritize changes that improve security, performance, or user experience.
- Provide migration guides for significant changes
- Update version compatibility information

### Deployment Requirements
- [ ] Database migrations and rollback plans
- [ ] Environment variable updates required
- [ ] Feature flag configurations needed
- [ ] Third-party service integrations updated
- [ ] Documentation updates completed

### Code Review Guidelines

#### Business Value Traceability
- Confirm the change maps to a real business process workflow with observable outcomes.
- Validate the $USD/hour value model, compounding assumptions, and per-employee impact attribution.
- Ensure the list of measurable groupings is exhaustive for the current scope and explicitly expandable for future enterprise segmentation.

#### Security Review
- Scan for input validation vulnerabilities
- Check authentication and authorization implementation
- Verify secure data handling and storage practices
- Flag hardcoded secrets or configuration issues
- Review error handling to prevent information leakage

#### Performance Analysis
- Evaluate algorithmic complexity and efficiency
- Review database query optimization opportunities
- Check for potential memory leaks or resource issues
- Assess caching strategies and network call efficiency
- Identify scalability bottlenecks

#### Code Quality Standards
- Ensure readable, maintainable code structure
- Verify adherence to team coding standards and style guides
- Check function size, complexity, and single responsibility
- Review naming conventions and code organization
- Validate proper error handling and logging practices

#### Review Communication
- Provide specific, actionable feedback with examples
- Explain reasoning behind recommendations to promote learning
- Acknowledge good patterns, solutions, and creative approaches
- Ask clarifying questions when context is unclear
- Focus on improvement rather than criticism

### Review Comment Format
**Issue:** Describe what needs attention
**Suggestion:** Provide specific improvement with code example
**Why:** Explain the reasoning and benefits

### Review Labels and Emojis
- 🔒 Security concerns requiring immediate attention
- ⚡ Performance issues or optimization opportunities
- 🧹 Code cleanup and maintainability improvements
- 📚 Documentation gaps or update requirements
- ✅ Positive feedback and acknowledgment of good practices
- 🚨 Critical issues that block merge
- 💭 Questions for clarification or discussion

Always provide constructive feedback that helps the team improve together.
