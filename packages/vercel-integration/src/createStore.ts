import { vercel } from "./client";
import { CreateIntegrationStoreInput } from "./types";
import { validateMetadataAgainstSchema } from "./validateMetadata";

export async function createIntegrationStoreDirect(
  input: CreateIntegrationStoreInput,
  productMetadataSchema?: Record<string, any>,
  opts?: {
    teamId?: string;
    slug?: string;
  },
) {
  if (productMetadataSchema) {
    validateMetadataAgainstSchema(input.metadata, productMetadataSchema);
  }

  const res = await vercel.storage.createIntegrationStoreDirect({
    teamId: opts?.teamId,
    slug: opts?.slug,
    requestBody: {
      name: input.name,
      integrationConfigurationId: input.integrationConfigurationId,
      integrationProductIdOrSlug: input.integrationProductIdOrSlug,
      metadata: input.metadata,
      externalId: input.externalId,
      protocolSettings: input.protocolSettings,
      billingPlanId: input.billingPlanId,
      paymentMethodId: input.paymentMethodId,
      prepaymentAmountCents: input.prepaymentAmountCents,
      source: "api",
    },
  });

  return res.store;
}
