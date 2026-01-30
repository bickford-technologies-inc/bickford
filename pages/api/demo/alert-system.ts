import type { NextApiRequest, NextApiResponse } from "next";

let demoState = { lastAlert: null };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { action } = req.body || {};
    if (action === "send-alert") {
      demoState.lastAlert = {
        status: "success",
        details: "Alert sent to all channels.",
        timestamp: new Date().toISOString(),
      };
      return res.status(200).json({ result: demoState.lastAlert });
    }
    if (action === "reset") {
      demoState = { lastAlert: null };
      return res.status(200).json({ result: "reset" });
    }
    return res.status(400).json({ error: "Unknown action" });
  }
  if (req.method === "GET") {
    return res.status(200).json({ state: demoState });
  }
  res.status(405).end();
}
