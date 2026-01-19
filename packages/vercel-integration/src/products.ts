import { vercel } from "./client";
import { IntegrationProduct } from "./types";
import type { VercelProduct } from "@vercel/sdk";

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
