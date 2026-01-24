# OPTR Multi-Agent Executor (Codex · Claude · Copilot · Microsoft Copilot)

## Executive Summary

**OPTR = Operator** — canonical orchestration layer for parallel multi-agent execution with a cryptographic audit trail. The OPTR executor runs multiple AI agents in parallel, scores admissibility and TTV, selects the optimal path (π*), and persists every output for compliance and governance.

```text
Intent → [Codex | Claude | Copilot | MS Copilot] → Score → Select π* → Ledger → Execute
```

**Key features**
- ✅ Parallel execution of 4 AI agents
- ✅ Admissibility scoring (constraints + invariants + TTV)
- ✅ OPTR selection (π*) based on canonical scoring
- ✅ Cryptographic ledger binding (SHA-256 hash chain)
- ✅ GitHub commit authority (tamper-evident)
- ✅ Datalake structure (all outputs preserved)

## Quick Start (5 Minutes)

### 1) Install the OPTR package

```bash
# Navigate to repo
cd /workspaces/bickford

# Create OPTR package structure
mkdir -p packages/optr/{src,cli,executors,compliance}

# Copy implementations
cp optr-executor.ts packages/optr/src/executor.ts
cp optr-cli-execute.js packages/optr/cli/execute.js
cp optr-workflow.yml .github/workflows/optr.yml

# Install dependencies
cd packages/optr
pnpm add openai @anthropic-ai/sdk @octokit/rest
pnpm add -D @types/node typescript

# Build
pnpm tsc
```

### 2) Configure environment

```bash
# Add secrets to GitHub
gh secret set OPENAI_API_KEY
gh secret set ANTHROPIC_API_KEY
# (GITHUB_TOKEN is automatic)

# Set local environment (for CLI)
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
export GITHUB_TOKEN="ghp_..."
export GITHUB_REPOSITORY="bickford-technologies-inc/bickford"
```

### 3) Run your first OPTR workflow

```bash
# Option A: Via CLI
node packages/optr/cli/execute.js \
  --workflow "test-auth" \
  --intent "Implement user authentication with JWT" \
  --constraints "security,audit,rate-limiting"

# Option B: Via GitHub Actions
gh workflow run optr.yml \
  -f workflow_name="test-auth" \
  -f intent="Implement user authentication with JWT" \
  -f constraints="security,audit,rate-limiting"

# Option C: Via GitHub Issue
# 1. Create issue: "Implement user authentication with JWT"
# 2. Add label: "optr-workflow"
# 3. OPTR workflow auto-triggers
```

## Canonical Architecture

```text
Intent → Orchestrator → [Codex | Claude | Copilot | MS Copilot]
              ↓               ↓           ↓             ↓
        Capture Outputs ────────────────────────────────┘
              ↓
        OPTR Selection (admissibility + TTV + invariants)
              ↓
        Ledger + GitHub Commit Binding
              ↓
          Executable Result (π*)
```

### Canonical Flow

1. **Intent intake**: Normalize intent + constraints into structured context.
2. **Parallel agent execution**: Run each agent with shared inputs.
3. **Output capture**: Persist every agent response to the workflow datalake.
4. **OPTR selection**: Score admissibility, expected TTV, and invariants.
5. **Ledger binding**: Record selection + all outputs in an append-only ledger and commit history.
6. **Execution**: Only the selected OPTR path is executable.

## Datalake Structure

```
/datalake/
  ├── workflows/
  │   └── {workflow-name}/
  │       ├── workflow-optr.yaml
  │       ├── agent-outputs/
  │       │   ├── codex.json
  │       │   ├── claude.json
  │       │   ├── copilot.json
  │       │   └── mscopilot.json
  │       ├── optr-selection.json
  │       └── execution-complete.json
  └── ledger.jsonl
```

### Ledger Format (JSONL)

```jsonl
{"id":"ledger-1706033400000","timestamp":1706033400000,"workflow":"test-auth","intent":"Implement JWT auth","agentResults":[...],"selectedOptr":{"agent":"claude","admissible":true,...},"previousHash":"0","hash":"abc123..."}
{"id":"ledger-1706033500000","timestamp":1706033500000,"workflow":"test-auth-v2","intent":"Add refresh tokens","agentResults":[...],"selectedOptr":{"agent":"codex","admissible":true,...},"previousHash":"abc123...","hash":"def456..."}
```

## Agent Responsibilities

### 1) OpenAI Codex — Code Generation Authority

