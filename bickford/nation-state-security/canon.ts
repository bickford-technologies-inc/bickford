export const BICKFORD_NATION_STATE_CANON = {
  identity: {
    name: "Bickford",
    classification: "Decision Continuity Infrastructure",
    position: "Below policy, above execution",
  },

  problem_statement: {
    failure_mode: "Decision decay under pressure",
    explicitly_not: [
      "intelligence collection",
      "sensor fusion",
      "actuation",
      "autonomous execution",
      "weapons control",
    ],
    empirical_examples: [
      "Afghanistan withdrawal coordination failure",
      "COVID inter-agency response fragmentation",
      "Cyber incident attribution latency",
      "Export control policy drift",
    ],
  },

  architectural_constraints: {
    non_lethality: {
      actuator_control: false,
      sensor_fusion: false,
      autonomous_authority: false,
      kinetic_execution: false,
      invariant: "Evaluation-only system",
    },

    sovereignty: {
      self_hosted: true,
      in_country_keys: true,
      no_external_authority: true,
      cryptographic_boundary: "Nation-controlled",
    },
  },

  procurement_alignment: {
    categories: [
      "Command & Control Infrastructure",
      "Decision Support Systems",
      "Compliance & Audit Infrastructure",
    ],
    explicitly_not: [
      "Autonomous weapons systems",
      "AI targeting systems",
      "Lethal decision-making platforms",
    ],
  },

  coalition_interoperability: {
    supported_blocks: ["NATO", "Five Eyes"],
    capabilities: [
      "Cross-border decision explanation",
      "Why-We-Denied artifacts",
      "Attribution preservation",
      "Audit-safe coalition exchange",
    ],
  },

  export_control: {
    enforcement: "Build-blocking invariants",
    regimes: ["ITAR", "EAR", "Allied-restricted"],
    guarantees: [
      "Non-allied export blocked",
      "License required for ITAR",
      "Human authority always required",
    ],
  },

  risk_closure: {
    weaponization_perception: "Architecturally impossible",
    sovereignty_violation: "Cryptographically prevented",
    regulatory_trigger: "Avoided by design",
  },

  conclusion: {
    suitability: "Nation-state security ready",
    value: [
      "Preserves decision legitimacy",
      "Enables allied coordination",
      "Enforces lawful continuity",
      "Provides audit-grade rationale",
    ],
  },
} as const;
