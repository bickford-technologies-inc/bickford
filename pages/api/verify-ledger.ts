import type { NextApiRequest, NextApiResponse } from "next";
import { verifyHashChain } from "../../lib/hashDecisionTrace";
import { enforceCanon } from "../../lib/ledger";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { ledger } = req.body;
    if (!ledger || typeof ledger !== "string") {
      return res.status(400).json({ error: "Missing or invalid ledger data." });
    }
    // Parse ledger (assume JSONL string)
    const lines = ledger.trim().split(/\r?\n/).filter(Boolean);
    const entries = lines.map((line) => JSON.parse(line));

    // Hash chain validation
    const hashResult = verifyHashChain(entries);
    // Canonical constraint validation (optional, can be expanded)
    let canonResult = { valid: true, violations: [] };
    try {
      enforceCanon(entries);
    } catch (e: any) {
      canonResult = { valid: false, violations: [e.message] };
    }

    res.status(200).json({
      hashChain: hashResult,
      canon: canonResult,
      valid: hashResult.valid && canonResult.valid,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
