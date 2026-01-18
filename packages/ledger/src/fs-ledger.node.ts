import fs from "fs/promises";
import path from "path";

const LEDGER_ROOT = path.join(process.cwd(), ".ledger");

export async function writeThread(id: string, data: unknown) {
  await fs.mkdir(LEDGER_ROOT, { recursive: true });
  await fs.writeFile(
    path.join(LEDGER_ROOT, `${id}.json`),
    JSON.stringify(data, null, 2),
    "utf8",
  );
}

export async function listThreads(): Promise<string[]> {
  try {
    return await fs.readdir(LEDGER_ROOT);
  } catch {
    return [];
  }
}
