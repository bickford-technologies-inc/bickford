import { getFailoverRegions } from "@bickford/runtime/tenantRegionPolicy";

export async function POST(req: Request) {
  const { tenantId } = await req.json();
  const regions = getFailoverRegions(tenantId);

  if (!regions.length) {
    return Response.json({ ok: false, error: "No failover regions" });
  }

  // select next region deterministically
  return Response.json({
    ok: true,
    nextRegion: regions[0],
  });
}
