import { promises as fs } from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";

const INTENTS_PATH = path.join(
  process.cwd(),
  "datalake/silver/intents/intents.jsonl",
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { intent, timestamp, actor } = req.body || {};
    if (!intent || !timestamp || !actor) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const entry = JSON.stringify({ intent, timestamp, actor }) + "\n";
    await fs.mkdir(path.dirname(INTENTS_PATH), { recursive: true });
    await fs.appendFile(INTENTS_PATH, entry, "utf-8");
    return res.status(200).json({ ok: true });
  }
  if (req.method === "GET") {
    try {
      const data = await fs.readFile(INTENTS_PATH, "utf-8");
      const intents = data
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
      return res.status(200).json({ intents });
    } catch {
      return res.status(200).json({ intents: [] });
    }
  }
  res.status(405).json({ error: "Method not allowed" });
}
