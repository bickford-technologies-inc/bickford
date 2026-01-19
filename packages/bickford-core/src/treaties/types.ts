export type TreatyParty = {
  agentId: string;
  jurisdiction: "US" | "EU" | "NATO" | "GLOBAL";
};

export type TreatyInvariant = {
  id: string;
  nonInterference: true;
  maxRisk: number;
};

export type Treaty = {
  treatyId: string;
  parties: TreatyParty[];
  invariants: TreatyInvariant[];
  signedAt: string;
};
