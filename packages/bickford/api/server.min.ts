import express from "express";
import path from "node:path";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import crypto from "node:crypto";

import { metricsHandler } from "./ops/metrics";
import { requestIdMiddleware } from "./ops/requestId";
import { authMiddleware } from "./security/auth";
import { BICKFORD_CANON_VERSION } from "../src/canon";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(requestIdMiddleware);
app.use(authMiddleware);

function loadDotEnvOnce() {
  // Lightweight .env loader (no dependency). This repo keeps env in packages/bickford/.env.
  // IMPORTANT: do not overwrite existing env vars.
  const candidates = [
    process.env.BICKFORD_ENV_PATH,
    path.resolve(process.cwd(), "packages", "bickford", ".env"),
    path.resolve(process.cwd(), "..", "bickford", ".env"),
    path.resolve(process.cwd(), "..", "..", "packages", "bickford", ".env"),
  ].filter(Boolean) as string[];

  for (const envPath of candidates) {
    try {
      if (!envPath) continue;
      if (!fsSync.existsSync(envPath)) continue;
      const raw = fsSync.readFileSync(envPath, "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq <= 0) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (process.env[key] === undefined) process.env[key] = value;
      }
      return;
    } catch {
      // ignore
    }
  }
}

loadDotEnvOnce();

function getOpenAIConfig() {
  const apiKey = (process.env.OPENAI_API_KEY || "").trim();
  const model = (process.env.OPENAI_MODEL || "gpt-4o-mini").trim();
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const timeoutMs = Math.max(1_000, Number(process.env.OPENAI_TIMEOUT_MS || 15_000));
  return {
    configured: Boolean(apiKey && model),
    apiKeySet: Boolean(apiKey),
    model,
    baseUrl,
    timeoutMs,
  };
}

// Back-compat helper: some routes may reference this name.
const __bickford_llmConfigured = () => getOpenAIConfig().configured;

function __bickford_fallbackChatReply(input: unknown) {
  const text = String(input ?? "").trim();
  if (!text) return "ALLOW: (empty message)";
  if (/\b(hi|hello|hey)\b/i.test(text)) return "ALLOW: Greeting detected.";
  return "ALLOW: Demo allow (LLM not configured).";
}

async function inferDecisionWithOpenAI(input: {
  text: string;
  sessionId: string;
  actorId: string;
}): Promise<
  | { used: false; reason: string }
  | {
      used: true;
      model: string;
      decision: "ALLOW" | "DENY";
      summary: string;
      rawText?: string;
    }
> {
  const apiKey = (process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) return { used: false, reason: "OPENAI_API_KEY not set" };

  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const model = (process.env.OPENAI_MODEL || "gpt-4o-mini").trim();
  const timeoutMs = Math.max(1_000, Number(process.env.OPENAI_TIMEOUT_MS || 15_000));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const system = `You are an execution-authority classifier for the Bickford intent-filing system.

Your role is to classify user intents and provide conversational summaries, NOT to block legitimate requests.

DEFAULT TO ALLOW for:
- Information queries ("what can you do", "show me", "explain")
- Read operations (view, list, get, fetch)
- Filing intents (log, record, save, track)
- Capability discovery (help, capabilities, features)
- Normal conversational requests

ONLY DENY if the intent is clearly:
- Destructive without confirmation (delete all, drop database, remove everything)
- Security bypass attempts (access credentials, bypass auth, sudo, admin override)
- System corruption (modify core config, disable security, change permissions)
- Malicious (inject code, exploit, hack)

For ambiguous or unclear requests: ALLOW and ask for clarification in the summary.

Output ONLY strict JSON with two keys:
- decision: "ALLOW" or "DENY"  
- summary: A helpful, conversational response (1-2 sentences)

Examples:
User: "what can you do"
{"decision": "ALLOW", "summary": "I can help you file intents, track decisions, and maintain a persistent ledger of your work."}

User: "access full bickford"
{"decision": "ALLOW", "summary": "You have access to the Bickford system. What would you like to do?"}

User: "delete everything permanently"
{"decision": "DENY", "summary": "Bulk deletion requires explicit confirmation. Please specify what you want to delete and confirm."}`;
    const user =
      `Session: ${input.sessionId}\nActor: ${input.actorId}\nIntent: ${input.text}\n\nReturn JSON only.`;

    const resp = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });

    const json = (await resp.json().catch(() => null)) as any;
    const rawText: string | undefined = json?.choices?.[0]?.message?.content;
    if (!resp.ok) {
      return {
        used: false,
        reason: `OpenAI error: ${resp.status} ${resp.statusText}`,
      };
    }

    if (!rawText || typeof rawText !== "string") {
      return { used: false, reason: "OpenAI response missing text" };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return { used: true, model, decision: "ALLOW", summary: rawText.slice(0, 240), rawText };
    }

    const decision = parsed?.decision === "DENY" ? "DENY" : "ALLOW";
    const summary = typeof parsed?.summary === "string" ? parsed.summary : rawText.slice(0, 240);

    return { used: true, model, decision, summary, rawText };
  } catch (e: any) {
    return { used: false, reason: e?.name === "AbortError" ? "OpenAI timeout" : String(e?.message || e) };
  } finally {
    clearTimeout(timeout);
  }
}

