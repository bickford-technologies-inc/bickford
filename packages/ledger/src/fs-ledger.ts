// Bun-native file APIs
const { file: BunFile, write: BunWrite } = Bun;
import * as path from "node:path";

const LEDGER_ROOT = path.join(process.cwd(), ".ledger");

async function ensureRoot() {
  await BunWrite(LEDGER_ROOT + "/.bunkeep", ""); // ensure dir exists by writing a dummy file
}

export async function readThread(threadId: string) {
  await ensureRoot();
  const file = path.join(LEDGER_ROOT, `${threadId}.json`);
  try {
    const bunFile = BunFile(file);
    if (!(await bunFile.exists())) {
      return [];
    }
    const raw = await bunFile.text();
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
  await BunWrite(file, JSON.stringify(existing, null, 2));
}
