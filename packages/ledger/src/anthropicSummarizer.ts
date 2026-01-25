// Anthropic Claude Sonnet 4.5 Summarizer for Bickford
import Anthropic from "@anthropic-ai/sdk";
import type { ConversationMessage } from "@bickford/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function anthropicSummarizer(
  messages: ConversationMessage[],
): Promise<ConversationMessage> {
  const conversationText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `Summarize this conversation concisely, preserving key decisions, code, and commitments:\n\n${conversationText}`,
      },
    ],
  });
  return {
    role: "system",
    content: `[Summary]\n${response.content[0].text}`,
  };
}
