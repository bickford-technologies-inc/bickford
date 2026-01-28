// NOTE: This file now uses canonical types from @bickford/chat via bickford-chat-adapter
import { toCanonicalMessage, fromCanonicalMessage } from "../bickford-chat-adapter";
// Adapter to use @bickford/chat canonical types in web-ui
import type {
  ChatThread as CanonicalChatThread,
  ChatMessage as CanonicalChatMessage,
  ChatRole as CanonicalChatRole,
} from "@bickford/chat";

// Legacy types in web-ui
import type { Thread, Message, Role } from "./chat-types";

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

// Convert CanonicalChatThread to legacy Thread
export function fromCanonicalThread(thread: CanonicalChatThread): Thread {
  return {
    id: thread.id,
    title: thread.title ?? "",
    createdAt: thread.createdAt,
    messages: thread.messages.map(fromCanonicalMessage),
  };
}
