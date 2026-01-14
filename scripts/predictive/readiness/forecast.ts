export type DegradationModel = {
  assetId: string;
  component: string;
  horizonHours: number;
  pFailByHour: Array<{ hour: number; pFail: number }>;
  confidence: number;
  evidence: Array<{
    source: "SENSOR" | "HISTORICAL" | "ANALYTICS";
    ref: string;
  }>;
};
