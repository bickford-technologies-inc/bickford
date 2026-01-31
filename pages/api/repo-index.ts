import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

const REPO_ROOT = process.cwd();
const BLOCKED = [
  "node_modules",
  ".git",
  ".next",
  ".turbo",
  ".vscode",
  ".DS_Store",
  "out",
  "dist",
  "coverage",
  ".nyc_output",
  ".env",
  ".env.local",
  ".env.example",
  ".env.*.example",
];

interface RepoFile {
  file: string;
  type: string;
  hash: string;
}

function getFileType(filename: string): string {
  if (filename.endsWith(".md")) return "markdown";
  if (filename.endsWith(".json")) return "json";
  if (filename.endsWith(".ts") || filename.endsWith(".tsx")) return "typescript";
  if (filename.endsWith(".js")) return "javascript";
  return "text";
}

async function walk(dir: string, rel = ""): Promise<RepoFile[]> {
  const entries = await Array.fromAsync(
    new Bun.Glob("**/*").scan({ cwd: dir, onlyFiles: false })
  );

  const files: RepoFile[] = [];

  for (const entry of entries) {
    const name = entry.split("/").pop() || "";
    if (BLOCKED.some((b) => name === b || name.startsWith(b))) continue;

    const fullPath = `${dir}/${entry}`;
    const file = Bun.file(fullPath);

    if (await file.exists()) {
      const stat = await file.stat();
      if (stat.isDirectory()) continue;

      const content = await file.arrayBuffer();
      const hash = crypto
        .createHash("sha256")
        .update(Buffer.from(content))
        .digest("hex");

      const relativePath = rel ? `${rel}/${entry}` : entry;
      files.push({
        file: relativePath,
        type: getFileType(name),
        hash,
      });
    }
  }

  return files;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const files = await walk(REPO_ROOT);
    res.status(200).json({ files });
  } catch (err) {
    const error = err as Error;
    console.error("Failed to enumerate repo files:", error);
    res.status(500).json({ error: "Failed to enumerate repo files." });
  }
}
