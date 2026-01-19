export type MonitorabilitySurface =
  | "INPUT_ONLY"
  | "INPUT_OUTPUT"
  | "STRUCTURED_REASONING"
  | "FULL_TRACE";

export type DecisionImpact = "LOW" | "MEDIUM" | "HIGH";

export interface MonitorabilityAssessment {
  decisionId: string;
  surface: MonitorabilitySurface;
  truePositiveRate: number;
  trueNegativeRate: number;
  gMeanSquared: number;
  inferenceBudgetMs: number;
  monitorModel: string;
  timestamp: number;
  model?: string;
  toolsUsed?: string[];
  conversationTurns?: number;
}

export interface MonitorabilityInvariantInput {
  assessment: MonitorabilityAssessment;
  impact: DecisionImpact;
}

export interface MonitorabilityThreshold {
  impact: DecisionImpact;
  minimumGMean: number;
  allowedSurfaces: MonitorabilitySurface[];
}