**Role:** Generate production-ready TypeScript code

**Input:**
```json
{
  "workflow": "implement-auth",
  "intent": "Implement user authentication with JWT",
  "constraints": ["security", "audit", "rate-limiting"]
}
```

**Output:**
```json
{
  "agent": "codex",
  "output": {
    "code": "export function generateJWT(payload: UserPayload): string {...}",
    "tests": "describe('generateJWT', () => {...})",
    "documentation": "# JWT Authentication\n\n...",
    "admissible": true,
    "invariants": ["type_safe", "tested", "documented", "secure"]
  },
  "admissible": true,
  "ttvEstimate": 2000,
  "invariants": ["type_safe", "tested", "documented", "secure"],
  "executionTime": 1853,
  "hash": "abc123...",
  "timestamp": 1706033400000
}
```

**Scoring factors**
- ✅ Generates complete, working code
- ✅ Includes tests and documentation
- ✅ Fast execution (low TTV)
- ⚠️ May not validate Constitutional AI principles

### 2) Anthropic Claude — Constitutional Validation Authority

**Role:** Validate against Constitutional AI principles

**Input:** Same as Codex

**Output:**
```json
{
  "agent": "claude",
  "output": {
    "approved": true,
    "violations": [],
    "requirements": [
      "Audit logging for all auth events",
      "Rate limiting on login attempts",
      "Secure token storage"
    ],
    "invariants": ["constitutional_ai", "security_first", "audit_mandatory"],
    "rationale": "Authentication implementation satisfies all Constitutional AI principles...",
    "admissible": true,
    "estimatedComplexity": "medium"
  },
  "admissible": true,
  "ttvEstimate": 5000,
  "invariants": ["constitutional_ai", "security_first", "audit_mandatory"],
  "executionTime": 2134,
  "hash": "def456...",
  "timestamp": 1706033402000
}
```

**Scoring factors**
- ✅ Highest agent preference (Constitutional AI is primary)
- ✅ Validates security and compliance
- ✅ Provides actionable requirements
- ⚠️ Doesn't generate executable code

### 3) GitHub Copilot — Execution Authority

**Role:** Execute code changes in GitHub/Codespaces

**Input:** Same as Codex

**Output:**
```json
{
  "agent": "copilot",
  "output": {
    "type": "github_copilot_execution",
    "recentCommits": 10,
    "latestCommit": "abc123...",
    "admissible": true,
    "invariants": ["github_api_access", "commit_history_verified"]
  },
  "admissible": true,
  "ttvEstimate": 2000,
  "invariants": ["github_api_access", "commit_history_verified"],
  "executionTime": 845,
  "hash": "ghi789...",
  "timestamp": 1706033403000
}
```

**Scoring factors**
- ✅ Fastest execution
- ✅ Direct GitHub integration
- ⚠️ Limited to GitHub operations

### 4) Microsoft Copilot (Stride) — Business Workflow Authority

**Role:** Orchestrate cross-platform business processes

**Input:** Same as Codex

**Output:**
```json
{
  "agent": "mscopilot",
  "output": {
    "type": "microsoft_copilot_workflow",
    "status": "completed",
    "workflowSteps": [
      {"step": 1, "action": "analyze_intent", "status": "completed"},
      {"step": 2, "action": "plan_execution", "status": "completed"},
      {"step": 3, "action": "coordinate_agents", "status": "completed"}
    ],
    "admissible": true,
    "invariants": ["workflow_orchestration", "cross_platform_coordination"]
  },
  "admissible": true,
  "ttvEstimate": 3000,
  "invariants": ["workflow_orchestration", "cross_platform_coordination"],
  "executionTime": 1234,
  "hash": "jkl012...",
  "timestamp": 1706033404000
}
```

**Scoring factors**
- ✅ Cross-platform orchestration
- ✅ Business process automation
- ⚠️ Slower than other agents

## OPTR Selection Example

Given four agent results, canonical scoring:

```
Agent Results:
1. Codex:     admissible=true, inv=4, ttv=2000ms, exec=1853ms → Score: 160 + 24 + 16.3 + 7  = 207.3
2. Claude:    admissible=true, inv=3, ttv=5000ms, exec=2134ms → Score: 120 + 15 + 15.7 + 10 = 160.7
3. Copilot:   admissible=true, inv=2, ttv=2000ms, exec=845ms  → Score: 80  + 24 + 18.3 + 5  = 127.3
4. MSCopilot: admissible=true, inv=2, ttv=3000ms, exec=1234ms → Score: 80  + 21 + 17.5 + 3  = 121.5

Selected: Codex (highest score: 207.3)
```

