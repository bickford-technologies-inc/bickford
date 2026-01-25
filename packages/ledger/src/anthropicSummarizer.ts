// Anthropic Claude Sonnet 4.5 Summarizer for Bickford
import type { ConversationMessage } from "@bickford/types";

/**
 * Placeholder for summarization logic.
 * The actual implementation should be injected from outside this package.
 */
export async function anthropicSummarizer(
  messages: ConversationMessage[],
): Promise<ConversationMessage> {
  // TODO: Integrate summarization via allowed service or API layer.
  // For now, return a stub summary.
  const conversationText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");
  return {
    id: "summary-" + Date.now(), // Generate a unique id
    role: "agent", // Use allowed ConversationRole
    content: `[Summary]\n(Summarization not available in canon-enforced package)\n${conversationText.slice(0, 200)}...`,
    timestamp: Date.now(), // Use current timestamp
  };
}
