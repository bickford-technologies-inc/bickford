export type IntegrationProduct = {
  id: string;
  slug: string;
  name: string;
  primaryProtocol: string;
  supportedProtocols?: string[];
  metadataSchema: Record<string, unknown>;
};

export type CreateIntegrationStoreInput = {
  name: string;
  integrationConfigurationId: string;
  integrationProductIdOrSlug: string;
  metadata?: Record<string, unknown>;
  externalId?: string;
  protocolSettings?: Record<string, unknown>;
  billingPlanId?: string;
  paymentMethodId?: string;
  prepaymentAmountCents?: number;
};