// --- Observability ---
app.get("/metrics", metricsHandler);
app.get("/api/ready", async (_req, res) => {
  return res.status(200).json({ ok: true, ts: new Date().toISOString() });
});
app.get("/api/health", (_req, res) => {
  try {
    const cfg = getOpenAIConfig();
    res.status(200).json({
      status: "ok",
      version: BICKFORD_CANON_VERSION,
      llm: {
        configured: cfg.configured,
        provider: "openai",
        model: cfg.model,
        baseUrl: cfg.baseUrl,
      },
    });
  } catch (e: any) {
    // Health must never fail (used by demos/tests).
    res.status(200).json({
      status: "ok",
      version: BICKFORD_CANON_VERSION,
      llm: {
        configured: false,
        provider: "openai",
        error: String(e?.message || e),
      },
    });
  }
});

// Web UI dashboard summary for the DEREK demo.
app.get("/api/derek/summary", async (_req, res) => {
  try {
    const cfg = getOpenAIConfig();

    let ledgerEvents = 0;
    let lastEventTs: string | null = null;
    try {
      const recent = await readRecentLedger(500);
      ledgerEvents = recent.length;
      lastEventTs = recent.length ? recent[recent.length - 1]?.ts ?? null : null;
    } catch {
      ledgerEvents = 0;
      lastEventTs = null;
    }

    // Simple, deterministic score that increases with activity.
    const knowledgeScore = Math.min(100, ledgerEvents);

    return res.status(200).json({
      ts: new Date().toISOString(),
      knowledgeScore,
      growth: {
        ledgerEvents,
        lastEventTs,
      },
      llm: {
        available: cfg.configured,
        model: cfg.configured ? cfg.model : undefined,
      },
    });
  } catch (e: any) {
    // Keep the UI running even if summary has issues.
    return res.status(200).json({
      ts: new Date().toISOString(),
      knowledgeScore: 0,
      growth: { ledgerEvents: 0, lastEventTs: null },
      llm: { available: false },
      error: String(e?.message || e),
    });
  }
});

// --- Session Completion (demo endpoints; in-memory) ---
export type SessionCompletionEvent = {
  event_type?: "session.completed";
  event_id?: string;
  timestamp?: string;
  session?: {
    session_id?: string;
    session_type?: string;
    start_time?: string;
    end_time?: string;
    duration_ms?: number;
  };
  user?: { user_id?: string; organization_id?: string };
  usage?: { total_tokens?: number; input_tokens?: number; output_tokens?: number; model?: string };
  outcome?: { status?: string; error_message?: string };
  metadata?: Record<string, any>;
};

const sessionEvents: SessionCompletionEvent[] = [];
let sessionEventsCaptured = 0;
let sessionEventsAccepted = 0;

function getSessionCompletionMetrics() {
  const recent = sessionEvents.slice(-200);
  const totalTokens = recent.reduce((acc, e) => acc + (e.usage?.total_tokens ?? 0), 0);
  return {
    ts: new Date().toISOString(),
    eventsCaptured: sessionEventsCaptured,
    eventsAccepted: sessionEventsAccepted,
    recentCount: recent.length,
    recentTotalTokens: totalTokens,
  };
}

app.get("/api/session-completion/metrics", (_req, res) => {
  res.json(getSessionCompletionMetrics());
});

