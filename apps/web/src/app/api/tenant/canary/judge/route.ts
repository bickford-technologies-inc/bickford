import { scoreCanary } from "@bickford/runtime/canarySLO";
import { rollbackTenantEnv } from "@bickford/runtime/tenantEnvRollback";

export async function POST(req: Request) {
  const { tenantId, region } = await req.json();

  const result = scoreCanary(tenantId, region);

  if (!result.ok) {
    rollbackTenantEnv(tenantId, "canary_slo_violation");
  }

  return Response.json(result);
}
