import { Intent } from "./types";

// Normalize any input into a canonical Intent object
export function normalizeIntent(
  input: Partial<Intent> & { goal: string }
): Intent {
  return {
    id: input.id || generateId(),
    goal: input.goal,
    constraints: input.constraints || [],
    canonRefs: input.canonRefs || [],
    urgency: input.urgency || "normal",
    evidence: input.evidence,
    source: input.source || "human",
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

function generateId(): string {
  return (
    "intent-" +
    Math.random().toString(36).slice(2, 10) +
    "-" +
    Date.now().toString(36)
  );
}