**Scoring breakdown**
- Invariants (40%): `count * 40`
- TTV (30%): `30 - (ttv / 1000) * 3`
- Execution (20%): `20 - (exec / 100) * 2`
- Preference (10%): `{claude: 10, codex: 7, copilot: 5, mscopilot: 3}`

## YAML Workflow Template

```yaml
agents:
  - name: codex
    type: openai-codex
  - name: claude
    type: anthropic-claude
  - name: copilot
    type: github-copilot
  - name: mscopilot
    type: ms-copilot-stride
optr: select_optr
ledger: enabled
auditable: true
```

## TypeScript Orchestrator Scaffold

```typescript
import fs from "node:fs";
import path from "node:path";

export type AgentResult = {
  agent: "codex" | "claude" | "copilot" | "mscopilot";
  output: unknown;
  admissible: boolean;
  ttvEstimate: number;
  invariants: string[];
};

export type IntentContext = {
  workflow: string;
  intent: unknown;
  constraints: string[];
};

export async function optrExecutor(
  context: IntentContext,
  runners: {
    runCodex: (ctx: IntentContext) => Promise<AgentResult>;
    runClaude: (ctx: IntentContext) => Promise<AgentResult>;
    runCopilot: (ctx: IntentContext) => Promise<AgentResult>;
    runMsCopilot: (ctx: IntentContext) => Promise<AgentResult>;
  },
  selectOptr: (results: AgentResult[], constraints: string[]) => AgentResult,
): Promise<AgentResult> {
  const results = await Promise.all([
    runners.runCodex(context),
    runners.runClaude(context),
    runners.runCopilot(context),
    runners.runMsCopilot(context),
  ]);

  const workflowRoot = path.join(
    "/datalake/workflows",
    context.workflow,
    "agent-outputs",
  );

  fs.mkdirSync(workflowRoot, { recursive: true });
  for (const result of results) {
    const outputPath = path.join(workflowRoot, `${result.agent}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  }

  const optimal = selectOptr(results, context.constraints);
  const selectionPath = path.join(
    "/datalake/workflows",
    context.workflow,
    "optr-selection.json",
  );
  fs.writeFileSync(selectionPath, JSON.stringify(optimal, null, 2));

  return optimal;
}
```

## Example Workflows

### Example 1: Code Generation

```bash
# CLI execution
node packages/optr/cli/execute.js \
  --workflow "add-rate-limiting" \
  --intent "Add rate limiting to API endpoints using Redis" \
  --constraints "security,performance,redis"

# Expected selection: Codex (code generation task)
# Output: Production-ready rate limiting code
```

### Example 2: Constitutional Validation

```bash
# CLI execution
node packages/optr/cli/execute.js \
  --workflow "validate-auth" \
  --intent "Review authentication system for Constitutional AI compliance" \
  --constraints "constitutional_ai,security,audit"

# Expected selection: Claude (validation task)
# Output: Compliance report with requirements
```

### Example 3: GitHub Operations

```bash
# CLI execution
node packages/optr/cli/execute.js \
  --workflow "merge-prs" \
  --intent "Merge all approved PRs for release" \
  --constraints "ci_passed,approved,release"

# Expected selection: Copilot (GitHub task)
# Output: PRs merged, release created
```

### Example 4: Business Workflow

```bash
# CLI execution
node packages/optr/cli/execute.js \
  --workflow "q4-compliance" \
  --intent "Generate Q4 2025 compliance report across SOC-2, ISO-27001, NIST-800-53" \
  --constraints "compliance,audit,multi_framework"

# Expected selection: MS Copilot (cross-platform orchestration)
# Output: Complete compliance report
```

## Deployment

### Install to existing repo

```bash
# 1. Copy files to repo
mkdir -p packages/optr/{src,cli,executors,compliance}
cp optr-executor.ts packages/optr/src/executor.ts
cp optr-cli-execute.js packages/optr/cli/execute.js

