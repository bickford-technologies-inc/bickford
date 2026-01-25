import * as path from "node:path";
const { file: BunFile, write: BunWrite } = Bun;

const LEDGER_ROOT = path.join(process.cwd(), ".ledger");

export async function writeThread(id: string, data: unknown) {
  await BunWrite(LEDGER_ROOT + "/.bunkeep", ""); // ensure dir exists by writing a dummy file
  await BunWrite(
    path.join(LEDGER_ROOT, `${id}.json`),
    JSON.stringify(data, null, 2),
  );
}

export async function listThreads(): Promise<string[]> {
  try {
    const bunFile = BunFile(LEDGER_ROOT);
    if (!(await bunFile.exists())) return [];
    return await bunFile.dir();
  } catch {
    return [];
  }
}
