import { LedgerEntry } from "@bickford/types";
import { Intent, Decision } from "./types";

type DbRow = {
  id: string;
  tenantId?: string;
  threadId: string;
  role: "user" | "assistant" | "system";
  content: string;
  intent?: Intent;
  decision?: Decision;
  hash: string;
  createdAt: string;
};

export function toLedgerEntry(db: DbRow): LedgerEntry {
  return {
    id: db.id,
    threadId: db.threadId,
    role: db.role,
    content: db.content,
    ts: Date.parse(db.createdAt),

    intent: db.intent,
    decision: db.decision,
  };
}
