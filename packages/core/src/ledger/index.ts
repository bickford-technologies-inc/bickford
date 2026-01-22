import crypto from "node:crypto";
import { Intent, Decision } from "@bickford/types";
import { getPrismaClient } from "./db.js";
import { toLegacyIntent, toLegacyDecision } from "../adapters/legacy.js";

// Re-export getPrismaClient for external consumers
export { getPrismaClient } from "./db.js";

type LedgerRecord = {
  id: string;
  intent: Intent;
  decision: Decision;
  hash: string;
  createdAt: string;
  tenantId?: string;
};

export async function appendLedger(
  intent: Intent,
  decision: Decision,
): Promise<LedgerRecord> {
  const payload = JSON.stringify({ intent, decision });
  const hash = crypto.createHash("sha256").update(payload).digest("hex");

  const entry = await getPrismaClient().ledgerEntry.create({
    data: {
      id: crypto.randomUUID(),
      intent: toLegacyIntent(intent),
      decision: toLegacyDecision(decision),
      hash,
    },
  });

  return {
    id: entry.id,
    intent: entry.intent as unknown as Intent,
    decision: entry.decision as unknown as Decision,
    hash: entry.hash,
    createdAt: entry.createdAt.toISOString(),
  };
}

export async function getLedger(): Promise<LedgerRecord[]> {
  const rows = await getPrismaClient().ledgerEntry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r: any) => ({
    id: r.id,
    intent: (r.intent ?? {}) as Intent,
    decision: (r.decision ?? {}) as Decision,
    hash: r.hash,
    createdAt: r.createdAt.toISOString(),
    tenantId: r.tenantId ?? undefined,
  }));
}
