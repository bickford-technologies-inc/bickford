import type { IntegrationProduct } from "./types";

// INTEGRATION PLACEHOLDER
// Product surface deferred until Phase 2B

export type ListIntegrationProductsParams = {
  integrationConfigurationId?: string;
  teamId?: string;
  slug?: string;
};

export async function listIntegrationProducts(
  _params: ListIntegrationProductsParams = {},
): Promise<IntegrationProduct[]> {
  return [];
}
