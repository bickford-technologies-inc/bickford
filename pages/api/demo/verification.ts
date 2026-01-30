import type { NextApiRequest, NextApiResponse } from "next";

let demoState = { lastVerification: null };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { action } = req.body || {};
    if (action === "run-verification") {
      demoState.lastVerification = {
        status: "success",
        details: "All hashes match. No drift detected.",
        timestamp: new Date().toISOString(),
      };
      return res.status(200).json({ result: demoState.lastVerification });
    }
    if (action === "reset") {
      demoState = { lastVerification: null };
      return res.status(200).json({ result: "reset" });
    }
    return res.status(400).json({ error: "Unknown action" });
  }
  if (req.method === "GET") {
    return res.status(200).json({ state: demoState });
  }
  res.status(405).end();
}
