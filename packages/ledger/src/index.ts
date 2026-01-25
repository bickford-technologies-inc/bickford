import * as path from "node:path";
import * as crypto from "node:crypto";
import { promises as fs } from "fs";

const ROOT = path.resolve(process.cwd(), ".bickford-ledger");

// Ensure the directory exists by writing a dummy file
await fs.writeFile(ROOT + "/.bunkeep", "");

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
  await fs.writeFile(file, JSON.stringify(record, null, 2));
  return record;
}

export async function readAll(): Promise<LedgerEntry[]> {
  try {
    await fs.access(ROOT).catch(() => fs.writeFile(ROOT + "/.bunkeep", ""));
    const files = (await fs.readdir(ROOT)).sort();
    const entries = [];
    for (const f of files) {
      try {
        const content = await fs.readFile(path.join(ROOT, f), "utf8");
        entries.push(JSON.parse(content));
      } catch {}
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
export * from "./conversationCompressionHandler.js";
