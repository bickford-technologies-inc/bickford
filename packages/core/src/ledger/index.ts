import crypto from "crypto";
import {
  Intent,
  LedgerEntry as LedgerType,
  Decision,
  LedgerRow,
} from "@bickford/types";
import { getPrismaClient } from "./db";
import { toLegacyIntent, toLegacyDecision } from "../adapters/legacy";

// Re-export getPrismaClient for external consumers
export { getPrismaClient } from "./db";

// Re-export getPrismaClient for external consumers
export { getPrismaClient } from "./db";

export async function appendLedger(
  intent: Intent,
  decision: Decision
): Promise<LedgerType> {
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

export async function getLedger(): Promise<LedgerType[]> {
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
