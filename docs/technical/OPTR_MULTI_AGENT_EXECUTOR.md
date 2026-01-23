# OPTR Multi-Agent Executor (Codex · Claude · Copilot · Microsoft Copilot)

## Purpose
Define a canonical, auditable orchestration layer that runs OpenAI Codex, Anthropic Claude, GitHub Copilot (including Codespaces/coding-agent), and Microsoft Copilot (Stride) as parallel/serial OPTR executors. The orchestrator collects outputs, scores admissibility, selects the optimal path, and persists a cryptographic audit trail tied to GitHub history.

## Canonical Flow
1. **Intent intake**: Normalize intent + constraints into structured context.
2. **Parallel agent execution**: Run each agent with shared inputs.
3. **Output capture**: Persist every agent response to the workflow datalake.
4. **OPTR selection**: Score admissibility, expected TTV, and invariants.
5. **Ledger binding**: Record selection + all outputs in an append-only ledger and commit history.
6. **Execution**: Only the selected OPTR path is executable.

## Architecture Overview
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

## Data Layout (Datalake + Ledger)
```
/datalake/workflows/{workflow}/
  workflow-optr.yaml
  agent-outputs/
    codex.json
    claude.json
    copilot.json
    mscopilot.json
  optr-selection.json
/datalake/ledger.jsonl
```

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
  selectOptr: (results: AgentResult[], constraints: string[]) => AgentResult
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
    "agent-outputs"
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
    "optr-selection.json"
  );
  fs.writeFileSync(selectionPath, JSON.stringify(optimal, null, 2));

  return optimal;
}
```

## Execution Authority Notes
- **Admissibility**: An agent output is only executable if it satisfies all constraints and invariants.
- **Ledger binding**: Store all agent outputs and the selected OPTR result in the append-only ledger.
- **GitHub authority**: Commit hashes serve as the tamper-evident anchor for workflow outputs.

## Extension Points
- **Agent adapters**: Implement `runCodex`, `runClaude`, `runCopilot`, `runMsCopilot` using each provider’s API.
- **Scoring**: Plug in canonical OPTR scoring from `@bickford/core` and canon invariants.
- **Compliance**: Generate compliance artifacts as side effects of OPTR selection.
- **CI/CD**: Bind orchestrator outputs to GitHub Actions for automated enforcement and deployment.
