export interface RubricCriterion {
  id: string;
  description: string;
  weight: number;
}

export interface RubricScore {
  criterionId: string;
  score: number;
  maxScore: number;
}

export interface Rubric {
  criteria: RubricCriterion[];
  evaluate(input: unknown): RubricScore[];
}
