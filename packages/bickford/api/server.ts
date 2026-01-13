
import express from 'express';
// --- Express app initialization ---
import express from 'express';
const app = express();
app.use(express.json({ limit: "1mb" }));
import { requestIdMiddleware } from "./ops/requestId";
import { authMiddleware } from "./security/auth";
app.use(requestIdMiddleware);
app.use(authMiddleware);

// POST /api/canon/ledger/notarize/:pointer
app.post("/api/canon/ledger/notarize/:pointer", async (req, res) => {
// Notary S3 anchor import
import { writeS3Anchor } from "./notary.s3";

// Save anchor record to Postgres
async function saveAnchorToPg(a: any) {
  await pool.query(
    `
    INSERT INTO canon_ledger_anchors
      (ts, pointer, head_seq, head_hash, anchor_type, anchor_uri, anchor_etag, anchor_version_id, signature, payload)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `,
    [
      a.ts,
      a.pointer,
      a.headSeq,
      a.headHash,
      a.anchorType,
      a.anchorUri,
      a.etag,
      a.versionId,
      a.signature,
      JSON.stringify(a.payload),
    ]
  );
}

// (app initialization moved to top of file)

// GET /api/canon/ledger/anchors/:pointer
app.get("/api/canon/ledger/anchors/:pointer", async (req, res) => {
  const pointer = String(req.params.pointer || "").trim();
  const r = await pool.query(
    `
    SELECT ts, head_seq, head_hash, anchor_type, anchor_uri, anchor_etag, anchor_version_id
    FROM canon_ledger_anchors
    WHERE pointer = $1
    ORDER BY ts DESC
    LIMIT 50
    `,
    [pointer]
  );
  res.json({ pointer, anchors: r.rows });
});
// ---------- /api/canon/ledger/verify/:pointer ----------
// TIMESTAMP: 2025-12-23T14:41:00-05:00
app.get("/api/canon/ledger/verify/:pointer", async (req, res) => {
  const pointer = String(req.params.pointer || "").trim();
  if (!pointer) return res.status(400).json({ ok: false, pointer, reason: "Missing pointer." });

  // Prefer PG for verification (authoritative archive)
  const events = await pgStore.getLedger(pointer, 2000);

  if (!events || events.length === 0) {
    return res.status(404).json({ ok: false, pointer, reason: "No events found." });
  }

  // Recompute chain
  let prevHash = null;
  let expectedSeq = 1;

  for (const e of events) {
    const payload = e.payload;
    const seq = payload?.seq ?? null;
    const storedPrev = payload?.prevHash ?? null;
    const storedHash = payload?.eventHash ?? null;

    if (seq !== expectedSeq) {
      return res.status(200).json({
        ok: false,
        pointer,
        reason: "SEQ_MISMATCH",
        atSeq: expectedSeq,
        foundSeq: seq,
      });
    }

    if (storedPrev !== prevHash) {
      return res.status(200).json({
        ok: false,
        pointer,
        reason: "PREV_HASH_MISMATCH",
        atSeq: expectedSeq,
        expectedPrevHash: prevHash,
        foundPrevHash: storedPrev,
      });
    }

    const recomputed = computeEventHash({
      pointer,
      seq,
      ts: payload.ts,
      prevHash: storedPrev,
      payload,
    });

    if (recomputed !== storedHash) {
      return res.status(200).json({
        ok: false,
        pointer,
        reason: "HASH_MISMATCH",
        atSeq: expectedSeq,
        expectedHash: recomputed,
        foundHash: storedHash,
      });
    }

    prevHash = storedHash;
    expectedSeq += 1;
  }

  return res.status(200).json({
    ok: true,
    pointer,
    count: events.length,
    head: { seq: expectedSeq - 1, hash: prevHash },
  });
});
// ---------- Denial index (read-model for why-not) ----------
type DenialKind = "DECIDE" | "PROMOTE" | "NON_INTERFERENCE";

type DenialIndexEntry = {
  id: string;              // decisionId | promotionId | checkId
  kind: DenialKind;
  ts: string;
  actionId: string;
  denialTrace: any;
  stableKey: string;
};

const denialIndex = new Map<string, DenialIndexEntry>();

// --- Redis and Postgres Canon Store Imports ---
import { RedisCanonStore } from "./storage.redis";
import { pgPool, PostgresCanonStore } from "./storage.pg";
import { createClient } from "redis";
import { stableStringify, sha256 } from "./decide.contract";
import { authMiddleware, requireScopes } from "./security/auth";
import { enforceTenantMatch, requireTenantHeader } from "./security/tenant";
import { rateLimitRedis } from "./security/ratelimit";
import { metricsMiddleware, metricsHandler, decisionCount, idempotencyHits } from "./ops/metrics";
import { requestIdMiddleware } from "./ops/requestId";

// Canonical hash function for tamper-evident ledger
function computeEventHash(params: {
  pointer: string;
  seq: number;
  ts: string;
  prevHash: string | null;
  payload: unknown;
}) {
  // Canonical, deterministic representation
  const canonical = stableStringify({
    pointer: params.pointer,
    seq: params.seq,
    ts: params.ts,
    prevHash: params.prevHash,
    payload: params.payload,
  });
  return sha256(canonical);
}

// --- Redis and Postgres Store Initialization ---
const redis = createClient({ url: process.env.REDIS_URL });
redis.connect();
const store = new RedisCanonStore(redis);
const pool = pgPool();
const pgStore = new PostgresCanonStore(pool);

// ---------- Ledger pointer index (optional) ----------
const ledgerPointerIndex = new Map<string, any[]>();
import {
  CanonPromotionRequestSchema,
  buildStablePromotionKey,
  type CanonPromotionResponse,
} from "./promote.contract";
// ---------- Promotion idempotency cache (in-memory stub) ----------
const promotionCache = new Map<string, CanonPromotionResponse>();

// ---------- Global Middleware ----------

import express from 'express';

// (app initialization is now at the top of the file)

// ---------- Observability Endpoints ----------
app.get("/metrics", metricsHandler);
app.get("/api/ready", async (req, res) => {
  const ts = new Date().toISOString();
  try {
    await redis.ping();
    await pool.query("SELECT 1");
    return res.status(200).json({ ok: true, ts });
  } catch (e: any) {
    return res.status(503).json({ ok: false, ts, error: e?.message });
  }
});

// ---------- Canon store stub (in-memory) ----------
// In prod: DB table for canon entries + versions + hashes.
type CanonEntry = {
  id: string;
  kind: string;
  title: string;
  content: string;
  ts: string;
  provenance: any;
};
const canonStore = new Map<string, CanonEntry>();

function canonPointerFor(stableKey: string) {
  return `canon_stub:${stableKey.slice(0, 16)}`;
}
// ---------- /api/canon/promote ----------
app.post(
  "/api/canon/promote",
  requireScopes(["canon.promote"]),
  enforceTenantMatch({ bodyPath: "context.tenantId" }),
  rateLimitRedis({ redis, keyPrefix: "bickford:rl", windowSeconds: 60, maxRequests: 30, routeTag: "promote" }),
  metricsMiddleware("promote"),
  async (req, res) => {
  const ts = new Date().toISOString();

  const headerIdem = req.header("Idempotency-Key") || req.header("idempotency-key");
  const bodyIdem = typeof req.body?.idempotencyKey === "string" ? req.body.idempotencyKey : undefined;
  const idempotencyKey = headerIdem || bodyIdem || "none";

  const parsed = CanonPromotionRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "BAD_REQUEST",
      ts,
      details: parsed.error.flatten(),
    });
  }

  const r = parsed.data;
  const tenantId = r.context?.tenantId ?? "default";
  const canonId = r.candidate.id;

  const stableKey = buildStablePromotionKey({
    tenantId,
    canonId,
    idempotencyKey,
    candidate: r.candidate,
    provenance: r.provenance,
    gate: r.gate,
    context: r.context,
  });

  // Replay from cache (idempotency)
  // tenantId already declared above
  const caller = req.caller!;
  const requestId = req.requestId!;
  const cachedJson = await store.getIdem("promote", tenantId, stableKey);
  if (cachedJson) {
    idempotencyHits.labels("promote").inc();
    return res.status(200).json(JSON.parse(cachedJson));
  }

  // Ledger: requested
  await ledgerWrite({
    ts,
    type: "DECISION_REQUESTED",
    tenantId,
    actionId: `PROMOTE/${canonId}`,
    stableKey,
    requestHash: sha256(JSON.stringify(req.body)),
    meta: { requestId, caller },
  });

  // Promotion gate evaluation (canonical)
  const failedChecks = [];
  if (!r.gate.resistance.passed) failedChecks.push("resistance");
  if (!r.gate.reproducibility.passed) failedChecks.push("reproducibility");
  if (!r.gate.invariantSafety.passed) failedChecks.push("invariantSafety");
  if (!r.gate.feasibilityImpact.passed) failedChecks.push("feasibilityImpact");

  const canonVersion = await getCanonVersion();

  if (failedChecks.length > 0) {
    const promotionId = sha256(`${stableKey}:DENY`);
    const whyNotId = `whynot_${stableKey.slice(0, 24)}`;

    const minimalFix = failedChecks.map((c) => {
      switch (c) {
        case "resistance":
          return "Provide evidence showing constraints bound and failure was possible (resistance).";
        case "reproducibility":
          return "Provide repeated trials demonstrating stable outcome across contexts (reproducibility).";
        case "invariantSafety":
          return "Show invariant checks pass under admissible paths; list checked invariants (invariantSafety).";
        case "feasibilityImpact":
          return "Explain how this changes Π (admissible action set); provide deltaPiSummary (feasibilityImpact).";
      }
    });

    const deny = {
      decision: "DENY",
      promotionId,
      ts,
      canonId,
      denialTrace: {
        code: "PROMOTION_GATE_FAILED",
        reason: "Promotion denied: candidate did not satisfy required promotion gate checks.",
        failedChecks,
        minimalFix,
        whyNotId,
      },
    };

    await ledgerWrite({
      ts,
      type: "DECISION_DENIED",
      tenantId,
      actionId: `PROMOTE/${canonId}`,
      decisionId: promotionId,
      stableKey,
      denial: deny.denialTrace,
      meta: { requestId, caller },
    });

    await store.setIdem("promote", tenantId, stableKey, JSON.stringify(deny));
    decisionCount.labels("promote", "DENY").inc();
    return res.status(200).json(deny);
  }

  // ALLOW: promote into canon store (stub)
  const promotionId = sha256(`${stableKey}:ALLOW`);
  canonStore.set(canonId, {
    id: canonId,
    kind: r.candidate.kind,
    title: r.candidate.title,
    content: r.candidate.content,
    ts,
    provenance: r.provenance,
  });

  const allow = {
    decision: "ALLOW",
    promotionId,
    ts,
    canonId,
    proof: {
      canonVersion,
      ledgerPointer: ledgerPointerFor(stableKey),
      gateSummary: {
        resistance: true,
        reproducibility: true,
        invariantSafety: true,
        feasibilityImpact: true,
      },
    },
  };

  await ledgerWrite({
    ts,
    type: "DECISION_ALLOWED",
    tenantId,
    actionId: `PROMOTE/${canonId}`,
    decisionId: promotionId,
    stableKey,
    meta: { requestId, caller },
  });
  await store.setIdem("promote", tenantId, stableKey, JSON.stringify(allow));
  decisionCount.labels("promote", "ALLOW").inc();
  return res.status(200).json(allow);
});
// (optional) dev endpoint to view stub canon store
app.get("/api/canon/_store", (_req, res) => {
  res.json({ count: canonStore.size, entries: Array.from(canonStore.values()) });
});
import { BICKFORD_CANON_VERSION } from '../src/canon';
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: BICKFORD_CANON_VERSION });
});
app.get('/api/canon/version', (req, res) => {
  res.json({ version: BICKFORD_CANON_VERSION });
});


