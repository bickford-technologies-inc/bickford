export interface AdversarialIndicators {
  decisionId: string;
  detectedAtTs: number;
  indicators: {
    unusualAccessPattern: {
      detected: boolean;
      frequencyMultiple: number;
      sourceJurisdictions: string[];
    };
    coordinatedProbing: {
      detected: boolean;
      probingAttempts: number;
      timeWindowMs: number;
      likelyCoordinated: boolean;
    };
    exportControlCircumvention: {
      detected: boolean;
      attemptedDestination: string;
      spoofedOrigin: boolean;
    };
  };
  response: {
    automaticLockdown: boolean;
    sovereignAuthoritiesNotified: string[];
    forensicSnapshot: {
      captured: true;
      preservedUntilMs: number;
    };
    internationalIncidentReport: boolean;
  };
}

export const ADVERSARIAL_DETECTION_INVARIANTS = {
  id: "ADVERSARIAL_RESPONSE_MANDATORY",
  description: "Detected adversarial actions must trigger automated response",
  assert(indicators: AdversarialIndicators) {
    const highSeverity =
      indicators.indicators.coordinatedProbing.detected ||
      indicators.indicators.exportControlCircumvention.detected;
    if (highSeverity && !indicators.response.automaticLockdown) {
      return {
        ok: false,
        reason: "High-severity adversarial action requires automatic lockdown",
      };
    }
    if (highSeverity && !indicators.response.forensicSnapshot.captured) {
      return {
        ok: false,
        reason: "High-severity adversarial action requires forensic capture",
      };
    }
    return { ok: true };
  },
};
