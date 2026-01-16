import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveRegion } from "@bickford/runtime/tenantRegionPolicy";
import { pickRegion } from "@bickford/runtime/tenantCanaryPolicy";
import { recordSample } from "@bickford/runtime/canaryMetrics";

export function middleware(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ error: "Missing tenant" }, { status: 400 });
  }

  const seed =
    req.headers.get("x-request-id") ?? req.ip ?? crypto.randomUUID();

  const region = pickRegion(tenantId, seed);

  const start = Date.now();
  const res = NextResponse.next();

  res.headers.append("x-response-time", `${Date.now() - start}`);

  recordSample({
    ts: Date.now(),
    tenantId,
    region,
    latencyMs: Date.now() - start,
    ok: res.status < 500,
  });

  return res;
}
