export type LossEvent = {
  assetId: string;
  lossType: "CATASTROPHIC" | "PARTIAL" | "DEGRADED";
  recoverable: boolean;
  estimatedRegenTimeDays: number;
};
