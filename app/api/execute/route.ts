import { executeIntent } from "../../lib/execute";

type ExecutePayload = {
  intent: string;
  origin?: string;
  source?: string;
  sessionId?: string;
  transcript?: string;
  metadata?: Record<string, unknown>;
  configOverrides?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const startedAtMs = Date.now();
  const payload = (await request.json()) as ExecutePayload;
  if (!payload.intent?.trim()) {
    return Response.json(
      { error: "Intent is required.", details: "Missing intent value." },
      { status: 400 },
    );
  }

  const { decision, ledgerEntry, knowledge, performance, configuration } =
    await executeIntent({
      intent: payload.intent.trim(),
      origin: payload.origin,
      source: payload.source,
      sessionId: payload.sessionId,
      transcript: payload.transcript,
      metadata: payload.metadata,
      configOverrides: payload.configOverrides,
      startedAtMs,
    });

  return Response.json({
    decision,
    ledgerEntry,
    knowledge,
    performance,
    configuration,
  });
}
