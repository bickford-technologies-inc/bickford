export const MAINTENANCE_INVARIANTS = {
  TRACEABILITY: {
    rule: "All maintenance actions must be traceable to an approved policy or technical source",
    enforce: "no_orphan_actions",
  },
  CONFIG_CONTROL: {
    rule: "Configuration changes require authoritative source and versioning",
    enforce: "immutable_config_history",
  },
  CONDITION_BASED: {
    rule: "Condition-based data must not be overridden by manual state without record",
    enforce: "sensor_vs_manual_conflict_guard",
  },
  AUTHORITY_BOUNDARY: {
    rule: "Maintenance authority must align with organizational role",
    enforce: "role_based_execution",
  },
};