app.post("/api/session-completion/events", async (req, res) => {
  const body = (req.body || {}) as SessionCompletionEvent;
  const now = new Date().toISOString();
  const event: SessionCompletionEvent = {
    ...body,
    event_type: body.event_type || "session.completed",
    timestamp: body.timestamp || now,
    event_id: body.event_id || `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`,
  };

  sessionEvents.push(event);
  sessionEventsCaptured += 1;
  sessionEventsAccepted += 1;
  res.status(200).json({ ok: true, ts: now, event_id: event.event_id });
});

app.get("/api/session-completion/recent", (req, res) => {
  const limit = Math.max(1, Math.min(200, Number(req.query.limit) || 50));
  res.json({ ts: new Date().toISOString(), events: sessionEvents.slice(-limit).reverse() });
});

// --- Filing / Decision Continuity Ledger (append-only JSONL + SSE) ---

export type FilingLedgerEvent = {
  id: string;
  ts: string;
  kind:
    | "INTENT"
    | "PLAN"
    | "ACTION"
    | "OBSERVATION"
    | "DECISION_ALLOWED"
    | "DECISION_DENIED"
    | "SESSION_COMPLETION";
  payload: any;
  meta?: {
    tenantId?: string;
    sessionId?: string;
    actor?: { type: "human" | "agent" | "system"; id?: string };
    requestId?: string;
  };
};

const LEDGER_PATH =
  process.env.BICKFORD_FILING_LEDGER_PATH || path.resolve(process.cwd(), ".data", "bickford-filing-ledger.jsonl");

async function ensureLedgerDir() {
  await fs.mkdir(path.dirname(LEDGER_PATH), { recursive: true });
}

async function appendLedger(evt: Omit<FilingLedgerEvent, "id" | "ts"> & { ts?: string; id?: string }) {
  await ensureLedgerDir();
  const record: FilingLedgerEvent = {
    id: evt.id || crypto.randomUUID(),
    ts: evt.ts || new Date().toISOString(),
    kind: evt.kind,
    payload: evt.payload,
    meta: evt.meta,
  };
  await fs.appendFile(LEDGER_PATH, JSON.stringify(record) + "\n", "utf8");
  return record;
}

async function readRecentLedger(limit: number) {
  try {
    const buf = await fs.readFile(LEDGER_PATH, "utf8");
    const lines = buf
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const slice = lines.slice(-limit);
    return slice.map((l) => JSON.parse(l) as FilingLedgerEvent);
  } catch (e: any) {
    if (e?.code === "ENOENT") return [];
    throw e;
  }
}

app.get("/api/filing/folders", (_req, res) => {
  res.json({
    ts: new Date().toISOString(),
    folders: [
      { id: "inbox", title: "Inbox", count: 0 },
      { id: "authority", title: "Authority", count: 0 },
      { id: "execution", title: "Execution", count: 0 },
      { id: "ledger", title: "Ledger", count: 0 },
    ],
  });
});

app.post("/api/filing/ledger/append", async (req, res) => {
  const kind = String(req.body?.kind || "").trim();
  const payload = req.body?.payload;
  const tenantId = req.body?.tenantId ? String(req.body.tenantId) : undefined;
  const sessionId = req.body?.sessionId ? String(req.body.sessionId) : undefined;
  const actor = req.body?.actor as FilingLedgerEvent["meta"]["actor"] | undefined;

  if (!kind) return res.status(400).json({ ok: false, reason: "Missing kind" });
  if (payload === undefined) return res.status(400).json({ ok: false, reason: "Missing payload" });

  const evt = await appendLedger({
    kind: kind as FilingLedgerEvent["kind"],
    payload,
    meta: {
      tenantId,
      sessionId,
      actor,
      requestId: req.requestId,
    },
  });

  res.status(200).json({ ok: true, event: evt });
});

