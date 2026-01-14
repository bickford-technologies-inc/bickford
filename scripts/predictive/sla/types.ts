export type ReadinessSLA = {
  fleet: string;
  metric: "FMC_RATE";
  target: number;
  windowDays: number;
  breachPenalty: "ESCALATION" | "REPLAN" | "REPORT";
};
