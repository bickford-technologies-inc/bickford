export interface DecisionTrace {
  hash: string;
  intent: string;
  admissible: boolean;
  policiesEvaluated: string[];
  violations?: string[];
  proposedActions: string[];
  createdAt: string;
}
