import { existsSync } from "node:fs";
import { appendFile, mkdir, readFile } from "node:fs/promises";
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

export async function readLatestDailyArchiveEntry<T>(
  prefix: string,
): Promise<T | null> {
  const now = new Date();
  const archiveDir = path.join(process.cwd(), "trace");
  const fileName = `${prefix}-${formatLocalDate(now)}.jsonl`;
  const filePath = path.join(archiveDir, fileName);

  if (!existsSync(filePath)) {
    return null;
  }

  const contents = await readFile(filePath, "utf-8");
  const lines = contents.trim().split("\n").filter(Boolean);
  if (lines.length === 0) {
    return null;
  }

  try {
    return JSON.parse(lines[lines.length - 1]) as T;
  } catch (error) {
    console.error("Failed to parse archive entry", error);
    return null;
  }
}
