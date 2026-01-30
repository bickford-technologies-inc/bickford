// API route stub for Bickford Chat (for Next.js/Node.js or similar)
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST for chat
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  // Always return coming soon
  res.status(200).json({ reply: "Coming soon!" });
}
