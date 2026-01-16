/**
 * Agent types for execution convergence.
 * 
 * Defines agent roles, capabilities, and coordination primitives.
 */

export type AgentRole = "executor" | "validator" | "reconciler";

export interface Agent {
  id: string;
  role: AgentRole;
  capabilities: string[];
}
