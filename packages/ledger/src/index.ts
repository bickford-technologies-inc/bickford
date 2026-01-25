import * as path from "node:path";
import * as crypto from "node:crypto";

const { file: BunFile, write: BunWrite } = Bun;

const ROOT = path.resolve(process.cwd(), ".bickford-ledger");

// Ensure the directory exists by writing a dummy file
await BunWrite(ROOT + "/.bunkeep", "");

export interface LedgerEntry {
  id: string;
  timestamp: string;
  status: "LOCKED" | "REFUSED";
  payload: unknown;
}

export async function persist(entry: Omit<LedgerEntry, "id" | "timestamp">) {
  const id = crypto.randomUUID();
  const record: LedgerEntry = {
    id,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  const file = path.join(ROOT, `${record.timestamp}-${id}.json`);
  await BunWrite(file, JSON.stringify(record, null, 2));
  return record;
}

export async function readAll(): Promise<LedgerEntry[]> {
  try {
    const bunFile = BunFile(ROOT);
    if (!(await bunFile.exists())) return [];
    const files = (await bunFile.dir()).sort();
    const entries = [];
    for (const f of files) {
      const entryFile = BunFile(path.join(ROOT, f));
      if (await entryFile.exists()) {
        const content = await entryFile.text();
        entries.push(JSON.parse(content));
      }
    }
    return entries;
  } catch {
    return [];
  }
}

export { appendProofLedger, readProofLedger } from "./proofLedger.js";
export { appendLedger, listThreads, writeThread } from "./ledger.js";
export * from "./types.js";
export * from "./conversationStore.js";
export * from "./conversationMemory.js";
