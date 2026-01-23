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
    event: {
      id: db.id,
      timestamp: db.createdAt,
    },
    // intent, decision, etc. can be added if LedgerEntry is extended
  };
}
