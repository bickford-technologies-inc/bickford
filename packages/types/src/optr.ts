/**
 * OPTR shared types
 * Authority: @bickford/types
 */

export interface AgentContext {
  agentId: string;
  tenantId: string;
  intentId: string;
  capabilities?: string[];
}

export interface InterferenceResult {
  allowed: boolean;
  reason?: string;
  displacedAgents?: string[];
}

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

// Force TypeScript emit for this module
export const __forceEmitOptr = true;

export type OptrResult = {
  ok: boolean;
  value?: unknown;
  error?: {
    code: string;
    message: string;
  };
  ts: number;
};
