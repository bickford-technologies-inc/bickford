/**
 * Bickford Chat - Canonical types for chat sessions and events.
 */

export type ISO8601 = string;

export type ChatRole = "system" | "user" | "assistant" | "tool";

export type ChatMessageMetadata = {
  intentId?: string;
  model?: string;
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
  tags?: string[];
  attributes?: Record<string, string>;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: ISO8601;
  metadata?: ChatMessageMetadata;
};

export type ChatThreadMetadata = {
  canonId?: string;
  tenantId?: string;
  ownerId?: string;
  status?: "open" | "closed" | "archived";
  tags?: string[];
  attributes?: Record<string, string>;
};

export type ChatThread = {
  id: string;
  title?: string;
  createdAt: ISO8601;
  updatedAt: ISO8601;
  messages: ChatMessage[];
  metadata?: ChatThreadMetadata;
};

export type ChatEventType =
  | "chat.thread.created"
  | "chat.message.appended"
  | "chat.thread.updated"
  | "chat.thread.closed";

export type ChatEvent = {
  eventType: ChatEventType;
  eventId: string;
  timestamp: ISO8601;
  threadId: string;
  messageId?: string;
  payload?: Record<string, string>;
};