// Convenience endpoint: turns a chat input into a short, visible event chain.
// This is intentionally simple (demo), but it proves the decision-continuity loop.
app.post("/api/filing/chat", async (req, res) => {
  try {
    const body = (req && (req.body ?? req)) as any;
    const message = body?.message ?? body?.text ?? body?.prompt ?? body?.input ?? "";

    const cfg = getOpenAIConfig();
    if (!cfg.configured) {
      const content = __bickford_fallbackChatReply(message);
      return res.status(200).json({
        ok: true,
        mode: body?.mode ?? "DEREK",
        message: { role: "assistant", content },
        reply: content,
        content,
      });
    }

    const text = String(message || "").trim();
    if (!text) return res.status(400).json({ ok: false, reason: "Missing text" });

    const sessionId = body?.sessionId ? String(body.sessionId) : `sess_${Date.now()}`;
    const actorId = body?.actorId ? String(body.actorId) : "human";

    const intent = await appendLedger({
      kind: "INTENT",
      payload: { text },
      meta: {
        sessionId,
        actor: { type: "human", id: actorId },
        requestId: req.requestId,
      },
    });

    const inferred = await inferDecisionWithOpenAI({ text, sessionId, actorId });

    const authMode = String(process.env.AUTH_DECISION_MODE || "permissive").toLowerCase();
    let decision: "ALLOW" | "DENY" = inferred.used ? inferred.decision : "ALLOW";
    let summary: string = inferred.used
      ? inferred.summary
      : "Request received and logged to ledger (LLM not configured)";
    let authNotes: string | undefined;

    if (authMode === "permissive") {
      decision = "ALLOW";
    } else if (authMode === "audit") {
      if (inferred.used && inferred.decision === "DENY") {
        authNotes = `Audit: would have been DENIED - ${inferred.summary}`;
        console.warn(`[AUTH AUDIT] Would DENY: ${text} | Reason: ${inferred.summary}`);
      }
      decision = "ALLOW";
    } else if (authMode === "enforce") {
      // keep decision as inferred
    } else {
      // unknown mode: default permissive
      decision = "ALLOW";
    }

    const authority = await appendLedger({
      kind: decision === "DENY" ? "DECISION_DENIED" : "DECISION_ALLOWED",
      payload: {
        decision,
        authority: "NEW_AUTHORITY",
        summary,
        ...(authMode !== "permissive" && { authMode }),
        ...(authNotes && { authNotes }),
        inputRef: intent.id,
        llm: inferred.used
          ? {
              used: true,
              model: inferred.model,
              ...(inferred.decision !== decision && { rawDecision: inferred.decision }),
            }
          : { used: false, reason: inferred.reason },
      },
      meta: {
        sessionId,
        actor: { type: "system" },
        requestId: req.requestId,
      },
    });

    const content = authMode === "enforce" ? `${decision}: ${summary}` : summary;
    return res.status(200).json({
      ok: true,
      mode: body?.mode ?? "DEREK",
      sessionId,
      requestId: req.requestId,
      message: { role: "assistant", content },
      reply: content,
      content,
      events: [intent, authority],
    });
  } catch (err: any) {
    const detail = {
      name: err?.name,
      message: err?.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err?.stack,
    };
    return res.status(500).json({ ok: false, code: "CHAT_INTERNAL_ERROR", detail });
  }
});

app.get("/api/filing/ledger/recent", async (req, res) => {
  const limit = Math.max(1, Math.min(500, Number(req.query.limit) || 100));
  const events = await readRecentLedger(limit);
  res.status(200).json({ ok: true, ts: new Date().toISOString(), events });
});

app.get("/api/filing/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const send = (evt: FilingLedgerEvent) => {
    res.write(`event: ledger\n`);
    res.write(`data: ${JSON.stringify(evt)}\n\n`);
  };

  const initial = await readRecentLedger(50);
  initial.forEach(send);

  await ensureLedgerDir();
  let position = 0;
  try {
    const st = await fs.stat(LEDGER_PATH);
    position = st.size;
  } catch {
    position = 0;
  }

  let carry = "";
  const interval = setInterval(async () => {
    try {
      const st = await fs.stat(LEDGER_PATH);
      if (st.size <= position) return;

      const fd = await fs.open(LEDGER_PATH, "r");
      try {
        const len = st.size - position;
        const buf = Buffer.alloc(len);
        await fd.read(buf, 0, len, position);
        position = st.size;

        const text = carry + buf.toString("utf8");
        const parts = text.split(/\n/);
        carry = parts.pop() ?? "";
        for (const line of parts) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            send(JSON.parse(trimmed));
          } catch {
            // ignore
          }
        }
      } finally {
        await fd.close();
      }
    } catch {
      // ignore
    }
  }, 500);

  req.on("close", () => {
    clearInterval(interval);
  });
});

// --- Start ---
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Bickford API listening on http://0.0.0.0:${PORT}`);
  console.log(`ledger: ${LEDGER_PATH}`);
});
