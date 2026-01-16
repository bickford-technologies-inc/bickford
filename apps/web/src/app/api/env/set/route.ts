import { appendEnv } from "@bickford/runtime/envLedger";
import crypto from "crypto";

export async function POST(req: Request) {
  const { key, value, scope, intentId, actor } = await req.json();

  const newHash = crypto.createHash("sha256").update(value).digest("hex");

  const entry = appendEnv({
    ts: new Date().toISOString(),
    kind: "ENV_SET",
    key,
    scope,
    oldHash: null,
    newHash,
    actor,
    intentId,
  });

  return Response.json({ ok: true, entry });
}
