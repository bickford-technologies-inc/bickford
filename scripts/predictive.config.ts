// Predictive Maintenance System Config

export const FAILURE_POLICY = {
  allowed: ["lint", "format"],
  denied: ["runtime-at-build", "missing-artifact"],
  escalateAfter: 1,
};

export const SERVICE_CONTEXT = {
  branch: "ARMY", // ARMY | NAVY | USMC | DAF | SPACE_FORCE
  domain: "GROUND", // GROUND | AVIATION | SHIP | SPACE | MUNITIONS
  authorityLevel: "UNIT", // UNIT | DEPOT | OEM
};

export const AUTHORITY_CONTEXT = {
  authority: "UNIT",
  supportedAuthorities: ["OPERATOR"],
  escalationPath: ["INTERMEDIATE", "DEPOT"],
};
