/**
 * Convergence types for execution convergence.
 * 
 * Defines convergence states, criteria, and resolution primitives.
 */

export type ConvergenceState = "pending" | "converged" | "diverged";

export interface ConvergenceResult {
  state: ConvergenceState;
  timestamp: string;
  details?: string;
}
