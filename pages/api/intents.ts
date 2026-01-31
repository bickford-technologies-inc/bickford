import type { NextApiRequest, NextApiResponse } from "next";

const INTENTS_PATH = process.cwd() + "/datalake/silver/intents/intents.jsonl";

interface Intent {
  intent: string;
  timestamp: number;
  actor: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { intent, timestamp, actor } = req.body || {};
    if (!intent || !timestamp || !actor) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const entry: Intent = { intent, timestamp, actor };
    const line = JSON.stringify(entry) + "\n";

    try {
      await Bun.write(INTENTS_PATH, line, { createPath: true });
      return res.status(200).json({ ok: true });
    } catch (err) {
      const error = err as Error;
      console.error("Failed to write intent:", error);
      return res.status(500).json({ error: "Failed to write intent" });
    }
  }

  if (req.method === "GET") {
    try {
      const file = Bun.file(INTENTS_PATH);
      const data = await file.text();
      const intents = data
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          try {
            return JSON.parse(line) as Intent;
          } catch {
            return null;
          }
        })
        .filter((int): int is Intent => int !== null);

      return res.status(200).json({ intents });
    } catch {
      return res.status(200).json({ intents: [] });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
