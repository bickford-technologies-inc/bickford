import { existsSync } from "node:fs";
import { appendFile, mkdir, open } from "node:fs/promises";
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

  const lastLine = await readLastNonEmptyLine(filePath);
  if (!lastLine) {
    return null;
  }

  try {
    return JSON.parse(lastLine) as T;
  } catch (error) {
    console.error("Failed to parse archive entry", error);
    return null;
  }
}

async function readLastNonEmptyLine(filePath: string): Promise<string | null> {
  const fileHandle = await open(filePath, "r");
  try {
    const { size } = await fileHandle.stat();
    if (size === 0) {
      return null;
    }

    const chunkSize = 64 * 1024;
    let position = size;
    let buffer = "";

    while (position > 0) {
      const readSize = Math.min(chunkSize, position);
      position -= readSize;
      const readBuffer = Buffer.alloc(readSize);
      const { bytesRead } = await fileHandle.read(
        readBuffer,
        0,
        readSize,
        position,
      );
      buffer = readBuffer.toString("utf8", 0, bytesRead) + buffer;

      if (buffer.includes("\n")) {
        const parts = buffer.split(/\r?\n/);
        for (let i = parts.length - 1; i >= 0; i -= 1) {
          if (parts[i].length > 0) {
            return parts[i];
          }
        }
        return null;
      }
    }

    return buffer.length > 0 ? buffer : null;
  } finally {
    await fileHandle.close();
  }
}
