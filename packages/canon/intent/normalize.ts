import { generateUIMessageId } from "../../../lib/ids";
import { Intent } from "./types";

// Normalize any input into a canonical Intent object
export function normalizeIntent(
  input: Partial<Intent> & { goal: string }
): Intent {
  return {
    // Note: id is for UI/runtime only, not for authority or audit linkage
    id: input.id || generateUIMessageId(),
    goal: input.goal,
    constraints: input.constraints || [],
    canonRefs: input.canonRefs || [],
    urgency: input.urgency || "normal",
    evidence: input.evidence,
    source: input.source || "human",
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

// Removed local generateId(). All ID generation is now in lib/ids and for UI/runtime only.
