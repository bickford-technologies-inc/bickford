import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

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

async function walk(
  dir: string,
  rel = "",
): Promise<{ file: string; type: string; hash: string }[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let files: { file: string; type: string; hash: string }[] = [];
  for (const entry of entries) {
    if (BLOCKED.some((b) => entry.name === b || entry.name.startsWith(b)))
      continue;
    const full = path.join(dir, entry.name);
    const relative = path.join(rel, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await walk(full, relative));
    } else {
      let type = "text";
      if (entry.name.endsWith(".md")) type = "markdown";
      else if (entry.name.endsWith(".json")) type = "json";
      else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))
        type = "typescript";
      else if (entry.name.endsWith(".js")) type = "javascript";
      const content = await fs.readFile(full);
      const hash = crypto.createHash("sha256").update(content).digest("hex");
      files.push({ file: relative, type, hash });
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
    res.status(500).json({ error: "Failed to enumerate repo files." });
  }
}
