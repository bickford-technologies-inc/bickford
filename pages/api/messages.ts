import { promises as fs } from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";

const MESSAGES_PATH = path.join(
  process.cwd(),
  "datalake/bronze/messages/messages.jsonl",
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { author, content, timestamp } = req.body || {};
    if (!author || !content || !timestamp) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const entry = JSON.stringify({ author, content, timestamp }) + "\n";
    await fs.mkdir(path.dirname(MESSAGES_PATH), { recursive: true });
    await fs.appendFile(MESSAGES_PATH, entry, "utf-8");
    return res.status(200).json({ ok: true });
  }
  if (req.method === "GET") {
    try {
      const data = await fs.readFile(MESSAGES_PATH, "utf-8");
      const messages = data
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
      return res.status(200).json({ messages });
    } catch {
      return res.status(200).json({ messages: [] });
    }
  }
  res.status(405).json({ error: "Method not allowed" });
}
