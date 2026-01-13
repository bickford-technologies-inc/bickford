// Canonical Intent type for Bickford Autonomous Software Factory
export interface Intent {
  id: string;
  goal: string;
  constraints: string[];
  canonRefs: string[];
  urgency: "low" | "normal" | "high" | "critical";
  evidence?: Record<string, unknown>;
  source: "human" | "ci" | "runtime" | "github";
  createdAt: string;
}
