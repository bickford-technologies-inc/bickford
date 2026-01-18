import * as fs from "fs/promises";
import * as path from "path";

const LEDGER_ROOT = path.join(process.cwd(), ".ledger");

async function ensureRoot() {
  await fs.mkdir(LEDGER_ROOT, { recursive: true });
}

export async function readThread(threadId: string) {
  await ensureRoot();
  const file = path.join(LEDGER_ROOT, `${threadId}.json`);
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function appendEvent(threadId: string, event: unknown) {
  await ensureRoot();
  const file = path.join(LEDGER_ROOT, `${threadId}.json`);
  const existing = await readThread(threadId);
  existing.push({
    ts: Date.now(),
    event,
  });
  await fs.writeFile(file, JSON.stringify(existing, null, 2));
}
