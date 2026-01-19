import { Intent } from "@bickford/types";
import { scoreIntent, RUBRIC_INVARIANT } from "@bickford/canon";

export function enforceRubric(intent: Intent) {
  const score = scoreIntent(intent);

  const result = RUBRIC_INVARIANT.assert({
    intent,
    score,
  });

  if (!result.ok) {
    throw new Error(result.reason);
  }

  return score;
}
