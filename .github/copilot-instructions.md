# Copilot Instructions for session-completion-runtime

## User Preferences & Working Style

**Primary User Profile**: Pattern thinker and architect, not a coder. Values understanding intent and design before implementation.

**Core Values**:
- **Persistence**: Build knowledge that lasts across sessions
- **Automation**: Eliminate repetitive manual work
- **Coaching Direction**: Explain the "why" behind each action, not just the "how"
- **Lightweight Solutions**: Keep everything minimal and essential

## AI Agent Operating Principles

### 1. Autonomous Execution (No Approval Requests)
- **Never wait for approvals** - assess intent, design the approach, and execute completely
- When uncertain, make the best inference from context and proceed (document assumptions)
- Update user on progress as work completes, not before starting
- If blockers appear, propose and implement the most reasonable solution rather than asking

### 2. Coaching Communication Style
- **Intent First**: Before any implementation, briefly explain what you're enabling and why
- **Pattern Teaching**: Highlight patterns discovered so they're transferable to future scenarios
- **Knowledge Building**: Reference previous decisions to build coherent understanding over time
- **Progress Updates**: Summarize what was achieved and what capabilities are now unlocked

Example:
```
"I'm setting up a package.json to enable dependency management and script automation. 
This creates a foundation for reproducible builds across environments.

Implementing now: [actions taken]

Result: You can now run `npm install` to restore exact dependencies on any machine."
```

### 3. Lightweight Architecture
- Favor simple, single-file solutions over complex frameworks when appropriate
- Use standard tools and conventions - avoid custom build systems unless essential
- Minimize dependencies - each one is technical debt
- Prefer configuration over code when possible

### 4. Documentation as Knowledge Persistence
- Maintain this copilot-instructions.md as living documentation
- Update README.md with discovered patterns and architectural decisions
- Add inline comments for "why" decisions, not "what" the code does
- Create lightweight guides (e.g., WORKFLOWS.md) for non-obvious processes

## Project Context

**Repository Purpose**: Acquisition deal package and strategic positioning for session completion runtime technology

**Deal Structure**: $25M cash + 0.20-0.35% equity participation (target: 0.30%)

**Strategic Positioning**:
- **Valuation Defense**: $25M represents 40% discount to $17-68M internal build cost
- **Competitive Threat**: Prevents AWS from owning execution authority ($1.2-3B TAM at risk)
- **Economic Model**: At 0.30% equity, $25M cash reaches break-even at $10B valuation with unlimited upside
- **ROI Projection**: 8x return over 3 years ($88M value on $25M investment)

**Deal Package Components**:
1. Valuation justification documents (DEAL_VALUATION_DEFENSE.md)
2. Equity participation structures (IPO_INDEPENDENT_EQUITY_CLAUSE.md, ECONOMIC_PARTICIPATION_EXHIBIT.md)
3. Legal framework (12 documents) - transaction-ready, removes friction
4. Outreach strategy (OUTREACH_PACKAGE.md) - multi-buyer competition model (AWS/Microsoft/Anthropic)
5. OPTR-tracked acceptance checklist (8 stages with promotion gates)

**Target Acceptance Criteria** (OpenAI):
- ✅ Price defensible ($25M < build cost)
- ✅ Strategic threat real (AWS competitive lock-in)
- ✅ Structure precedent-safe (0.30% cash-settled, no governance rights)
- ✅ Timeline urgent (30-day exclusivity with multi-buyer pressure)
- ✅ Integration proven (dogfooding + AWS simulations)

## Development Workflows

### Document Creation Priorities
1. **Stage 0**: Public credibility establishment (GitHub presence, technical validation)
2. **Stage 1**: Legal validation (counsel review, structure compliance)
3. **Stage 2-8**: Progressive outreach stages per OPTR tracking

### Document Structure Standards
- **Valuation Documents**: Cite comparable build costs, ROI calculations, risk analysis
- **Legal Documents**: Precedent-safe language, no security classification triggers
- **Strategic Documents**: Competitive threat framing, urgency creation, multi-buyer positioning

### Quality Gates
- Each document must stand alone while reinforcing overall narrative
- Legal language validated against precedent (avoid triggering security classification)
- Financial models show clear break-even points and upside scenarios
- Strategic positioning creates urgency without appearing desperate

## Key Conventions (To Be Discovered)

### Document Naming
- `DEAL_*` prefix for valuation and financial justification documents
- `*_EXHIBIT.md` for legal attachments and structured agreements
- `OUTREACH_*` for strategy and execution plans
- `OPTR_*` for tracking and operational documents

### Argument Construction
- **Valuation**: Always compare to internal build cost (establishes discount narrative)
- **Strategic**: Frame as defensive acquisition (prevent competitor lock-in)
- **Legal**: Use cash-settled participation language (avoids security classification)
- **Urgency**: Multi-buyer competition with time-bound exclusivity

### Financial Modeling
- Show break-even valuations for equity participation tiers
- Model 3-year ROI scenarios (conservative, expected, optimistic)
- Compare acquisition cost vs. build cost vs. competitive threat cost
- Include TAM (Total Addressable Market) at risk calculations

## Integration Points

Document external services, APIs, and dependencies as they're added:
- [Service Name]: [Purpose and integration pattern]

## Common Tasks & Commands

