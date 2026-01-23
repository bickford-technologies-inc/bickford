import crypto from "node:crypto";
import { appendDailyArchive, readLatestDailyArchiveEntry } from "./archive";
import { ENVIRONMENT_AGENT } from "./agent";

export type ExecuteIntentPayload = {
  intent: string;
  origin?: string;
  source?: string;
  sessionId?: string;
  transcript?: string;
  metadata?: Record<string, unknown>;
  startedAtMs?: number;
  configOverrides?: Record<string, unknown>;
};

export type ExecuteIntentResult = {
  decision: {
    outcome: "ALLOW";
    allowed: true;
    canonId: string;
    rationale: string;
    timestamp: string;
  };
  ledgerEntry: {
    id: string;
    intent: {
      origin: string;
      intent: string;
      source?: string;
      sessionId?: string;
      transcript?: string;
    };
    context?: {
      metadata?: Record<string, unknown>;
    };
    related: {
      configurationId: string;
      knowledgeId: string;
      performanceId: string;
    };
    decision: ExecuteIntentResult["decision"];
    hash: string;
    createdAt: string;
  };
  knowledge: {
    entryId: string;
  };
  performance: {
    entryId: string;
    durationMs: number;
    peakDurationMs: number;
  };
  configuration: {
    entryId: string;
    fingerprint: string;
  };
};

type ConfigurationEntry = {
  entryId: string;
  agent: string;
  recordedAt: string;
  scope: string;
  fingerprint: string;
  overrides?: Record<string, unknown>;
  source?: string;
  sessionId?: string;
};

type PerformanceEntry = {
  durationMs: number;
  peakDurationMs: number;
};

export async function executeIntent(
  payload: ExecuteIntentPayload,
): Promise<ExecuteIntentResult> {
  const startedAtMs = payload.startedAtMs ?? Date.now();
  const now = new Date();
  const timestamp = now.toISOString();
  const origin = payload.origin ?? ENVIRONMENT_AGENT;
  const durationMs = Math.max(0, Date.now() - startedAtMs);
  const configurationEntryId = crypto.randomUUID();
  const knowledgeEntryId = crypto.randomUUID();
  const performanceEntryId = crypto.randomUUID();

  const decision = {
    outcome: "ALLOW",
    allowed: true,
    canonId: "CANON-EXECUTE",
    rationale: "Intent accepted for execution.",
    timestamp,
  } as const;

  const ledgerEntry = {
    id: crypto.randomUUID(),
    intent: {
      origin,
      intent: payload.intent,
      source: payload.source,
      sessionId: payload.sessionId,
      transcript: payload.transcript,
    },
    context: payload.metadata ? { metadata: payload.metadata } : undefined,
    related: {
      configurationId: configurationEntryId,
      knowledgeId: knowledgeEntryId,
      performanceId: performanceEntryId,
    },
    decision,
    hash: "",
    createdAt: timestamp,
  };

  ledgerEntry.hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(ledgerEntry))
    .digest("hex");

  const configuration = {
    entryId: configurationEntryId,
    agent: ENVIRONMENT_AGENT,
    recordedAt: timestamp,
    scope: "execution",
    fingerprint: ledgerEntry.hash.slice(0, 16),
    overrides: payload.configOverrides,
    source: payload.source,
    sessionId: payload.sessionId,
  } satisfies ConfigurationEntry;

  await appendDailyArchive("execute", {
    agent: ENVIRONMENT_AGENT,
    receivedAt: timestamp,
    payload,
    decision,
    ledgerEntry,
    configuration,
  });
  await appendDailyArchive("ledger", ledgerEntry);
  const knowledgeEntry = {
    entryId: knowledgeEntryId,
    agent: ENVIRONMENT_AGENT,
    recordedAt: timestamp,
    intent: payload.intent,
    transcript: payload.transcript,
    source: payload.source,
    sessionId: payload.sessionId,
    metadata: payload.metadata,
    decision,
    ledgerEntryId: ledgerEntry.id,
  };
  await appendDailyArchive("knowledge", knowledgeEntry);

  const latestPerformance = await readLatestDailyArchiveEntry<PerformanceEntry>(
    "performance",
  );
  const previousPeak = latestPerformance?.peakDurationMs ?? 0;
  const performanceEntry = {
    entryId: performanceEntryId,
    agent: ENVIRONMENT_AGENT,
    recordedAt: timestamp,
    intent: payload.intent,
    source: payload.source,
    sessionId: payload.sessionId,
    durationMs,
    peakDurationMs: Math.max(previousPeak, durationMs),
    ledgerEntryId: ledgerEntry.id,
  };
  await appendDailyArchive("performance", performanceEntry);
  await appendDailyArchive("configuration", configuration);

  return {
    decision,
    ledgerEntry,
    knowledge: { entryId: knowledgeEntry.entryId },
    performance: {
      entryId: performanceEntry.entryId,
      durationMs: performanceEntry.durationMs,
      peakDurationMs: performanceEntry.peakDurationMs,
    },
    configuration: {
      entryId: configuration.entryId,
      fingerprint: configuration.fingerprint,
    },
  };
}
