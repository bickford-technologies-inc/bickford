// Stub for canon/types
export type Canon = {
  allowedModels: string[];
  maxTokensPerRequest: number;
  constitutionalConstraints: {
    noHarmfulContent: boolean;
    noPersonalData: boolean;
  };
  requireAuditTrail: boolean;
};

export const DenialReasonCode = {
  CANON_VIOLATION: "CANON_VIOLATION",
  TOKEN_LIMIT: "TOKEN_LIMIT",
  MODEL_NOT_ALLOWED: "MODEL_NOT_ALLOWED",
  OTHER: "OTHER",
};
