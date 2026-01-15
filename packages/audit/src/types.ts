export interface DecisionRecord {
  id: string;
  timestamp: string;
  actor: {
    subjectId: string;
    tenantId: string;
    role: string;
  };
  action: string;
  intent: string;
  inputs: Record<string, unknown>;
  constraints: string[];
  outcome: "ALLOW" | "DENY";
  effects: string[];
  artifacts: string[];
  rollback?: {
    restoresArtifactId?: string;
    restoresDecisionId?: string;
    restoresSchemaVersion?: string;
  };
  hash: string;
}
