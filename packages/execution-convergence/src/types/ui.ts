/**
 * UI types for execution convergence.
 * 
 * Defines UI-related types for convergence visualization and interaction.
 */

export type UIState = "loading" | "ready" | "error";

export interface UIContext {
  state: UIState;
  message?: string;
}
