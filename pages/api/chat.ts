import type { NextApiRequest, NextApiResponse } from "next";
import type { Intent } from "../../core/ExecutionAuthority";
import { authority } from "../../lib/api/authority";

type ChatResponse = {
  allowed: boolean;
  reasoning: string;
  violatedConstraints: string[];
  proofChain: string[];
  metrics: ReturnType<typeof authority.getMetrics>;
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse | ErrorResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { prompt, context = {} } = req.body ?? {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing prompt." });
  }

  const intent: Intent = {
    id: crypto.randomUUID(),
    prompt,
    context,
    timestamp: Date.now(),
  };

  const decision = await authority.execute(intent);

  return res.status(200).json({
    allowed: decision.allowed,
    reasoning: decision.reasoning,
    violatedConstraints: decision.violatedConstraints ?? [],
    proofChain: decision.proofChain ?? [],
    metrics: authority.getMetrics(),
  });
}
