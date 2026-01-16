import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const { tenantId, weights } = await req.json();

  const file = path.join(process.cwd(), "infra/routing/canary.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  const sum = Object.values(weights).reduce((s: number, v: number) => s + v, 0);
  if (sum !== 100) {
    return Response.json(
      { ok: false, error: "Weights must sum to 100" },
      { status: 400 }
    );
  }

  data.tenants[tenantId] = { weights };
  fs.writeFileSync(file, JSON.stringify(data, null, 2));

  return Response.json({ ok: true });
}
