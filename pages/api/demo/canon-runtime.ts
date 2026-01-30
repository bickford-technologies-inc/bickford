import type { NextApiRequest, NextApiResponse } from "next";

type DiagnosticsResult = { status: string; details: string; timestamp: string };
let demoState: { diagnostics: DiagnosticsResult | null } = {
  diagnostics: null,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { action } = req.body || {};
    if (action === "run-diagnostics") {
      demoState.diagnostics = {
        status: "success",
        details: "All systems operational. No violations detected.",
        timestamp: new Date().toISOString(),
      };
      return res.status(200).json({ result: demoState.diagnostics });
    }
    if (action === "reset") {
      demoState = { diagnostics: null };
      return res.status(200).json({ result: "reset" });
    }
    return res.status(400).json({ error: "Unknown action" });
  }
  if (req.method === "GET") {
    return res.status(200).json({ state: demoState });
  }
  res.status(405).end();
}
