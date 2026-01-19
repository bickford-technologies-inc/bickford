import { NationStateRubric, RubricEvaluation } from "@bickford/types";
import { scoreIntent } from "@bickford/canon/src/rubric/scoreIntent";
import { NATION_STATE_RUBRIC_INVARIANT } from "@bickford/canon/src/invariants/rubricInvariant";

export function enforceNationStateRubric(
  rubric: NationStateRubric,
  authorityId: string,
): RubricEvaluation {
  const evaluation = scoreIntent(rubric, authorityId);

  const result = NATION_STATE_RUBRIC_INVARIANT.assert(evaluation);
  if (!result.ok) {
    throw new Error(result.reason);
  }

  return evaluation;
}
