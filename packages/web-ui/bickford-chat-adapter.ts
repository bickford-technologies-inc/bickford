// Stub implementation for bickford-chat-adapter to unblock build
// Replace with real logic as needed

import type {
  ChatMessage as CanonicalChatMessage,
  ChatRole as CanonicalChatRole,
} from "@bickford/chat";

type Message = {
  id: string;
  role: string;
  content: string;
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