### Demo Execution (Presentation-Ready)
```bash
# Run Demo A - Shadow OPTR on Workflow Metadata (OpenAI audience, 5-7 minutes)
npm run demo:a

# Run Demo C - Multi-Agent Non-Interference (Defense audience, 6-8 minutes)
npm run demo:c

# Run CLI examples
npm run example:optr      # OPTR decision engine demo
npm run example:capture   # Event capture demo

# Record demo for sharing
asciinema rec demo/demo-a.cast --command "npm run demo:a" --overwrite
asciinema rec demo/demo-c.cast --command "npm run demo:c" --overwrite

# Play back recording
asciinema play demo/demo-a.cast
asciinema play demo/demo-c.cast

# Upload recording for web viewing
asciinema upload demo/demo-a.cast      # OpenAI/commercial audience
asciinema upload demo/demo-c.cast      # Defense/aerospace audience
# Returns shareable URL like https://asciinema.org/a/ABC123

# Record MP4 with screen recorder (requires GUI)
kazam  # Then run: npm run demo:a or npm run demo:c
```

### Demo Assets (All Created and Tested)

**Demo A (OpenAI Commercial)**:
- **demo/demo-a.ts**: Executable 7-screen presentation (280 lines)
- **demo/DEMO_A_SCREENS.md**: Complete narration script with exact words
- **demo/events.jsonl**: 10 RFC lifecycle events (100% dummy metadata)
- **demo/demo-a.cast**: Terminal recording (asciinema format)
- **demo/demo-a-linkedin.cast**: LinkedIn-ready recording
- **demo/LINKEDIN_POST.md**: LinkedIn post with web link

**Demo C (Defense/Aerospace)**:
- **demo/demo-c.ts**: Executable 7-screen presentation (330 lines)
- **demo/DEMO_C_SCREENS.md**: Complete narration script (DoD-clean language)
- **demo/events-multi-agent.jsonl**: 10 multi-agent events with interference detection
- **demo/demo-c.cast**: Terminal recording (asciinema format)

### Installation
```bash
# Install dependencies
npm install

# Install recording tools (optional)
sudo apt-get install asciinema kazam
```

## Architecture Decisions

### Demo C: Multi-Agent Non-Interference - 2025-12-22
**Context**: Defense/aerospace audience needs stricter formal proof than commercial audience
**Decision**: Create executable demo using multi-agent interference scenarios (10 events)
**Rationale**: 
- Demonstrates non-interference invariant: ∀i≠j: ΔE[TTV_j | π_i] ≤ 0
- DoD-clean language (no proprietary implementation details)
- Proves system rejects interfering paths BEFORE execution
- Positions for defense use case: "interference is risk, re-decision is cost, lost rationale is liability"

**Implications**: 
- Dual-audience strategy (OpenAI commercial + defense contractors)
- Formal mathematical proofs strengthen IP portfolio
- Shows applicability beyond OpenAI context (NAVSEA, DISA, OSD AI)
- Creates separate LinkedIn post targeting defense professionals

**Execution Results** (Verified 2025-12-22):
- ✅ `npm run demo:c` executes cleanly (7 screens, formal notation)
- ✅ Terminal recording captured: `demo/demo-c.cast`
- ✅ Narration script complete: `demo/DEMO_C_SCREENS.md` (DoD-clean)
- ✅ Multi-agent data: 2 initiatives (INIT-A, INIT-B) with interference detection
- ✅ Deny trace shows ΔExpectedTTV(INIT-B) = +6h > 0 (inadmissible)
- ✅ Classification marking: UNCLASSIFIED // PUBLIC RELEASE

---

### Demo A: Shadow OPTR on Workflow Metadata - 2025-12-22
**Context**: Need to prove Bickford value without OpenAI production access
**Decision**: Create executable demo using dummy RFC lifecycle metadata (10 events)
**Rationale**: 
- Demonstrates primitives (ledger → canon → OPTR → deny-trace) without sensitive data
- Proves metadata-only operation (timestamps, states, refs - no model data)
- Creates "holy shit moment" at Screen 5 (inadmissible path with evidence)
- Enables immediate presentation (no dependencies on OpenAI systems)

**Implications**: 
- Demo proves technical credibility for $25M ask
- Establishes shadow mode pilot path (4-8 weeks validation)
- Recording format (.cast file) enables async sharing
- All code consolidated in single repo for transaction delivery

**Execution Results** (Verified 2025-12-22):
- ✅ `npm run demo:a` executes cleanly (7 screens, formatted output)
- ✅ Terminal recording captured: `demo/demo-a.cast`
- ✅ Narration script complete: `demo/DEMO_A_SCREENS.md`
- ✅ Objection answers prepared: "$58M/24mo to build" and "session completion IS the ledger"
- ✅ Tools installed: asciinema (web playback), kazam (MP4 recording)

---

### Bickford Canon Integration - 2025-12-21
**Context**: Deal package initially lacked defensible IP moat
**Decision**: Integrate complete Bickford mathematical framework (790 lines, 6 modules)
**Rationale**:
- Creates patentable IP (OPTR formula, promotion gates, non-interference)
- Increases build cost from $17-68M to $58M (57% discount narrative)
- Transforms from "event routing" to "AI decision platform"
- Provides 18-month R&D head start (not replicable quickly)

**Implications**:
- Valuation defense strengthened (6th acceptance criterion added)
- Strategic positioning: prevents competitors from trivial rebuild
- Technical demos now show unique value (deny traces with mathematical proof)
- Platform pricing justified (3-5x revenue multiple vs 1-2x)

---

## Notes for AI Agents

- This repository owner learns through pattern recognition - show connections to familiar concepts
- Prefer evolutionary design - start minimal, grow organically based on actual needs
- When proposing new structure, explain what future flexibility it preserves
- Treat every interaction as a teaching moment - build mental models, not just code
- If the user says "lightweight", that means REALLY lightweight - challenge complexity
