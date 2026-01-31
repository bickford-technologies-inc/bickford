import type { NextApiRequest, NextApiResponse } from "next";

const MESSAGES_PATH = process.cwd() + "/datalake/bronze/messages/messages.jsonl";

interface Message {
  author: string;
  content: string;
  timestamp: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { author, content, timestamp } = req.body || {};
    if (!author || !content || !timestamp) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const message: Message = { author, content, timestamp };
    const entry = JSON.stringify(message) + "\n";

    try {
      await Bun.write(MESSAGES_PATH, entry, { createPath: true });
      return res.status(200).json({ ok: true });
    } catch (err) {
      const error = err as Error;
      console.error("Failed to write message:", error);
      return res.status(500).json({ error: "Failed to write message" });
    }
  }

  if (req.method === "GET") {
    try {
      const file = Bun.file(MESSAGES_PATH);
      const data = await file.text();
      const messages = data
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          try {
            return JSON.parse(line) as Message;
          } catch {
            return null;
          }
        })
        .filter((msg): msg is Message => msg !== null);

      return res.status(200).json({ messages });
    } catch {
      return res.status(200).json({ messages: [] });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