import { z } from "zod";
import {
  CanonDecideRequestSchema,
  buildStableDecisionKey,
  sha256,
  type CanonDecideResponse,
} from "./decide.contract";

// ---------- Canon version stub ----------
async function getCanonVersion() {
  return "CANON_API_v1";
}

// ---------- Required canon coverage map ----------
const REQUIRED_CANON_BY_ACTION_CLASS = {
  BUILD_TRIGGER: [
    "CANON.INV.TIMESTAMPS_REQUIRED",
    "CANON.INV.AUTHORITY_BOUNDARY",
    "CANON.POL.TRUST_FIRST_DENIAL_TRACE",
    "CANON.INV.CANON_COVERAGE_GATE",
  ],
  NON_INTERFERENCE: [
    "CANON.INV.TIMESTAMPS_REQUIRED",
    "CANON.INV.AUTHORITY_BOUNDARY",
    "CANON.POL.TRUST_FIRST_DENIAL_TRACE",
    "CANON.INV.CANON_COVERAGE_GATE",
    "CANON.INV.NON_INTERFERENCE"
  ],
  DEFAULT: [
    "CANON.INV.TIMESTAMPS_REQUIRED",
    "CANON.INV.AUTHORITY_BOUNDARY",
    "CANON.POL.TRUST_FIRST_DENIAL_TRACE",
    "CANON.INV.CANON_COVERAGE_GATE",
  ],
};
import {
  NonInterferenceRequestSchema,
  buildStableNonInterferenceKey,
  type NonInterferenceResponse,
} from "./noninterference.contract";
const nonInterferenceCache = new Map<string, NonInterferenceResponse>();
function ledgerPointerForKey(stableKey: string) {
  return `ledger_stub:${stableKey.slice(0, 16)}`;
}
// ---------- /api/canon/check-non-interference ----------
app.post("/api/canon/check-non-interference", async (req, res) => {
  const ts = new Date().toISOString();

  const headerIdem = req.header("Idempotency-Key") || req.header("idempotency-key");
  const bodyIdem = typeof req.body?.idempotencyKey === "string" ? req.body.idempotencyKey : undefined;
  const idempotencyKey = headerIdem || bodyIdem || "none";

  const parsed = NonInterferenceRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "BAD_REQUEST",
      ts,
      details: parsed.error.flatten(),
    });
  }

  const r = parsed.data;
  const tenantId = r.context?.tenantId ?? "default";

  // Treat the endpoint as an action class for coverage:
  const endpointActionId = "NON_INTERFERENCE/CHECK";
  const required = requiredCanonForAction(endpointActionId);

  const stableKey = buildStableNonInterferenceKey({
    tenantId,
    idempotencyKey,
    proposer: r.proposer,
    action: r.action,
    others: r.others,
    canonRefs: r.canonRefs,
    context: r.context,
  });

  // Replay if cached
  const cached = nonInterferenceCache.get(stableKey);
  if (cached) return res.status(200).json(cached);

  await ledgerWrite({
    ts,
    type: "DECISION_REQUESTED",
    tenantId,
    actionId: endpointActionId,
    stableKey,
    requestHash: sha256(JSON.stringify(req.body)),
  });

  const provided = new Set(r.canonRefs.map((x) => x.id));
  const missingCanon = required.filter((id) => !provided.has(id));
  const canonVersion = await getCanonVersion();

  // Coverage gate
  if (missingCanon.length > 0) {
    const whyNotId = `whynot_${stableKey.slice(0, 24)}`;
    const checkId = sha256(`${stableKey}:DENY:CANON`);

    const deny = {
      decision: "DENY",
      checkId,
      ts,
      actionId: r.action.actionId,
      denialTrace: {
        code: "CANON_COVERAGE_GATE",
        reason: "Required canon references missing for non-interference check.",
        failedInvariant: "CANON.INV.CANON_COVERAGE_GATE",
        missingCanon,
        minimalFix: missingCanon.map((id) => `Add canonRef: ${id}`),
        whyNotId,
      },
    };

    await ledgerWrite({
      ts,
      type: "DECISION_DENIED",
      tenantId,
      actionId: endpointActionId,
      decisionId: checkId,
      stableKey,
      denial: deny.denialTrace,
    });

    nonInterferenceCache.set(stableKey, deny);
    return res.status(200).json(deny);
  }

  // Need baseline + predicted to compute ΔE[TTV] per other agent
  const missingTtvAgents = r.others
    .filter(
      (o) =>
        typeof o.baselineExpectedTTV !== "number" ||
        typeof o.predictedExpectedTTV !== "number"
    )
    .map((o) => o.agentId);

  if (missingTtvAgents.length > 0) {
    const whyNotId = `whynot_${stableKey.slice(0, 24)}`;
    const checkId = sha256(`${stableKey}:DENY:TTV_INPUTS`);

    const deny = {
      decision: "DENY",
      checkId,
      ts,
      actionId: r.action.actionId,
      denialTrace: {
        code: "MISSING_TTV_INPUTS",
        reason:
          "Non-interference requires baselineExpectedTTV and predictedExpectedTTV for each potentially impacted agent.",
        failedInvariant: "CANON.INV.NON_INTERFERENCE",
        minimalFix: [
          ...missingTtvAgents.map(
            (id) =>
              `Provide baselineExpectedTTV and predictedExpectedTTV for agentId=${id}.`
          ),
          "If you do not have predictions yet, run a simulation/model step to produce them (OPTR/forecast).",
        ],
        whyNotId,
      },
    };

    await ledgerWrite({
      ts,
      type: "DECISION_DENIED",
      tenantId,
      actionId: endpointActionId,
      decisionId: checkId,
      stableKey,
      denial: deny.denialTrace,
    });

    nonInterferenceCache.set(stableKey, deny);
    return res.status(200).json(deny);
  }

  // Compute deltas and enforce ΔE[TTV_j|π_i] <= 0
  const deltas = r.others.map((o) => ({
    agentId: o.agentId,
    deltaExpectedTTV: (o.predictedExpectedTTV) - (o.baselineExpectedTTV),
  }));

  const offenders = deltas.filter((d) => d.deltaExpectedTTV > 0);

  if (offenders.length > 0) {
    const whyNotId = `whynot_${stableKey.slice(0, 24)}`;
    const checkId = sha256(`${stableKey}:DENY:NI_VIOLATION`);

    const deny = {
      decision: "DENY",
      checkId,
      ts,
      actionId: r.action.actionId,
      denialTrace: {
        code: "NON_INTERFERENCE_VIOLATION",
        reason:
          "Action is inadmissible: it increases at least one other agent’s expected Time-to-Value.",
        failedInvariant: "CANON.INV.NON_INTERFERENCE",
        offenders,
        minimalFix: [
          "Modify the proposed action to avoid increasing others’ expected TTV (reduce contention, scope, or risk).",
          "Re-run prediction/simulation to show ΔE[TTV_j] <= 0 for all other agents.",
          "If conflict is structural, promote a constraint to prevent this interference class in the future.",
        ],
        whyNotId,
      },
    };

    await ledgerWrite({
      ts,
      type: "DECISION_DENIED",
      tenantId,
      actionId: endpointActionId,
      decisionId: checkId,
      stableKey,
      denial: deny.denialTrace,
    });

    nonInterferenceCache.set(stableKey, deny);
    return res.status(200).json(deny);
  }

  // ALLOW
  const checkId = sha256(`${stableKey}:ALLOW`);

  const allow = {
    decision: "ALLOW",
    checkId,
    ts,
    actionId: r.action.actionId,
    proof: {
      canonVersion,
      evaluatedInvariants: ["CANON.INV.NON_INTERFERENCE"],
      deltas,
      ledgerPointer: typeof (globalThis as any).ledgerPointerFor === "function"
        ? (globalThis as any).ledgerPointerFor(stableKey)
        : ledgerPointerForKey(stableKey),
    },
  };

  await ledgerWrite({
    ts,
    type: "DECISION_ALLOWED",
    tenantId,
    actionId: endpointActionId,
    decisionId: checkId,
    stableKey,
  });

  nonInterferenceCache.set(stableKey, allow);
  return res.status(200).json(allow);
});
function getActionClass(actionId) {
  const prefix = actionId.split("/")[0]?.trim();
  if (!prefix) return "DEFAULT";
  if (REQUIRED_CANON_BY_ACTION_CLASS[prefix]) return prefix;
  return "DEFAULT";
}
function requiredCanonForAction(actionId) {
  const actionClass = getActionClass(actionId);
  return REQUIRED_CANON_BY_ACTION_CLASS[actionClass] ?? REQUIRED_CANON_BY_ACTION_CLASS.DEFAULT;
}

