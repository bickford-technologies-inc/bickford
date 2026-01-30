import type { NextApiRequest, NextApiResponse } from "next";

type QueryResult = { status: string; entries: any[] };
let demoState: { lastQuery: QueryResult | null } = { lastQuery: null };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { action } = req.body || {};
    if (action === "query-ledger") {
      demoState.lastQuery = {
        status: "success",
        entries: [
          { id: "1", action: "ALLOW", timestamp: new Date().toISOString() },
          { id: "2", action: "DENY", timestamp: new Date().toISOString() },
        ],
      };
      return res.status(200).json({ result: demoState.lastQuery });
    }
    if (action === "reset") {
      demoState = { lastQuery: null };
      return res.status(200).json({ result: "reset" });
    }
    return res.status(400).json({ error: "Unknown action" });
  }
  if (req.method === "GET") {
    return res.status(200).json({ state: demoState });
  }
  res.status(405).end();
}
