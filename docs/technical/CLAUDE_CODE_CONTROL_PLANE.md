# Claude Code Control Plane Runtime Contract

This guide captures the **Claude Code control plane** as a runtime contract: how identity, model routing, execution authority, and lifecycle settings combine to deliver auditable, enterprise-ready behavior.

## 1) Identity & Model Routing

These variables decide **which Claude**, **from where**, and **under what auth model** Claude Code runs.

### Core authentication (pick one)

**Direct Anthropic (most common)**
- `ANTHROPIC_API_KEY`
- Or `/login` (interactive, preferred for humans)

**Enterprise / gateway paths**
- **Azure Foundry**
  - `ANTHROPIC_FOUNDRY_API_KEY`
  - `ANTHROPIC_FOUNDRY_BASE_URL` *or* `ANTHROPIC_FOUNDRY_RESOURCE`
- **AWS Bedrock**
  - `CLAUDE_CODE_USE_BEDROCK=1`
  - `AWS_BEARER_TOKEN_BEDROCK`
- **GCP Vertex**
  - `CLAUDE_CODE_USE_VERTEX=1`
  - `VERTEX_REGION_*`

**Key idea:** Claude Code is **provider-agnostic**. The same runtime, different trust boundary.

## 2) Model Selection & Cost / Performance Control

These controls define **which model handles which kind of work** and the cost/performance tradeoffs.

### Defaults
- `ANTHROPIC_MODEL`
- `ANTHROPIC_DEFAULT_HAIKU_MODEL`
- `ANTHROPIC_DEFAULT_SONNET_MODEL`
- `ANTHROPIC_DEFAULT_OPUS_MODEL`
- `CLAUDE_CODE_SUBAGENT_MODEL`

Typical pattern:
- **Opus** → deep reasoning, architecture
- **Sonnet** → coding, analysis
- **Haiku** → background / fast tasks

### Cost & performance governors
- `CLAUDE_CODE_MAX_OUTPUT_TOKENS`
- `MAX_THINKING_TOKENS`
- `DISABLE_COST_WARNINGS`
- `DISABLE_PROMPT_CACHING*`

**Important tradeoff:** More thinking tokens = better reasoning, but worse prompt-caching efficiency.

## 3) Memory, Context & Lifecycle Control

This is where Claude Code stops feeling “chatty” and starts acting **deterministically**.

### Context & compaction
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`
  - Default ≈ 95%
  - Set lower (e.g. 50) for long-running sessions
- Status line exposes actual usage

### Session behavior
- `CLAUDE_CODE_EXIT_AFTER_STOP_DELAY`
- `CLAUDE_CODE_TASK_LIST_ID` (shared task memory across sessions)
- `CLAUDE_CONFIG_DIR` (fully relocatable state)

**Key insight:** Claude Code is built for **long-lived workflows**, not just chats.

## 4) Tools & Execution Authority

### Tool permissions are explicit
Every tool has a defined **permission boundary**.

| Tool | Risk level |
| --- | --- |
| Read / Grep / Glob | Low |
| Bash | High |
| Edit / Write | Very High |
| WebFetch | External risk |
| MCP tools | Depends on connector |

Controls include:
- `/allowed-tools`
- Org-managed policy
- Tool-specific rules

This is **execution governance**, not vibes.

## Bash tool: gotchas people miss

### Persistence rules
- ✅ Working directory persists
- ❌ Environment variables do **not**

### Correct ways to persist env
**Best (team-safe):**
- `CLAUDE_ENV_FILE`
- `SessionStart` hook

This lets you encode:
- Venv activation
- Secrets loading
- Tooling paths

Without leaking state into Claude’s reasoning.

## Hooks = guardrails + automation

Hooks let you:
- Auto-format after edits
- Block writes to prod files
- Log all Bash commands
- Enforce policy **before** damage

This is why Claude Code passes enterprise security review.

## Telemetry & Privacy

You can fully control observability:
- `CLAUDE_CODE_ENABLE_TELEMETRY`
- `DISABLE_TELEMETRY`
- `DISABLE_ERROR_REPORTING`
- `CLAUDE_CODE_HIDE_ACCOUNT_INFO`
- `IS_DEMO=true`

This is rare for AI tooling — most are opaque.

## The big picture

Claude Code is **not**:
- A toy coding assistant
- A black-box agent
- A SaaS-only UI

It **is**:
- A programmable, auditable, policy-aware AI runtime

That’s why it:
- Supports Bedrock / Foundry / Vertex
- Separates tools from permissions
- Treats memory as config
- Exposes every lever via env vars

## One-sentence summary

> Claude proposes. Your configuration decides what’s allowed. Tools execute only inside that boundary.
