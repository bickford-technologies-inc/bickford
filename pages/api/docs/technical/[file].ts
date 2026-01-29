import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const DOCS_DIR = path.join(process.cwd(), "docs/technical");

function isValidFilename(filename: string): boolean {
  // Only allow alphanumeric, dash, underscore, dot, and .md extension
  return /^[a-zA-Z0-9_.-]+\.md$/.test(filename);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { file } = req.query;
  if (!file || typeof file !== "string" || !isValidFilename(file)) {
    return res.status(400).json({ error: "Invalid filename." });
  }
  const filePath = path.join(DOCS_DIR, file);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const hash = crypto.createHash("sha256").update(content).digest("hex");
    res.status(200).json({ file, content, hash });
  } catch (err) {
    res.status(404).json({ error: "File not found." });
  }
}
