export interface CoalitionDispute {
  disputeId: string;
  decisionId: string;
  participatingNations: string[];
  positions: Array<{
    nation: string;
    stance: "ALLOW" | "DENY" | "ABSTAIN";
    legalRationale: string;
    treatyCitations: string[];
  }>;
  resolution: {
    mechanism: "CONSENSUS" | "MAJORITY_VOTE" | "WEIGHTED_VOTE" | "ARBITRATION";
    threshold: number;
    vetoNations: string[];
    timeoutMs: number;
    defaultAction: "ALLOW" | "DENY" | "ESCALATE";
  };
}

export const COALITION_DISPUTE_INVARIANTS = {
  id: "DISPUTE_RESOLUTION_FAIR",
  description: "Coalition disputes must have neutral arbitration",
  assert(dispute: CoalitionDispute) {
    const positionNations = dispute.positions.map((p) => p.nation);
    for (const nation of dispute.participatingNations) {
      if (!positionNations.includes(nation)) {
        return {
          ok: false,
          reason: `Nation ${nation} lacks representation in dispute`,
        };
      }
    }
    if (
      !dispute.resolution.timeoutMs ||
      dispute.resolution.timeoutMs > 604800000
    ) {
      // 7 days
      return {
        ok: false,
        reason: "Dispute resolution requires timeout ≤7 days",
      };
    }
    return { ok: true };
  },
};