// ---------- Idempotency cache (in-memory stub) ----------
const decisionCache = new Map();

// ---------- Ledger stub ----------
const ledger = [];
async function ledgerWrite(evt) {
  console.log("[LEDGER]", JSON.stringify(evt));

  const pointer = ledgerPointerFor(evt.stableKey);

  // 1) Determine tail (prefer Redis head, fallback PG tail)
  const head = await store.getLedgerHead(pointer);
  let prevHash = head.headHash;
  let seq = head.headSeq;

  if (seq === null || prevHash === null) {
    const tail = await pgStore.getLedgerTail(pointer);
    if (tail) {
      seq = tail.seq;
      prevHash = tail.eventHash;
    } else {
      seq = 0;
      prevHash = null;
    }
  }

  const nextSeq = (seq ?? 0) + 1;

  // 2) Compute event hash
  const eventHash = computeEventHash({
    pointer,
    seq: nextSeq,
    ts: evt.ts,
    prevHash,
    payload: evt,
  });

  // 3) Attach chain fields onto the event payload itself (optional but useful)
  const chainedEvt = { ...evt, pointer, seq: nextSeq, prevHash, eventHash };

  // 4) Redis hot-path append (keep as JSON)
  await store.appendLedger(pointer, JSON.stringify(chainedEvt));
  await store.setLedgerHead(pointer, eventHash, nextSeq);

  // 5) Postgres canonical archive append (hashed columns)
  await pgStore.appendLedgerHashed({
    ts: evt.ts,
    tenantId: evt.tenantId,
    actionId: evt.actionId,
    stableKey: evt.stableKey,
    pointer,
    eventType: evt.type,
    decisionId: (evt.type === "DECISION_ALLOWED" || evt.type === "DECISION_DENIED") ? evt.decisionId : null,
    payload: chainedEvt,
    seq: nextSeq,
    prevHash,
    eventHash,
  });

  // 6) Denial index dual-write stays the same (use chainedEvt fields if you want)
  if (evt.type === "DECISION_DENIED") {
    let kind = "DECIDE";
    if (evt.actionId.startsWith("PROMOTE/")) kind = "PROMOTE";
    if (evt.actionId === "NON_INTERFERENCE/CHECK") kind = "NON_INTERFERENCE";

    const denialEntry = {
      id: evt.decisionId,
      kind,
      ts: evt.ts,
      actionId: evt.actionId,
      stableKey: evt.stableKey,
      denialTrace: evt.denial,
      // optional proof:
      pointer,
      seq: nextSeq,
      eventHash,
    };

    await store.setDenial(evt.decisionId, JSON.stringify(denialEntry));
    await pgStore.setDenial({
      id: evt.decisionId,
      ts: evt.ts,
      kind,
      actionId: evt.actionId,
      stableKey: evt.stableKey,
      denialTrace: evt.denial,
    });
  }
}
// ---------- /api/canon/why-not/:id ----------
app.get("/api/canon/why-not/:id", async (req, res) => {
  const id = String(req.params.id || "").trim();
  if (!id) return res.status(400).json({ found: false, id, reason: "Missing id." });

  // Prefer Redis for speed
  const redisHit = await store.getDenial(id);
  if (redisHit) {
    const entry = JSON.parse(redisHit);
    const pointer = ledgerPointerFor(entry.stableKey);
    return res.status(200).json({
      found: true,
      id: entry.id,
      ts: entry.ts,
      kind: entry.kind,
      actionId: entry.actionId,
      denialTrace: entry.denialTrace,
      ledgerPointer: pointer,
      source: "redis",
    });
  }

  // Fallback to Postgres
  const pgHit = await pgStore.getDenial(id);
  if (pgHit) {
    const pointer = ledgerPointerFor(pgHit.stableKey);
    return res.status(200).json({
      found: true,
      id: pgHit.id,
      ts: pgHit.ts,
      kind: pgHit.kind,
      actionId: pgHit.actionId,
      denialTrace: pgHit.denialTrace,
      ledgerPointer: pointer,
      source: "postgres",
    });
  }

  return res.status(404).json({
    found: false,
    id,
    reason: "No denial trace found for this id.",
  });
});

