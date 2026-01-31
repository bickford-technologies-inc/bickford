import type { NextApiRequest, NextApiResponse } from "next";

const DECISIONS_PATH = process.cwd() + "/datalake/silver/decisions/decisions.jsonl";

interface Decision {
  decision: string;
  timestamp: number;
  authority: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { decision, timestamp, authority } = req.body || {};
    if (!decision || !timestamp || !authority) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const entry: Decision = { decision, timestamp, authority };
    const line = JSON.stringify(entry) + "\n";

    try {
      await Bun.write(DECISIONS_PATH, line, { createPath: true });
      return res.status(200).json({ ok: true });
    } catch (err) {
      const error = err as Error;
      console.error("Failed to write decision:", error);
      return res.status(500).json({ error: "Failed to write decision" });
    }
  }

  if (req.method === "GET") {
    try {
      const file = Bun.file(DECISIONS_PATH);
      const data = await file.text();
      const decisions = data
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          try {
            return JSON.parse(line) as Decision;
          } catch {
            return null;
          }
        })
        .filter((dec): dec is Decision => dec !== null);

      return res.status(200).json({ decisions });
    } catch {
      return res.status(200).json({ decisions: [] });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
