export enum TreatyFramework {
  NATO_ARTICLE_5 = "NATO_ARTICLE_5",
  FIVE_EYES_UKUSA = "FIVE_EYES_UKUSA",
  UN_CHARTER = "UN_CHARTER",
  GENEVA_CONVENTIONS = "GENEVA_CONVENTIONS",
  CHEMICAL_WEAPONS_CONVENTION = "CHEMICAL_WEAPONS_CONVENTION",
}

export interface TreatyComplianceCheck {
  treatyId: string;
  framework: TreatyFramework;
  decisionId: string;
  complianceStatus: "COMPLIANT" | "VIOLATION" | "REQUIRES_REVIEW";
  relevantArticles: string[];
  legalAnalysis: string;
  humanReviewRequired: boolean;
}

export interface AutomatedTreatyEnforcement {
  treatyRules: {
    framework: TreatyFramework;
    computationalRules: string[]; // Machine-readable treaty constraints
    automaticBlocking: boolean;
  }[];
  preExecutionValidation: {
    checkAllRelevantTreaties: true;
    blockOnAmbiguity: boolean;
    requireHumanReviewThreshold: "LOW" | "MEDIUM" | "HIGH";
  };
}

export const TREATY_COMPLIANCE_INVARIANTS = {
  id: "TREATY_OBLIGATIONS_ENFORCED",
  description: "International treaty obligations must be preserved",
  assert(check: TreatyComplianceCheck) {
    if (check.complianceStatus === "VIOLATION") {
      return {
        ok: false,
        reason: `Treaty violation: ${check.framework} - ${check.relevantArticles.join(", ")}`,
      };
    }
    if (
      check.complianceStatus === "REQUIRES_REVIEW" &&
      !check.humanReviewRequired
    ) {
      return {
        ok: false,
        reason: "Ambiguous treaty compliance requires mandatory human review",
      };
    }
    return { ok: true };
  },
};
