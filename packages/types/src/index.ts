// Shared type definitions for Bickford ledger system
// TIMESTAMP: 2026-01-12T18:44:00Z
// Explicit types for all Prisma models and pg queries

export type Intent = {
  action: string;
  origin?: string;
  context?: Record<string, any>;
  timestamp?: string;
};

export type Decision = {
  id: string;
  intent: string;
  timestamp: string;
  denied?: boolean;
  outcome?: string;
  reason?: string;
};

export type LedgerEntry = {
  id: string;
  intent: Intent;
  decision: Decision;
  hash: string;
  createdAt: string;
  tenantId?: string;
};

// Explicit LedgerRow type for direct pg queries
export interface LedgerRow {
  id: string;
  intent: Intent;
  decision: Decision;
  hash: string;
  createdAt: Date;
  tenantId: string | null;
}

export type AgentId = string;

export interface AgentContext {
  agentId: AgentId;
  ttvBaseline: number; // current expected TTV
  environment: "local" | "ci" | "prod";
}

export interface InterferenceResult {
  allowed: boolean;
  reason?: string;
  violatedAgent?: AgentId;
  deltaTTV?: number;
  rationale: string;
}

// Build/Deploy tracking types
export interface BuildEventRow {
  id: string;
  commitSha: string;
  branch: string;
  status: "success" | "failure" | "in_progress";
  startedAt: Date;
  completedAt: Date | null;
  ledgerHash: string | null;
  artifacts: Record<string, any> | null;
}

export interface DeployEventRow {
  id: string;
  buildId: string | null;
  environment: "staging" | "production";
  commitSha: string;
  deployedAt: Date;
  ledgerHash: string;
  status: "success" | "failure" | "rolled_back";
}

export interface SchemaVersionRow {
  id: string;
  schemaHash: string;
  previousHash: string | null;
  appliedAt: Date;
  migrationName: string | null;
  ledgerHash: string;
}

export interface MigrationScoreRow {
  id: string;
  migrationName: string;
  riskScore: number;
  isRegressive: boolean;
  impactAnalysis: Record<string, any>;
  approvalStatus: "pending" | "approved" | "denied";
  scoredAt: Date;
}

export interface AgentStateRow {
  agentId: string;
  ttvBaseline: number;
  updatedAt: Date;
}

// Database configuration types
export interface DbConfig {
  url: string;
  readReplicaUrl?: string;
  ssl?: boolean;
  connectionString?: string;
  // Read-replica configuration
  readReplica?: {
    enabled: boolean;
    connectionString: string;
  };
  // Per-tenant isolation
  tenantIsolation?: {
    enabled: boolean;
    tenantId?: string;
  };
}

export * from "./optr";
export * from "./canon";

export type DeniedDecisionPayload = {
  denied: true;
  ts: string;
  actionId: string;
  tenantId: string;
  reasonCodes: string[];
  message: string;
};
export {};
