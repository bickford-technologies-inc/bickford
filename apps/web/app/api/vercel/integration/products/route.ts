import { listIntegrationProducts } from "@bickford/vercel-integration";

export async function POST(req: Request) {
  const body = await req.json();

  const products = await listIntegrationProducts({
    integrationConfigurationId: body.integrationConfigurationId,
    teamId: body.teamId,
    slug: body.slug,
  });

  return Response.json({ products });
}
