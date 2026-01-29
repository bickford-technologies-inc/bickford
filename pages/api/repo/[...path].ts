import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";
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

function isSafePath(requested: string[]): boolean {
  return !requested.some((segment) =>
    BLOCKED.some((b) => segment === b || segment.startsWith(b)),
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { path: reqPath } = req.query;
  if (!reqPath || !Array.isArray(reqPath) || !isSafePath(reqPath)) {
    return res.status(400).json({ error: "Invalid or blocked path." });
  }
  const filePath = path.join(REPO_ROOT, ...reqPath);
  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      const files = await fs.readdir(filePath);
      return res.status(200).json({ type: "directory", files });
    }
    const content = await fs.readFile(filePath);
    const hash = crypto.createHash("sha256").update(content).digest("hex");
    let type = "text";
    if (filePath.endsWith(".md")) type = "markdown";
    else if (filePath.endsWith(".json")) type = "json";
    else if (filePath.endsWith(".ts") || filePath.endsWith(".tsx"))
      type = "typescript";
    else if (filePath.endsWith(".js")) type = "javascript";
    res
      .status(200)
      .json({
        type,
        file: reqPath.join("/"),
        content: content.toString("utf-8"),
        hash,
      });
  } catch (err) {
    res.status(404).json({ error: "File or directory not found." });
  }
}
