export type AutomationConfidence = {
  planId: string;
  confidence: number;
  drivers: {
    dataCompleteness: number;
    precedentStrength: number;
    modelAgreement: number;
    policyClarity: number;
  };
};
