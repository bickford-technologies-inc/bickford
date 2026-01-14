export type PolicyImpact = {
  affectedPolicy: string;
  severity: "CRITICAL" | "MAJOR" | "MINOR";
  auditRisk: boolean;
};
