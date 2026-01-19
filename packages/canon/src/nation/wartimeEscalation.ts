export enum WartimeThreatLevel {
  DEFENSIVE = "DEFENSIVE",
  LIMITED_CONFLICT = "LIMITED_CONFLICT",
  TOTAL_WAR = "TOTAL_WAR",
}

export interface GraduatedWartimeConstraints {
  level: WartimeThreatLevel;
  allowedRelaxations: {
    DEFENSIVE: string[];
    LIMITED_CONFLICT: string[];
    TOTAL_WAR: string[];
  };
  mandatoryStrengthenings: {
    DEFENSIVE: string[];
    LIMITED_CONFLICT: string[];
    TOTAL_WAR: string[];
  };
  automaticDeescalation: {
    triggerConditions: string[];
    cooldownPeriodMs: number;
    requiresLegislativeVote: boolean;
  };
}

export const WARTIME_ESCALATION_INVARIANTS = {
  id: "GRADUATED_WARTIME_BOUNDS",
  description: "Wartime modes must be proportional and reversible",
  assert(constraints: GraduatedWartimeConstraints) {
    const neverRelaxable = [
      "CONSTITUTIONAL_OVERSIGHT",
      "TREATY_OBLIGATIONS",
      "WAR_CRIMES_PREVENTION",
      "AUDIT_IMMUTABILITY",
    ];
    const allRelaxations = [
      ...constraints.allowedRelaxations.DEFENSIVE,
      ...constraints.allowedRelaxations.LIMITED_CONFLICT,
      ...constraints.allowedRelaxations.TOTAL_WAR,
    ];
    for (const forbidden of neverRelaxable) {
      if (allRelaxations.includes(forbidden)) {
        return {
          ok: false,
          reason: `Cannot relax ${forbidden} even in wartime`,
        };
      }
    }
    if (constraints.automaticDeescalation.cooldownPeriodMs > 2592000000) {
      // 30 days
      return {
        ok: false,
        reason: "Wartime deescalation must occur within 30 days of trigger",
      };
    }
    return { ok: true };
  },
};