// ---------- /api/canon/ledger/:pointer ----------
app.get("/api/canon/ledger/:pointer", async (req, res) => {
  const pointer = String(req.params.pointer || "").trim();
  if (!pointer) return res.status(400).json({ found: false, pointer, reason: "Missing pointer." });

  // Prefer Redis for speed
  const redisEvents = await store.getLedger(pointer);
  if (redisEvents && redisEvents.length > 0) {
    return res.status(200).json({
      found: true,
      pointer,
      events: redisEvents.map((s) => JSON.parse(s)),
      source: "redis",
    });
  }

  // Fallback to Postgres
  const pgEvents = await pgStore.getLedger(pointer);
  if (pgEvents && pgEvents.length > 0) {
    return res.status(200).json({
      found: true,
      pointer,
      events: pgEvents,
      source: "postgres",
    });
  }

  return res.status(404).json({ found: false, pointer, reason: "No ledger events found." });
});
function ledgerPointerFor(stableKey) {
  return `ledger_stub:${stableKey.slice(0, 16)}`;
}

// ---------- /api/canon/decide ----------
app.post("/api/canon/decide", async (req, res) => {
  const ts = new Date().toISOString();
  const headerIdem = req.header("Idempotency-Key") || req.header("idempotency-key");
  const bodyIdem = typeof req.body?.idempotencyKey === "string" ? req.body.idempotencyKey : undefined;
  const idempotencyKey = headerIdem || bodyIdem || "none";

  // Validate
  const parsed = CanonDecideRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "BAD_REQUEST",
      ts,
      details: parsed.error.flatten(),
    });
  }
  const r = parsed.data;
  const tenantId = r.context?.tenantId ?? "default";
  const actionId = r.actionId;
  const stableKey = buildStableDecisionKey({
    tenantId,
    actionId,
    idempotencyKey,
    intent: r.intent,
    canonRefs: r.canonRefs,
    context: r.context,
  });
  // Replay from cache if present
  const cached = decisionCache.get(stableKey);
  if (cached) {
    return res.status(200).json(cached);
  }
  // Hash the request for ledger trace
  const requestHash = sha256(JSON.stringify(req.body));
  // Ledger: requested
  await ledgerWrite({
    ts,
    type: "DECISION_REQUESTED",
    tenantId,
    actionId,
    stableKey,
    requestHash,
  });
  // Canon coverage gate
  const required = requiredCanonForAction(actionId);
  const provided = new Set(r.canonRefs.map((x) => x.id));
  const missing = required.filter((id) => !provided.has(id));
  const canonVersion = await getCanonVersion();
  if (missing.length > 0) {
    const whyNotId = `whynot_${stableKey.slice(0, 24)}`;
    const decisionId = sha256(`${stableKey}:DENY`);
    const deny = {
      decision: "DENY",
      decisionId,
      ts,
      actionId,
      denialTrace: {
        code: "CANON_COVERAGE_GATE",
        reason: "Required canon references missing for this action.",
        failedInvariant: "CANON.INV.CANON_COVERAGE_GATE",
        missingCanon: missing,
        minimalFix: missing.map((id) => `Add canonRef: ${id}`),
        whyNotId,
      },
    };
    await ledgerWrite({
      ts,
      type: "DECISION_DENIED",
      tenantId,
      actionId,
      decisionId,
      stableKey,
      denial: deny.denialTrace,
    });
    decisionCache.set(stableKey, deny);
    return res.status(200).json(deny);
  }
  // ALLOW
  const decisionId = sha256(`${stableKey}:ALLOW`);
  const allow = {
    decision: "ALLOW",
    decisionId,
    ts,
    actionId,
    proof: {
      canonVersion,
      evaluatedRefs: Array.from(provided).sort(),
      ledgerPointer: ledgerPointerFor(stableKey),
    },
  };
  await ledgerWrite({
    ts,
    type: "DECISION_ALLOWED",
    tenantId,
    actionId,
    decisionId,
    stableKey,
  });
  decisionCache.set(stableKey, allow);
  return res.status(200).json(allow);
});

