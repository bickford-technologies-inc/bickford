export type SovereignState = {
  stateId: string;
  jurisdiction: string;
  constitutionVersion: string;
  currency: "USD" | "EUR" | "TTV";
  nonInterference: true;
};

export function declareState(s: SovereignState) {
  if (!s.nonInterference) {
    throw new Error("NON_INTERFERENCE_REQUIRED");
  }
  return { declared: true, state: s };
}
