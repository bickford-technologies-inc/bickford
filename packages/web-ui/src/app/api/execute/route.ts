export async function POST(req: Request) {
  let body: any;

  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const {
    intent,
    text,
    message,
    mode = "DEFAULT",
    actorId = "unknown",
    sessionId = "unknown",
  } = body ?? {};

  const resolvedIntent = intent ?? text ?? message;

  if (!resolvedIntent) {
    return new Response(
      JSON.stringify({ error: "No intent provided" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const llmEnabled =
    Boolean((globalThis as any).process?.env?.OPENAI_API_KEY) ||
    Boolean((globalThis as any).process?.env?.ANTHROPIC_API_KEY);

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

  // 🔒 Ledger (stdout for now — replace with persistence later)
  console.log("[BICKFORD LEDGER]", decision);

  return new Response(JSON.stringify(decision), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
