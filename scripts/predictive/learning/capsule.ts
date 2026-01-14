export type PatternCapsule = {
  capsuleId: string;
  timestamp: string;
  signature: {
    errorClass?: string;
    failureModeCode?: string;
    phase: string;
    stackRoot?: string;
    component?: string;
  };
  fixOrGuard: {
    type: "GUARD" | "POLICY" | "ORDERING" | "AUTOFIX";
    ref: string;
  };
  effectiveness: { preventedCount: number; falsePositiveRate: number };
  provenance: {
    programHash: string;
    authority: string;
    classification: "UNCLASS" | "CUI" | "SECRET";
  };
};
