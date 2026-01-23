import type { NationStateRubric, RubricEvaluation } from "@bickford/types";
import { scoreIntent } from "@bickford/canon/rubric/scoreIntent";
import { RUBRIC_INVARIANT } from "@bickford/canon/invariants/rubricInvariant";

export function enforceRubric(
  rubric: NationStateRubric,
  evaluatedBy: string,
): RubricEvaluation {
  const evaluation = scoreIntent(rubric, evaluatedBy);

  const result = RUBRIC_INVARIANT.assert(evaluation);

  if (!result.ok) {
    throw new Error(result.reason);
  }

  return evaluation;
}
