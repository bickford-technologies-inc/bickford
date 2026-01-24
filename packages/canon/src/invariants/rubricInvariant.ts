import { RubricEvaluation } from "@bickford/types";

export const NATION_STATE_RUBRIC_INVARIANT = {
  id: "NATION_STATE_RUBRIC_ENFORCED",
  description:
    "Every intent must satisfy the 10/10 nation-state security rubric",
  assert(evaluation: RubricEvaluation) {
    if (evaluation.totalScore !== 10) {
      return {
        ok: false,
        reason: `Rubric score ${evaluation.totalScore}/10 is invalid`,
      };
    }

    return { ok: true };
  },
};

export const RUBRIC_INVARIANT = NATION_STATE_RUBRIC_INVARIANT;
