/**
 * Execution Convergence
 *
 * Bickford Chat execution primitive implementation base.
 * Downstream features and behaviors will be filled in iteratively.
 */

// Types
export type { Agent, AgentRole } from "./types/agents.js";
export type { Artifact, ArtifactType } from "./types/artifacts.js";
export type { ConvergenceResult, ConvergenceState } from "./types/convergence.js";
export type { UIContext, UIState } from "./types/ui.js";

// Core functions
export { converge } from "./core/converge.js";
export { reconcile } from "./core/reconcile.js";
export { validate } from "./core/validate.js";
export { lock, unlock } from "./core/lock.js";
