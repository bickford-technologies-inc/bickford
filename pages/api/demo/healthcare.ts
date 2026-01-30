import type { NextApiRequest, NextApiResponse } from "next";

type HealthcareResult = { status: string; details: string; timestamp: string };
let demoState: { lastCheck: HealthcareResult | null } = { lastCheck: null };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { action } = req.body || {};
    if (action === "run-hipaa-check") {
      demoState.lastCheck = {
        status: "success",
        details: "HIPAA compliance verified. No PHI violations detected.",
        timestamp: new Date().toISOString(),
      };
      return res.status(200).json({ result: demoState.lastCheck });
    }
    if (action === "reset") {
      demoState = { lastCheck: null };
      return res.status(200).json({ result: "reset" });
    }
    return res.status(400).json({ error: "Unknown action" });
  }
  if (req.method === "GET") {
    return res.status(200).json({ state: demoState });
  }
  res.status(405).end();
}
