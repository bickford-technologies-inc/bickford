import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";

const ROOT = path.resolve(process.cwd(), ".bickford-ledger");
if (!fs.existsSync(ROOT)) fs.mkdirSync(ROOT, { recursive: true });

export interface LedgerEntry {
  id: string;
  timestamp: string;
  status: "LOCKED" | "REFUSED";
  payload: unknown;
}

export function persist(entry: Omit<LedgerEntry, "id" | "timestamp">) {
  const id = crypto.randomUUID();
  const record: LedgerEntry = {
    id,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  const file = path.join(ROOT, `${record.timestamp}-${id}.json`);
  fs.writeFileSync(file, JSON.stringify(record, null, 2));
  return record;
}

export function readAll(): LedgerEntry[] {
  if (!fs.existsSync(ROOT)) return [];
  return fs
    .readdirSync(ROOT)
    .sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8")));
}

export { appendProofLedger, readProofLedger } from "./proofLedger.js";
export { appendLedger, listThreads, writeThread } from "./ledger.js";
export * from "./types.js";
export * from "./conversationStore.js";
export * from "./conversationMemory.js";
export {
  appendConversationMessage,
  createConversation,
  listConversationSummaries,
  readConversation,
  writeConversation,
} from "./conversationStore.js";
