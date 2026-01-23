import { appendDailyArchive } from "../../lib/archive";
import { ENVIRONMENT_AGENT } from "../../lib/agent";
import { executeIntent } from "../../lib/execute";

export const runtime = "nodejs";

type RealtimeIntentPayload = {
  sessionId: string;
  transcript: string;
  intent?: string;
  execute?: boolean;
  source?: string;
  receivedAt?: string;
  metadata?: Record<string, unknown>;
  configOverrides?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const startedAtMs = Date.now();
  const payload = (await request.json()) as RealtimeIntentPayload;
  const now = new Date();
  const receivedAt = payload.receivedAt ?? now.toISOString();

  if (!payload.sessionId || !payload.transcript?.trim()) {
    return Response.json(
      {
        error: "sessionId and transcript are required.",
        details: "Provide both sessionId and transcript.",
      },
      { status: 400 },
    );
  }

  const entry = {
    agent: ENVIRONMENT_AGENT,
    receivedAt,
    ...payload,
  };

  await appendDailyArchive("realtime", entry);

  if (payload.intent?.trim()) {
    await appendDailyArchive("intent", {
      agent: ENVIRONMENT_AGENT,
      receivedAt,
      type: "REALTIME_INTENT",
      content: payload.intent.trim(),
      source: payload.source ?? "realtime",
      sessionId: payload.sessionId,
    });
  }

  if (payload.execute && payload.intent?.trim()) {
    const execution = await executeIntent({
      intent: payload.intent.trim(),
      origin: ENVIRONMENT_AGENT,
      source: payload.source ?? "realtime",
      sessionId: payload.sessionId,
      transcript: payload.transcript.trim(),
      metadata: payload.metadata,
      configOverrides: payload.configOverrides,
      startedAtMs,
    });
    return Response.json({ status: "ok", execution });
  }

  return Response.json({ status: "ok" });
}
