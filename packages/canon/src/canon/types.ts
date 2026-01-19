// CANON-LOCAL STRUCTURAL TYPES ONLY
// NO DOMAIN PAYLOADS
// NO SDKS
// NO DUPLICATION OF @bickford/types

export type CanonDecisionId = string;
export type CanonTenantId = string;

export type CanonDenialRecord = {
  id: CanonDecisionId;
  tenantId: CanonTenantId;
  ts: number;
  reasonCodes: string[];
  message: string;
};
