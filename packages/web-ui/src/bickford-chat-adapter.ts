// NOTE: This file now uses canonical types from @bickford/chat
// Adapter to use @bickford/chat canonical types in web-ui
import type {
  ChatThread as CanonicalChatThread,
  ChatMessage as CanonicalChatMessage,
  ChatRole as CanonicalChatRole,
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
  messages: Message[];
};

type Role = string;

// Convert legacy Message to CanonicalChatMessage
export function toCanonicalMessage(msg: Message): CanonicalChatMessage {
  return {
    id: msg.id,
    role: msg.role as CanonicalChatRole,
    content: msg.content,
    createdAt: new Date().toISOString(),
  };
}

// Convert legacy Thread to CanonicalChatThread
export function toCanonicalThread(thread: Thread): CanonicalChatThread {
  return {
    id: thread.id,
    title: thread.title,
    createdAt: thread.createdAt,
    updatedAt: thread.createdAt,
    messages: thread.messages.map(toCanonicalMessage),
  };
}

// Convert CanonicalChatMessage to legacy Message
export function fromCanonicalMessage(msg: CanonicalChatMessage): Message {
  return {
    id: msg.id,
    role: msg.role as Role,
    content: msg.content,
  };
}
