import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { message } = req.body ?? {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Missing message." });
  }

  try {
    const completion = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 256,
      messages: [{ role: "user", content: message }],
    });
    // Find the first text block
    const textBlock = Array.isArray(completion.content)
      ? completion.content.find(
          (block: any) =>
            block && block.type === "text" && typeof block.text === "string",
        )
      : null;
    const reply = textBlock ? textBlock.text : "[No response]";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Anthropic API error:", err);
    return res.status(500).json({ error: "Anthropic API error" });
  }
}
