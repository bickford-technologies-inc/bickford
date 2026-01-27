// Node.js-safe version of conversationMemory
import type {
  ConversationMemoryMatch,
  ConversationMemoryOptions,
} from "@bickford/types";

// Node.js stub: always returns empty matches
export async function searchConversationMemory(
  query: string,
  options: ConversationMemoryOptions = {},
): Promise<ConversationMemoryMatch[]> {
  return [];
}

export function buildConversationMemoryContext(
  matches: ConversationMemoryMatch[],
): string {
  return "";
}
