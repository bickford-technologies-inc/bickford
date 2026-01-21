import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function appendDailyArchive(prefix: string, entry: unknown) {
  const now = new Date();
  const archiveDir = path.join(process.cwd(), "trace");
  await mkdir(archiveDir, { recursive: true });
  const fileName = `${prefix}-${formatLocalDate(now)}.jsonl`;
  const filePath = path.join(archiveDir, fileName);
  await appendFile(filePath, `${JSON.stringify(entry)}\n`);
}
