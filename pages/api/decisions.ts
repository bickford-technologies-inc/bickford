import { promises as fs } from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";

const DECISIONS_PATH = path.join(
  process.cwd(),
  "datalake/silver/decisions/decisions.jsonl",
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { decision, timestamp, authority } = req.body || {};
    if (!decision || !timestamp || !authority) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const entry = JSON.stringify({ decision, timestamp, authority }) + "\n";
    await fs.mkdir(path.dirname(DECISIONS_PATH), { recursive: true });
    await fs.appendFile(DECISIONS_PATH, entry, "utf-8");
    return res.status(200).json({ ok: true });
  }
  if (req.method === "GET") {
    try {
      const data = await fs.readFile(DECISIONS_PATH, "utf-8");
      const decisions = data
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      return res.status(200).json({ decisions });
    } catch {
      return res.status(200).json({ decisions: [] });
    }
  }
  res.status(405).json({ error: "Method not allowed" });
}
