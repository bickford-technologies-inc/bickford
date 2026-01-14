export type SchedulingScope = {
  scope: "UNIT" | "INSTALLATION" | "THEATER" | "ENTERPRISE";
  movementTimeHours?: number;
  crossAuthorityAllowed: boolean;
};
