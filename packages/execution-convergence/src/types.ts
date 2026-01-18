export type AgentRole =
  | "EXECUTION_AUTHORITY"
  | "CONSTRAINT_AUDITOR"
  | "MECHANICAL_EXECUTOR";

export type ConvergenceMode = "EXPLORATION" | "EXECUTION";

export interface AgentDescriptor {
  id: string;
  role: AgentRole;
  provider: string;
  model?: string;
}

export interface Constraint {
  id: string;
  description: string;
  severity: "HARD" | "SOFT";
}

export interface AgentOutput {
  agentId: string;
  content: unknown;
  executableHints?: unknown;
  constraints?: Constraint[];
}

export interface ConvergenceInput {
  mode: ConvergenceMode;
  agents: AgentDescriptor[];
  outputs: AgentOutput[];
  metadata: {
    timestamp: string;
    initiatedBy: "human" | "system";
    incidentId?: string;
  };
}

export interface ExecutableStep {
  id: string;
  action: string;
  parameters?: Record<string, unknown>;
}

export interface RefusalReason {
  code: string;
  message: string;
}

export interface LockedArtifact {
  hash: string;
  authorityAgentId: string;
  executablePlan: ExecutableStep[];
  provenance: {
    sourceAgents: string[];
    convergedAt: string;
    enforcedConstraints: string[];
  };
}

export type ConvergenceResult = {
  /** true if convergence succeeded */
  converged: boolean;

  /** optional diagnostic payload */
  reason?: string;

  /** optional score / metadata */
  score?: number;

  /** optional execution trace */
  trace?: unknown;
};
