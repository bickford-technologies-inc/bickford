import crypto from "crypto";
import {
  Intent,
  LedgerEntry as LedgerType,
  Decision,
  LedgerRow,
} from "@bickford/types";
import { prisma } from "./db";

export async function appendLedger(
  intent: Intent,
  decision: Decision
): Promise<LedgerType> {
  const payload = JSON.stringify({ intent, decision });
  const hash = crypto.createHash("sha256").update(payload).digest("hex");

  const entry = await prisma.ledgerEntry.create({
    data: {
      id: crypto.randomUUID(),
      intent,
      decision,
      hash,
    },
  });

  return {
    id: entry.id,
    intent,
    decision,
    hash: entry.hash,
    createdAt: entry.createdAt.toISOString(),
  };
}

export async function getLedger(): Promise<LedgerType[]> {
  const rows = await prisma.ledgerEntry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r: LedgerRow) => ({
    id: r.id,
    intent: r.intent as any,
    decision: r.decision as any,
    hash: r.hash,
    createdAt: r.createdAt.toISOString(),
  }));
}
