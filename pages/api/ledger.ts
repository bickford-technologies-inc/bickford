import { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";

const LEDGER_PATH = path.join(process.cwd(), "execution-ledger.jsonl");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const data = await fs.readFile(LEDGER_PATH, "utf-8");
    const entries = data
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
    res.status(200).json({ entries });
  } catch (err) {
    res.status(500).json({ error: "Failed to read ledger." });
  }
}
