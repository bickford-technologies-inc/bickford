import type {
  Conversation,
  ConversationMemoryMatch,
  ConversationMemoryOptions,
  ConversationRole,
} from "@bickford/types";

import { listConversationSummaries, readConversation } from "./conversationStore";

const DEFAULT_LIMIT = 5;
const DEFAULT_MIN_SCORE = 0.12;
const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "from",
  "has",
  "have",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "that",
  "the",
  "their",
  "to",
  "was",
  "were",
  "will",
  "with",
]);

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(
      (token) => token.length > 1 && !STOPWORDS.has(token.toLowerCase()),
    );
}

function termFrequency(tokens: string[]) {
  const freq = new Map<string, number>();
  tokens.forEach((token) => {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  });
  return freq;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>) {
  if (a.size === 0 || b.size === 0) {
    return 0;
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const [token, count] of a.entries()) {
    const bCount = b.get(token) ?? 0;
    dot += count * bCount;
    normA += count * count;
  }
  for (const count of b.values()) {
    normB += count * count;
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function scoreMatch(query: string, content: string) {
  const queryTokens = tokenize(query);
  const contentTokens = tokenize(content);
  if (queryTokens.length === 0 || contentTokens.length === 0) {
    return 0;
  }
  return cosineSimilarity(termFrequency(queryTokens), termFrequency(contentTokens));
}

function shouldIncludeRole(
  role: ConversationRole,
  includeRoles?: ConversationRole[],
) {
  if (!includeRoles || includeRoles.length === 0) {
    return true;
  }
  return includeRoles.includes(role);
}

async function loadConversations(): Promise<Conversation[]> {
  const summaries = await listConversationSummaries();
  const conversations = await Promise.all(
    summaries.map((summary) => readConversation(summary.id)),
  );
  return conversations.filter(
    (conversation): conversation is Conversation => Boolean(conversation),
  );
}

export async function searchConversationMemory(
  query: string,
  options: ConversationMemoryOptions = {},
): Promise<ConversationMemoryMatch[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }
  const {
    limit = DEFAULT_LIMIT,
    minScore = DEFAULT_MIN_SCORE,
    excludeConversationId,
    includeRoles,
  } = options;

  const conversations = await loadConversations();
  const matches: ConversationMemoryMatch[] = [];

  conversations.forEach((conversation) => {
    if (excludeConversationId && conversation.id === excludeConversationId) {
      return;
    }
    conversation.messages.forEach((message) => {
      if (!shouldIncludeRole(message.role, includeRoles)) {
        return;
      }
      const score = scoreMatch(trimmedQuery, message.content);
      if (score < minScore) {
        return;
      }
      matches.push({
        conversationId: conversation.id,
        conversationTitle: conversation.title,
        messageId: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
        score,
      });
    });
  });

  return matches
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.timestamp - a.timestamp;
    })
    .slice(0, limit);
}

export function buildConversationMemoryContext(
  matches: ConversationMemoryMatch[],
): string {
  if (matches.length === 0) {
    return "";
  }
  return matches
    .map((match) => {
      const roleLabel = match.role === "user" ? "User" : "Agent";
      return [
        `Conversation: ${match.conversationTitle} (${match.conversationId})`,
        `${roleLabel}: ${match.content}`,
        `Score: ${match.score.toFixed(3)}`,
      ].join("\n");
    })
    .join("\n\n");
}
