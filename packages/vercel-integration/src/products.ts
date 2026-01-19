import { vercel } from "./client";
import { IntegrationProduct } from "./types";
import { VercelProduct } from "./types";

export async function listIntegrationProducts(params: {
  integrationConfigurationId: string;
  teamId?: string;
  slug?: string;
}): Promise<IntegrationProduct[]> {
  const res = await vercel.integrations.getConfigurationProducts({
    id: params.integrationConfigurationId,
    teamId: params.teamId,
    slug: params.slug,
  });

  return res.products.map((p: VercelProduct) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    primaryProtocol: p.primaryProtocol,
    supportedProtocols: Object.keys(p.protocols ?? {}),
    metadataSchema: p.metadataSchema,
  }));
}

export function normalizeProducts(products: unknown[]): VercelProduct[] {
  return products.map((p: any) => ({
    id: String(p.id),
    name: String(p.name),
    status: p.status === "active" ? "active" : "inactive",
  }));
}

// INTEGRATION PLACEHOLDER
// Feature implementation deferred (Phase 2B)

export {};
