import type { NextApiRequest, NextApiResponse } from "next";

let demoState = { lastAudit: null };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { action } = req.body || {};
    if (action === "run-finance-audit") {
      demoState.lastAudit = {
        status: "success",
        details: "Finance audit complete. All transactions reconciled.",
        timestamp: new Date().toISOString(),
      };
      return res.status(200).json({ result: demoState.lastAudit });
    }
    if (action === "reset") {
      demoState = { lastAudit: null };
      return res.status(200).json({ result: "reset" });
    }
    return res.status(400).json({ error: "Unknown action" });
  }
  if (req.method === "GET") {
    return res.status(200).json({ state: demoState });
  }
  res.status(405).end();
}
