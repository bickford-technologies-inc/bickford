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
