import * as path from "node:path";
import { promises as fs } from "fs";

const LEDGER_ROOT = path.join(process.cwd(), ".ledger");

export async function writeThread(id: string, data: unknown) {
  await fs.writeFile(LEDGER_ROOT + "/.bunkeep", ""); // ensure dir exists by writing a dummy file
  await fs.writeFile(
    path.join(LEDGER_ROOT, `${id}.json`),
    JSON.stringify(data, null, 2),
  );
}

export async function listThreads(): Promise<string[]> {
  try {
    await fs
      .access(LEDGER_ROOT)
      .catch(() => fs.writeFile(LEDGER_ROOT + "/.bunkeep", ""));
    return await fs.readdir(LEDGER_ROOT);
  } catch {
    return [];
  }
}
