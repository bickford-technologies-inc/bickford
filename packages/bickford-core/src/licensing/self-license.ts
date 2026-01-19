export type LicenseTier = "EVAL" | "ENTERPRISE" | "SOVEREIGN";

export type LicenseGrant = {
  tenantId: string;
  tier: LicenseTier;
  priceUsdAnnual: number;
  issuedAt: string;
};

export function issueLicense(
  tenantId: string,
  ttvRecoveredMsAnnual: number,
): LicenseGrant {
  const base = ttvRecoveredMsAnnual / 3_600_000;
  const priceUsdAnnual = Math.round(base * 250_000);

  return {
    tenantId,
    tier: priceUsdAnnual > 2_000_000 ? "SOVEREIGN" : "ENTERPRISE",
    priceUsdAnnual,
    issuedAt: new Date().toISOString(),
  };
}