// Build trigger endpoint (stub)
app.post('/api/build', (req, res) => {
  // In production, trigger CI/CD or build pipeline here
  res.json({ status: 'build triggered', ts: new Date().toISOString() });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connectivity
    await pool.query('SELECT 1');
    
    // Count ledger entries
    const result = await pool.query('SELECT COUNT(*) FROM "LedgerEntry"');
    const entryCount = parseInt(result.rows[0]?.count || '0', 10);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      ledgerEntries: entryCount,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Metrics endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    // Get total entries
    const totalResult = await pool.query('SELECT COUNT(*) FROM "LedgerEntry"');
    const totalEntries = parseInt(totalResult.rows[0]?.count || '0', 10);
    
    // Count allowed entries (where decision.allowed = true)
    const allowedResult = await pool.query(
      `SELECT COUNT(*) FROM "LedgerEntry" WHERE decision->>'allowed' = 'true'`
    );
    const allowedCount = parseInt(allowedResult.rows[0]?.count || '0', 10);
    
    const deniedCount = totalEntries - allowedCount;
    
    // Count agents
    const agentResult = await pool.query('SELECT COUNT(*) FROM "AgentState"');
    const agentCount = parseInt(agentResult.rows[0]?.count || '0', 10);
    
    // Get recent entries
    const recentResult = await pool.query(
      `SELECT id, "createdAt", hash FROM "LedgerEntry" ORDER BY "createdAt" DESC LIMIT 10`
    );
    const recentEntries = recentResult.rows.map(row => ({
      id: row.id,
      createdAt: row.createdAt,
      hash: row.hash,
    }));
    
    res.json({
      timestamp: new Date().toISOString(),
      ledger: {
        totalEntries,
        allowedCount,
        deniedCount,
        allowedPercentage: totalEntries > 0 ? (allowedCount / totalEntries) * 100 : 0,
      },
      agents: {
        totalAgents: agentCount,
      },
      recentActivity: recentEntries,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Ledger verification endpoint
app.get('/api/ledger/verify', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, intent, decision, hash FROM "LedgerEntry" ORDER BY "createdAt" ASC`
    );
    const entries = result.rows;
    
    if (entries.length === 0) {
      return res.json({
        valid: true,
        totalEntries: 0,
        message: 'No entries to verify',
      });
    }
    
    const crypto = await import('crypto');
    const invalidEntries: string[] = [];
    
    // Verify each entry's hash
    for (const entry of entries) {
      const payload = JSON.stringify({
        intent: entry.intent,
        decision: entry.decision,
      });
      const expectedHash = crypto
        .createHash('sha256')
        .update(payload)
        .digest('hex');
      
      if (expectedHash !== entry.hash) {
        invalidEntries.push(entry.id);
      }
    }
    
    const isValid = invalidEntries.length === 0;
    
    res.json({
      valid: isValid,
      totalEntries: entries.length,
      invalidEntries,
      message: isValid
        ? 'Ledger chain verified successfully'
        : `Found ${invalidEntries.length} invalid entries`,
    });
  } catch (error) {
    res.status(500).json({
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ---------- Canon Promotion Endpoint ----------
// POST /api/canon/promote
import { 
  validatePromoteRequest, 
  processPromoteRequest,
  type PromoteRequestBody,
  type PromoteResponseBody,
} from "./promote-canon.contract";

app.post("/api/canon/promote", async (req, res) => {
  try {
    // Validate request
    const validation = validatePromoteRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        ok: false,
        error: validation.error,
      });
    }
    
    const request = validation.request!;
    
    // Build canon store from Redis/Postgres
    const canonStore = new Map<string, any>();
    const canonItems = await pgStore.getAllCanon();
    for (const item of canonItems) {
      canonStore.set(item.id, item);
    }
    
    // Process promotion
    const response = await processPromoteRequest(request, canonStore);
    
    // Save to database if approved
    if (response.ok) {
      await pool.query(
        `INSERT INTO "CanonKnowledge" (id, "itemId", level, kind, title, statement, "promotedAt", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         ON CONFLICT ("itemId") DO UPDATE SET level = $3, "promotedAt" = $7, "updatedAt" = NOW()`,
        [
          `canon_${Date.now()}`,
          request.itemId,
          response.decision.to,
          "PROMOTED",
          `Promoted ${request.itemId}`,
          response.decision.reason,
          response.decision.ts,
        ]
      );
    }
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ---------- WhyNot Panel Endpoint ----------
// GET /api/canon/whynot/:actionId
import { formatWhyNotPanel, type WhyNotPanelData } from "./whynot-panel";

app.get("/api/canon/whynot/:actionId", async (req, res) => {
  try {
    const actionId = req.params.actionId;
    
    // Look up denial in database
    const result = await pool.query(
      `SELECT * FROM "DeniedDecision" WHERE "actionId" = $1 ORDER BY "createdAt" DESC LIMIT 1`,
      [actionId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "No denial found for this action",
      });
    }
    
    const denial = result.rows[0];
    
    // Convert to WhyNotTrace format
    const trace = {
      ts: denial.createdAt.toISOString(),
      actionId: denial.actionId,
      denied: true,
      reasonCodes: denial.reasonCodes,
      missingCanonIds: denial.missingCanonIds,
      violatedInvariantIds: denial.violatedInvariantIds,
      requiredCanonRefs: denial.requiredCanonRefs,
      message: denial.message,
      context: denial.context,
    };
    
    // Format for panel display
    const panelData = formatWhyNotPanel(trace);
    
    res.json({
      ok: true,
      panel: panelData,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ---------- Execution Context Endpoint ----------
// POST /api/canon/execution/context
import { createExecutionContext, type ExecutionContext } from "../src/canon/execution";

app.post("/api/canon/execution/context", async (req, res) => {
  try {
    const { executionId, tenantId, actorId, canonRefsSnapshot, constraintsSnapshot, environment } = req.body;
    
    if (!executionId || !tenantId || !actorId) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: executionId, tenantId, actorId",
      });
    }
    
    const context = createExecutionContext({
      executionId,
      timestamp: new Date().toISOString(),
      tenantId,
      actorId,
      canonRefsSnapshot: canonRefsSnapshot || [],
      constraintsSnapshot: constraintsSnapshot || [],
      environment,
    });
    
    // Save to database
    await pool.query(
      `UPDATE "Execution" SET "executionContextHash" = $1 WHERE id = $2`,
      [context.contextHash, executionId]
    );
    
    res.json({
      ok: true,
      context,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ---------- Token Streaming Endpoint ----------
// POST /api/canon/execution/stream
import { bufferTokensWithProof, verifyTokenStreamProof, type TokenStreamProof } from "../src/canon/execution";

app.post("/api/canon/execution/stream", async (req, res) => {
  try {
    const { executionId, streamId, tokens } = req.body;
    
    if (!executionId || !streamId || !Array.isArray(tokens)) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: executionId, streamId, tokens (array)",
      });
    }
    
    // Get current ledger state for proof
    const ledgerResult = await pool.query(
      `SELECT * FROM "LedgerEntry" ORDER BY "createdAt" DESC LIMIT 10`
    );
    const ledgerState = ledgerResult.rows;
    
    // Create proof
    const proof = bufferTokensWithProof({
      executionId,
      streamId,
      tokens,
      ledgerState,
      authCheck: (tokens, state) => {
        // Simple auth check: ensure ledger has entries
        return state.length > 0;
      },
      timestamp: new Date().toISOString(),
    });
    
    // Save buffered tokens to execution
    await pool.query(
      `UPDATE "Execution" SET "tokenBuffer" = $1 WHERE id = $2`,
      [JSON.stringify(proof), executionId]
    );
    
    res.json({
      ok: true,
      proof,
      approved: proof.approved,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ---------- Chat Seal/Finalize Endpoints ----------
// POST /api/chat/seal
import { sealChatItem, finalizeChatItem } from "../src/canon/execution";

app.post("/api/chat/seal", async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    
    if (!itemId || !itemType || !["thread", "message"].includes(itemType)) {
      return res.status(400).json({
        ok: false,
        error: "Missing or invalid fields: itemId, itemType (thread or message)",
      });
    }
    
    const timestamp = new Date().toISOString();
    const sealed = sealChatItem({ itemId, timestamp });
    
    // Update database
    const table = itemType === "thread" ? "ChatThread" : "ChatMessage";
    await pool.query(
      `UPDATE "${table}" SET "sealedAt" = $1 WHERE id = $2`,
      [sealed.sealedAt, itemId]
    );
    
    res.json({
      ok: true,
      itemId,
      sealedAt: sealed.sealedAt,
      hash: sealed.hash,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// POST /api/chat/finalize
app.post("/api/chat/finalize", async (req, res) => {
  try {
    const { itemId, itemType, canonRefs } = req.body;
    
    if (!itemId || !itemType || !["thread", "message"].includes(itemType)) {
      return res.status(400).json({
        ok: false,
        error: "Missing or invalid fields: itemId, itemType (thread or message)",
      });
    }
    
    // Get current seal time
    const table = itemType === "thread" ? "ChatThread" : "ChatMessage";
    const result = await pool.query(
      `SELECT "sealedAt" FROM "${table}" WHERE id = $1`,
      [itemId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Item not found",
      });
    }
    
    const sealedAt = result.rows[0].sealedAt;
    if (!sealedAt) {
      return res.status(400).json({
        ok: false,
        error: "Item must be sealed before finalization",
      });
    }
    
    const timestamp = new Date().toISOString();
    const finalized = finalizeChatItem({
      itemId,
      sealedAt,
      timestamp,
      canonRefs: canonRefs || [],
    });
    
    if (!finalized.finalized) {
      return res.status(400).json({
        ok: false,
        error: finalized.reason,
      });
    }
    
    // Update database
    await pool.query(
      `UPDATE "${table}" SET finalized = true WHERE id = $1`,
      [itemId]
    );
    
    res.json({
      ok: true,
      itemId,
      finalized: true,
      hash: finalized.hash,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Bickford Canon API server running on port ${PORT}`);
});
