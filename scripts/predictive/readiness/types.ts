export type ReadinessMetric =
  | "FMC" // Fully Mission Capable
  | "PMC" // Partially Mission Capable
  | "NMC" // Not Mission Capable
  | "NMC_S" // Supply
  | "NMC_M" // Maintenance
  | "NMC_B"; // Both;

export type ReadinessState = {
  assetId: string;
  metric: ReadinessMetric;
  effectiveAt: string; // ISO
  drivers: Array<{ code: string; severity: number }>;
};
