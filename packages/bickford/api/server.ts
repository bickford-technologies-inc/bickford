// ---------- /api/canon/ledger/recent ----------
import { requireScopes } from "./security/auth";
import { requireTenantHeader } from "./security/tenant";
import { metricsMiddleware } from "./ops/metrics";

app.get(
  "/api/canon/ledger/recent",
  requireScopes(["canon.read"]),
  requireTenantHeader,
  metricsMiddleware("ledger_recent"),
  async (req, res) => {
    const ts = new Date().toISOString();
    try {
      const tenantId = req.caller?.tenantId;
      if (!tenantId) {
        return res.status(400).json({
          ok: false,
          ts,
          error: "missing tenantId (X-Tenant-Id)",
        });
      }
      const raw = String(req.query.limit ?? "50");
      const limit = Math.max(1, Math.min(parseInt(raw, 10) || 50, 200));
      let events = await store.getRecentLedgerEvents(tenantId, limit);
      if (!events?.length) {
        events = await pgStore.getRecentLedgerEvents(tenantId, limit);
      }
      const items = (events || []).map((e) => ({
        pointer: e.pointer,
        ts: e.ts,
        type: e.type,
        actionId: e.actionId,
        decisionId: e.decisionId,
      }));
      return res.status(200).json({
        ok: true,
        ts,
        tenantId,
        limit,
        items,
      });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        ts,
        error: err?.message || "recent ledger error",
      });
    }
  }
);

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

  // 4b) Update Redis recent ledger list (for real-time feeds)
  if (typeof store.putLedgerEvent === 'function') {
    try {
      await store.putLedgerEvent(chainedEvt);
    } catch (e) {
      console.warn('[LEDGER] putLedgerEvent failed', e);
    }
  }

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Bickford Canon API server running on port ${PORT}`);
});
