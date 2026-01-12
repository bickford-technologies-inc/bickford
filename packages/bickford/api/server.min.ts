import express from "express";
import path from "node:path";
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

// --- Observability ---
app.get("/metrics", metricsHandler);
app.get("/api/ready", async (_req, res) => {
  return res.status(200).json({ ok: true, ts: new Date().toISOString() });
});
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", version: BICKFORD_CANON_VERSION });
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
  const text = String(req.body?.text || "").trim();
  if (!text) return res.status(400).json({ ok: false, reason: "Missing text" });

  const sessionId = req.body?.sessionId ? String(req.body.sessionId) : `sess_${Date.now()}`;
  const actorId = req.body?.actorId ? String(req.body.actorId) : "human";

  const intent = await appendLedger({
    kind: "INTENT",
    payload: { text },
    meta: {
      sessionId,
      actor: { type: "human", id: actorId },
      requestId: req.requestId,
    },
  });

  const authority = await appendLedger({
    kind: "DECISION_ALLOWED",
    payload: {
      decision: "ALLOW",
      authority: "NEW_AUTHORITY",
      summary: "Demo allow: authority admitted and persisted to ledger",
      inputRef: intent.id,
    },
    meta: {
      sessionId,
      actor: { type: "system" },
      requestId: req.requestId,
    },
  });

  res.status(200).json({ ok: true, sessionId, events: [intent, authority] });
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
