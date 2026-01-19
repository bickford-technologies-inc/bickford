export type SovereignMode = {
  jurisdiction: "US" | "EU" | "NATO";
  airGapped: boolean;
  regulatorKeyHash: string;
};

export function enableSovereign(m: SovereignMode) {
  return {
    ...m,
    enforcement: "HARD_CANON_ONLY",
    externalWrites: false,
    auditSurface: "READ_ONLY",
  };
}
