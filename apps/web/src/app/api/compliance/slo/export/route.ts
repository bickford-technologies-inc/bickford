import { buildSLOEvidence } from "@bickford/runtime/sloEvidenceBuilder";

export async function POST(req: Request) {
  const { tenantId, from, to } = await req.json();

  const evidence = buildSLOEvidence(tenantId, { from, to });

  return Response.json({
    ok: true,
    evidence,
  });
}
