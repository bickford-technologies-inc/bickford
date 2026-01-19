export type RubricScore = 0 | 1;

export type NationStateRubric = {
  decisionContinuity: RubricScore;
  nonWeaponization: RubricScore;
  sovereignControl: RubricScore;
  exportControlCompliance: RubricScore;
  humanAuthority: RubricScore;
  auditability: RubricScore;
  crisisModeSafety: RubricScore;
  coalitionInteroperability: RubricScore;
  transparencySafety: RubricScore;
  formalVerifiability: RubricScore;
};

export type RubricEvaluation = {
  rubric: NationStateRubric;
  totalScore: number; // must be 10
  evaluatedBy: string; // system or human authority id
  ts: number;
};
