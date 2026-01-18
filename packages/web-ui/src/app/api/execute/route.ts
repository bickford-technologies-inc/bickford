import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return Response.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const {
    intent,
    text,
    message,
    mode = "DEFAULT",
    actorId = "unknown",
    sessionId = "unknown",
  } = body;

  const resolvedIntent = intent ?? text ?? message;

  if (!resolvedIntent) {
    return Response.json(
      { error: "No intent provided" },
      { status: 400 }
    );
  }

  const llmEnabled = Boolean(
    process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY
  );

  const decision = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    mode,
    actorId,
    sessionId,
    intent: resolvedIntent,
    execution: llmEnabled ? "LLM" : "AUTHORITY_ONLY",
    result: llmEnabled
      ? "LLM execution not yet implemented"
      : "LLM intentionally disabled; authority-only execution",
  };

  // 🔒 Ledger hook (replace later with persistence)
  console.log("[BICKFORD LEDGER]", decision);

  return Response.json(decision, { status: 200 });
}
