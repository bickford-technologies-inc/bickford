import { NationStateRubric, RubricEvaluation } from "@bickford/types";
import { REQUIRED_NATION_STATE_RUBRIC } from "./nationStateRubric.js";

export function scoreIntent(
  rubric: NationStateRubric,
  evaluatedBy: string,
): RubricEvaluation {
  const totalScore = Object.values(rubric)
    .map(Number)
    .reduce((sum, v) => sum + v, 0);

  if (totalScore !== 10) {
    throw new Error(`Nation-state rubric violation: score=${totalScore}/10`);
  }

  // enforce no downgrade relative to canonical baseline
  for (const k of Object.keys(REQUIRED_NATION_STATE_RUBRIC) as Array<
    keyof NationStateRubric
  >) {
    if (rubric[k] < REQUIRED_NATION_STATE_RUBRIC[k]) {
      throw new Error(`Rubric downgrade forbidden on axis: ${String(k)}`);
    }
  }

  return {
    rubric,
    totalScore,
    evaluatedBy,
    ts: Date.now(),
  };
}
