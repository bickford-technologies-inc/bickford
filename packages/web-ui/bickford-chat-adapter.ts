// Stub implementation for bickford-chat-adapter to unblock build
// Replace with real logic as needed

import type {
  ChatMessage as CanonicalChatMessage,
  ChatRole as CanonicalChatRole,
  ChatThread as CanonicalChatThread,
} from "@bickford/chat";

type Message = {
  id: string;
  role: string;
  content: string;
};

type Thread = {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt?: string;
  messages: Message[];
};

export function toCanonicalMessage(msg: Message): CanonicalChatMessage {
  return {
    id: msg.id,
    role: msg.role as CanonicalChatRole,
    content: msg.content,
    createdAt: new Date().toISOString(),
  };
}

export function fromCanonicalMessage(msg: CanonicalChatMessage): Message {
  return {
    id: msg.id,
    role: msg.role,
    content: msg.content,
  };
}

export function toCanonicalThread(thread: Thread): CanonicalChatThread {
  return {
    id: thread.id,
    title: thread.title,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt ?? thread.createdAt,
    messages: thread.messages.map(toCanonicalMessage),
  };
}

export function fromCanonicalThread(thread: CanonicalChatThread): Thread {
  return {
    id: thread.id,
    title: thread.title,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    messages: thread.messages.map(fromCanonicalMessage),
  };
}
