# CODE_REVIEW_GUIDE.md

This guide documents the architecture, purpose, and key patterns of every major part of the `session-completion-runtime` codebase. It is designed for code review, onboarding, and persistent knowledge.

---

## Top-Level Structure

- **README.md / QUICKSTART.md**: Entry points for project overview and setup instructions.
- **Makefile**: Unified build and deploy automation for all packages and surfaces.
- **package.json / tsconfig.json**: Monorepo workspace management and TypeScript configuration.
- **DEAL_VALUATION_DEFENSE.md / IMPLEMENTATION_STATUS.md / DEPLOY_AUTOMATION.md**: Strategic, status, and deployment documentation.

---

## bickford/
Core authority, canon, and OPTR logic. Implements proof-grade invariants, promotion gates, and non-interference.

- **index.ts**: Exports all core modules for unified import.
- **canon/types.ts**: Defines types for authority, canon items, invariants, constraints, actions, and traces. Foundation for all runtime logic.
- **canon/invariants.ts**: Declares formal invariants (e.g., timestamp/provenance, canon-only execution, promotion gates, non-interference). Enforces correctness boundaries.
- **canon/promotion.ts**: Implements the promotion gate logic—an item is promoted to CANON only if all four tests (resistance, reproducibility, invariant safety, feasibility impact) pass.
- **optr/run.ts**: Implements OPTR planning and execution logic. Scores candidate paths, enforces prerequisite gates, and separates planning from execution.
- **optr/nonInterference.ts**: Checks multi-agent non-interference. Ensures no agent’s action increases another’s expected time-to-value (TTV).

---

## demo/
Executable demos and presentation assets for technical and strategic validation.

- **demo-a.ts / demo-c.ts / demo-d.ts**: Executable TypeScript demos for different audiences (OpenAI, Defense, etc.).
- **DEMO_A_SCREENS.md / DEMO_C_SCREENS.md / DEMO_D_SCREENS.md**: Narration scripts for each demo.
- **events.jsonl / events-multi-agent.jsonl / events-adversarial.jsonl**: Demo event data for lifecycle and multi-agent scenarios.
- **generate-video.ts**: Script for generating demo videos.

---

## docs/
Structured documentation for financial, legal, and technical justification.

- **financial/**: Valuation defense and ROI modeling.
- **legal/**: Equity participation, IPO clauses, precedent-safe legal language.
- **technical/**: Architecture, integration, and demo guides.

---

## packages/
Submodules for mobile UI, dashboard, and bickford API integration.

- **bickford-mobile-ui/**: Expo/React Native mobile UI. Implements authority runtime surfaces for mobile.
- **demo-dashboard/**: Vite/React dashboard for web authority runtime.
- **bickford/**: API, extension, and scripts for authority runtime and canon integration.

---

## Key Architectural Patterns

- **Proof-Grade Invariants**: All authority and execution logic is gated by formal invariants, enforced in code and documented in canon/invariants.ts.
- **Promotion Gates**: Items are promoted to CANON only if all four tests pass, ensuring auditability and correctness.
- **Non-Interference**: Multi-agent actions are checked for interference, preventing authority escalation or denial-of-service.
- **Unified Build Automation**: Makefile and package.json scripts enable reproducible builds and deployments across all surfaces.
- **Separation of Planning and Execution**: OPTR logic separates candidate path planning from execution, supporting audit and traceability.

---

## How to Review

1. Start with README.md and QUICKSTART.md for project context.
2. Review bickford/canon/types.ts for foundational types.
3. Study bickford/canon/invariants.ts for correctness boundaries.
4. Examine bickford/canon/promotion.ts and optr/run.ts for runtime logic.
5. Explore demo/ for executable validation and presentation assets.
6. Reference docs/ for strategic, legal, and technical justification.
7. Use Makefile and package.json for build/deploy automation patterns.

---

This guide is a living document. Extend it as the codebase evolves to maintain persistent, lightweight architectural knowledge.
