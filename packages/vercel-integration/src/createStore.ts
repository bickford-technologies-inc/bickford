import type { CreateIntegrationStoreInput, VercelStore } from "./types";

// INTEGRATION PLACEHOLDER
// Feature implementation deferred (Phase 2B)

export type CreateIntegrationStoreOptions = {
  teamId?: string;
  slug?: string;
};

export async function createIntegrationStoreDirect(
  input: CreateIntegrationStoreInput,
  _metadataSchema?: Record<string, unknown>,
  _options: CreateIntegrationStoreOptions = {},
): Promise<VercelStore> {
  return {
    id: `store_${Date.now()}`,
    name: input.name,
  };
}
