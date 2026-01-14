export type MaintenanceAuthority =
  | "OPERATOR" // Crew / Soldier / Maintainer
  | "UNIT" // Field-level maintenance
  | "INTERMEDIATE" // I-level / DS-level
  | "DEPOT" // Organic depot
  | "OEM" // Contractor / CLS
  | "ENGINEERING"; // Configuration authority
