import {
  listIntegrationProducts,
  createIntegrationStoreDirect,
} from "@bickford/vercel-integration";

export async function POST(req: Request) {
  const body = await req.json();

  const products = await listIntegrationProducts({
    integrationConfigurationId: body.integrationConfigurationId,
    teamId: body.teamId,
    slug: body.slug,
  });

  const product = products.find(
    (p) =>
      p.id === body.integrationProductIdOrSlug ||
      p.slug === body.integrationProductIdOrSlug,
  );

  if (!product) {
    return Response.json(
      { error: "Integration product not found" },
      { status: 404 },
    );
  }

  const store = await createIntegrationStoreDirect(
    body,
    product.metadataSchema,
    {
      teamId: body.teamId,
      slug: body.slug,
    },
  );

  return Response.json({ store });
}
