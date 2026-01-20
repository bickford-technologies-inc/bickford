/**
 * Tenant Region Policy
 *
 * Canonical default:
 * - Allows all regions
 * - No side effects
 * - Deterministic
 *
 * This file exists to satisfy runtime imports and CI invariants.
 * Policy logic can be extended later without breaking builds.
 */

export type TenantRegionPolicy = {
  allow: (tenantId: string, region: string) => boolean;
};

export const tenantRegionPolicy: TenantRegionPolicy = {
  allow: (_tenantId: string, _region: string) => {
    return true;
  },
};

export default tenantRegionPolicy;
