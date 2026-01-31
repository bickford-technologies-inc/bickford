// API route with explicit types for Next.js
import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";

const DOCS_DIR = path.join(process.cwd(), "docs/technical");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const files = await fs.readdir(DOCS_DIR);
    const mdFiles = files.filter((f) => /^[a-zA-Z0-9_.-]+\.md$/.test(f));
    const docs: Record<string, string> = {};
    for (const file of mdFiles) {
      const filePath = path.join(DOCS_DIR, file);
      const content = await fs.readFile(filePath, "utf-8");
      docs[file] = content;
    }
    res.status(200).json({ docs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
