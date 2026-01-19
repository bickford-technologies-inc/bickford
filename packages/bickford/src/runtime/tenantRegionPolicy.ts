/**
 * tenantRegionPolicy
 *
 * Runtime policy hook for tenant → region resolution.
 * Safe default: allow all regions.
 */

export type TenantRegionPolicy = {
  tenantId: string;
  allowedRegions: string[];
};

export function resolveTenantRegionPolicy(
  tenantId: string
): TenantRegionPolicy {
  return {
    tenantId,
    allowedRegions: ["*"],
  };
}

export default resolveTenantRegionPolicy;
