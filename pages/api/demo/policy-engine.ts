import type { NextApiRequest, NextApiResponse } from "next";

let demoState = { testResult: null };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { action } = req.body || {};
    if (action === "test-rules") {
      demoState.testResult = {
        status: "success",
        details: "All policy rules passed. No conflicts detected.",
        timestamp: new Date().toISOString(),
      };
      return res.status(200).json({ result: demoState.testResult });
    }
    if (action === "reset") {
      demoState = { testResult: null };
      return res.status(200).json({ result: "reset" });
    }
    return res.status(400).json({ error: "Unknown action" });
  }
  if (req.method === "GET") {
    return res.status(200).json({ state: demoState });
  }
  res.status(405).end();
}
