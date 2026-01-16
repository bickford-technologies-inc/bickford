export async function GET(
  _: Request,
  { params }: { params: { tenantId: string } }
) {
  // plug in real checks here
  return Response.json({
    ok: true,
    tenant: params.tenantId,
    time: new Date().toISOString(),
  });
}
