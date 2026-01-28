import type { ChatMessage, ChatMessageMetadata, ChatThread, ChatThreadMetadata, ChatRole, ISO8601 } from "./types";

type CreateThreadInput = {
  id?: string;
  title?: string;
  createdAt?: ISO8601;
  metadata?: ChatThreadMetadata;
};

type CreateMessageInput = {
  id?: string;
  role: ChatRole;
  content: string;
  createdAt?: ISO8601;
  metadata?: ChatMessageMetadata;
};

const nowIso = (): ISO8601 => new Date().toISOString();

const nextId = (): string => crypto.randomUUID();

export const createChatThread = ({
  id,
  title,
  createdAt,
  metadata,
}: CreateThreadInput = {}): ChatThread => {
  const timestamp = createdAt ?? nowIso();
  return {
    id: id ?? nextId(),
    title,
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: [],
    metadata: metadata ? { ...metadata } : undefined,
  };
};

export const createChatMessage = ({
  id,
  role,
  content,
  createdAt,
  metadata,
}: CreateMessageInput): ChatMessage => {
  return {
    id: id ?? nextId(),
    role,
    content,
    createdAt: createdAt ?? nowIso(),
    metadata: metadata ? { ...metadata } : undefined,
  };
};

export const appendChatMessage = (thread: ChatThread, message: ChatMessage): ChatThread => {
  return {
    ...thread,
    messages: [...thread.messages, message],
    updatedAt: nowIso(),
  };
};

export const updateChatThreadMetadata = (
  thread: ChatThread,
  metadata: ChatThreadMetadata,
): ChatThread => {
  return {
    ...thread,
    metadata: {
      ...thread.metadata,
      ...metadata,
    },
    updatedAt: nowIso(),
  };
};