# 2. Install dependencies
cd packages/optr
cat > package.json << 'EOF'
{
  "name": "@bickford/optr",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/executor.js",
  "scripts": {
    "build": "tsc",
    "execute": "node cli/execute.js"
  },
  "dependencies": {
    "openai": "^4.0.0",
    "@anthropic-ai/sdk": "^0.9.0",
    "@octokit/rest": "^20.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
EOF

pnpm install
pnpm build

# 3. Install GitHub workflow
cp optr-workflow.yml .github/workflows/optr.yml

# 4. Commit
git add packages/optr .github/workflows/optr.yml
git commit -m "feat(optr): add multi-agent executor orchestration"
git push origin main
```

### Configure secrets

```bash
# GitHub secrets
gh secret set OPENAI_API_KEY --body "sk-..."
gh secret set ANTHROPIC_API_KEY --body "sk-ant-..."
gh secret set MICROSOFT_GRAPH_TOKEN --body "..." # Optional

# Verify
gh secret list
```

### Test deployment

```bash
# Test via workflow dispatch
gh workflow run optr.yml \
  -f workflow_name="deployment-test" \
  -f intent="Test OPTR multi-agent execution" \
  -f constraints="test,deployment"

# Monitor
gh run watch

# Check datalake
ls -R datalake/workflows/deployment-test/
cat datalake/ledger.jsonl | tail -1 | jq
```

## Ledger Verification

```bash
# Verify ledger integrity
node packages/optr/cli/verify-ledger.js --ledger datalake/ledger.jsonl

# Expected output:
# [OPTR] Verifying ledger: datalake/ledger.jsonl
# [OPTR] Entries: 42
# [OPTR] ✓ All hashes valid
# [OPTR] ✓ Chain linkage intact
# [OPTR] ✓ Ledger verified
```

## Compliance Integration

### Automatic compliance artifacts

Every OPTR execution generates:

1. **Ledger Entry** — Cryptographic proof of execution
2. **Datalake Outputs** — All agent outputs preserved
3. **GitHub Commit** — Tamper-evident anchor
4. **Compliance Report** — SOC-2/ISO/NIST mappings

### SOC-2 mapping

- **CC6.1** (Logical Access): All executions authenticated via GitHub
- **CC7.2** (System Monitoring): Ledger provides complete audit trail
- **CC8.1** (Change Management): Git commits record all changes

### ISO 27001 mapping

- **A.9.4** (System Access): OPTR enforces execution authority
- **A.12.4** (Logging): Ledger records all decisions
- **A.14.2** (Secure Development): Constitutional AI validation

### NIST 800-53 mapping

- **AC-3** (Access Enforcement): OPTR selection enforces constraints
- **AU-2** (Audit Events): All executions logged in ledger
- **SA-11** (Developer Security Testing): Multi-agent validation

## Troubleshooting

### No admissible results

```
Error: No admissible results from any agent
```

**Solution:** Relax constraints or check agent configurations

```bash
# Check which agents failed
cat datalake/workflows/{workflow}/agent-outputs/*.json | jq '.admissible'

# Check error messages
cat datalake/workflows/{workflow}/agent-outputs/*.json | jq '.output.error'
```

### Ledger verification failed

```
Error: Ledger verification failed at entry 42: hash mismatch
```

**Solution:** Ledger may be corrupted

```bash
# Backup corrupted ledger
cp datalake/ledger.jsonl datalake/ledger.jsonl.corrupted

# Rebuild from git history
node packages/optr/cli/rebuild-ledger.js
```

### Agent timeout

```
Error: Agent 'codex' timed out after 30000ms
```

**Solution:** Increase timeout or simplify intent

```bash
# Increase timeout (env var)
export OPTR_TIMEOUT=60000  # 60 seconds

# Or simplify intent
--intent "Add basic rate limiting" # Instead of complex implementation
```

## Next Steps

1. ✅ Install OPTR package
2. ✅ Configure environment and secrets
3. ✅ Run first test workflow
4. ✅ Verify ledger integrity
5. ✅ Integrate into existing CI/CD
6. ✅ Generate compliance reports
7. ✅ Prepare acquisition materials

## Execution Authority Notes

- **Admissibility**: An agent output is only executable if it satisfies all constraints and invariants.
- **Ledger binding**: Store all agent outputs and the selected OPTR result in the append-only ledger.
- **GitHub authority**: Commit hashes serve as the tamper-evident anchor for workflow outputs.

## Extension Points

- **Agent adapters**: Implement `runCodex`, `runClaude`, `runCopilot`, `runMsCopilot` using each provider’s API.
- **Scoring**: Plug in canonical OPTR scoring from `@bickford/core` and canon invariants.
- **Compliance**: Generate compliance artifacts as side effects of OPTR selection.
- **CI/CD**: Bind orchestrator outputs to GitHub Actions for automated enforcement and deployment.
