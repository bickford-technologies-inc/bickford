/**
 * Minimal canonical Intent type for code-agent and application consumption.
 */
export type Intent = {
  id: string;
  phase: "requested" | "active" | "complete" | "failed";
  createdAt: string;
  description?: string;
  [key: string]: unknown;
};
