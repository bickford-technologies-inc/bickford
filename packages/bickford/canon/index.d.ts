export const CANON: {
  allowedModels: string[];
  maxTokensPerRequest: number;
  constitutionalConstraints: {
    noHarmfulContent: boolean;
    noPersonalData: boolean;
  };
  requireAuditTrail: boolean;
};
export default CANON;
